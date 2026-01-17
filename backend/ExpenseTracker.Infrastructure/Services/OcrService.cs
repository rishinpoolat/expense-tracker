using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;

namespace ExpenseTracker.Infrastructure.Services
{
    public class OcrService
    {
        private readonly HttpClient _httpClient;
        private readonly string _ocrSpaceApiKey;

        public OcrService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _ocrSpaceApiKey = configuration["OcrSpace:ApiKey"] ?? "";
        }

        public async Task<ReceiptData> ProcessReceiptAsync(byte[] imageBytes, string fileName)
        {
            if (string.IsNullOrEmpty(_ocrSpaceApiKey))
            {
                // Fallback to basic text processing if no API key
                return new ReceiptData
                {
                    Title = "Manual Entry Required",
                    Amount = 0,
                    Date = DateTime.Now,
                    Merchant = "Unknown"
                };
            }

            try
            {
                var text = await ExtractTextFromImageAsync(imageBytes, fileName);
                return ParseReceiptText(text);
            }
            catch (Exception)
            {
                // Return empty data if OCR fails
                return new ReceiptData
                {
                    Title = "OCR Processing Failed",
                    Amount = 0,
                    Date = DateTime.Now,
                    Merchant = "Unknown"
                };
            }
        }

        private async Task<string> ExtractTextFromImageAsync(byte[] imageBytes, string fileName)
        {
            using var content = new MultipartFormDataContent();
            content.Add(new StringContent(_ocrSpaceApiKey), "apikey");
            content.Add(new StringContent("2"), "OCREngine"); // Use Engine 2 for better accuracy
            content.Add(new StringContent("true"), "detectOrientation");
            content.Add(new StringContent("true"), "scale");
            content.Add(new ByteArrayContent(imageBytes), "file", fileName);

            var response = await _httpClient.PostAsync("https://api.ocr.space/parse/image", content);
            var responseContent = await response.Content.ReadAsStringAsync();

            var ocrResult = JsonSerializer.Deserialize<OcrSpaceResponse>(responseContent);

            if (ocrResult?.ParsedResults?.Length > 0)
            {
                return ocrResult.ParsedResults[0].ParsedText ?? "";
            }

            return "";
        }

        private ReceiptData ParseReceiptText(string text)
        {
            var receiptData = new ReceiptData
            {
                Title = "",
                Amount = 0,
                Date = DateTime.Now,
                Merchant = ""
            };

            if (string.IsNullOrWhiteSpace(text))
                return receiptData;

            var lines = text.Split('\n')
                           .Select(line => line.Trim())
                           .Where(line => !string.IsNullOrWhiteSpace(line))
                           .ToArray();

            // Improved amount extraction - look for total patterns first
            var totalPatterns = new[]
            {
                @"(?:total|subtotal|amount|sum)[\s:]*\$?\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)",
                @"\$\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)",
                @"(\d{1,4}(?:,\d{3})*\.\d{2})"
            };

            bool foundAmount = false;
            foreach (var pattern in totalPatterns)
            {
                var matches = Regex.Matches(text, pattern, RegexOptions.IgnoreCase);
                foreach (Match match in matches)
                {
                    var amountStr = match.Groups[1].Value.Replace(",", "");
                    if (decimal.TryParse(amountStr, out var amount) && amount > 0 && amount < 10000)
                    {
                        receiptData.Amount = Math.Max(receiptData.Amount, amount);
                        foundAmount = true;
                    }
                }
                if (foundAmount) break;
            }

            // Improved date extraction with better patterns
            var datePatterns = new[]
            {
                @"(?:date|issued|receipt date)[\s:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})",
                @"(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})",
                @"(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})"
            };

            foreach (var pattern in datePatterns)
            {
                var dateMatch = Regex.Match(text, pattern, RegexOptions.IgnoreCase);
                if (dateMatch.Success)
                {
                    var dateStr = dateMatch.Groups[1].Success ? dateMatch.Groups[1].Value : dateMatch.Value;

                    // Try different date formats
                    var formats = new[] { dateStr, dateStr.Replace(".", "/"), dateStr.Replace("-", "/") };
                    foreach (var format in formats)
                    {
                        if (DateTime.TryParse(format, out var parsedDate) && parsedDate.Year > 2000)
                        {
                            receiptData.Date = parsedDate;
                            goto DateFound;
                        }
                    }
                }
            }
            DateFound:

            // Improved merchant extraction - look for business names in first few lines
            var skipWords = new[] { "online", "receipt", "invoice", "bill", "total", "subtotal", "amount", "qty", "description" };
            var amountRegex = new Regex(@"[\$£€¥]?\s*\d+");
            var dateRegex = new Regex(@"\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}");

            foreach (var line in lines.Take(8))
            {
                var cleanLine = line.ToLower();
                var isSkipWord = skipWords.Any(word => cleanLine.Contains(word));
                var hasAmount = amountRegex.IsMatch(line);
                var hasDate = dateRegex.IsMatch(line);
                var isShort = line.Length < 3;
                var isLong = line.Length > 50;

                if (!isSkipWord && !hasAmount && !hasDate && !isShort && !isLong)
                {
                    // Look for business names that might contain "Inc", "LLC", "Co", etc.
                    if (Regex.IsMatch(line, @"\b(inc|llc|ltd|co|corp|company|store|shop|restaurant|cafe|market)\b", RegexOptions.IgnoreCase) ||
                        line.Length > 5)
                    {
                        receiptData.Merchant = line;
                        receiptData.Title = $"Purchase at {line}";
                        break;
                    }
                }
            }

            // Fallback merchant extraction - just take the first meaningful line
            if (string.IsNullOrEmpty(receiptData.Merchant))
            {
                foreach (var line in lines.Take(3))
                {
                    if (line.Length > 2 && line.Length < 50 &&
                        !amountRegex.IsMatch(line) && !dateRegex.IsMatch(line))
                    {
                        receiptData.Merchant = line;
                        receiptData.Title = $"Purchase at {line}";
                        break;
                    }
                }
            }

            // Final fallback
            if (string.IsNullOrEmpty(receiptData.Title))
            {
                receiptData.Title = "Receipt Purchase";
            }

            return receiptData;
        }
    }

    public class ReceiptData
    {
        public string Title { get; set; } = "";
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string Merchant { get; set; } = "";
    }

    // OCR.space API response models
    public class OcrSpaceResponse
    {
        public ParsedResult[]? ParsedResults { get; set; }
        public int OCRExitCode { get; set; }
        public bool IsErroredOnProcessing { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class ParsedResult
    {
        public string? ParsedText { get; set; }
        public int ErrorCode { get; set; }
        public string? ErrorDetails { get; set; }
    }
}
