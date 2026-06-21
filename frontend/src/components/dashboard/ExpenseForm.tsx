import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import type { CreateExpenseDto, UpdateExpenseDto, Category, Expense } from '../../types/expense';
import { expenseService } from '../../services/expenseService';
import './ExpenseForm.css';

interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (expense: CreateExpenseDto | UpdateExpenseDto) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onSubmit, onCancel, loading = false }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: expense?.title || '',
    description: expense?.description || '',
    amount: expense?.amount || 0,
    expenseDate: expense?.expenseDate ? expense.expenseDate.split('T')[0] : new Date().toISOString().split('T')[0],
    notes: expense?.notes || '',
    categoryId: expense?.categoryId || 0
  });
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<string>('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await expenseService.getCategories();
        setCategories(data);
        if (!expense && data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: data[0].id }));
        }
      } catch (err) {
        setError('Failed to load categories');
      }
    };

    fetchCategories();
  }, [expense]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'categoryId' ? Number(value) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    } else {
      setError('Please select a valid image file');
    }
  };

  const parseReceiptText = (text: string) => {
    console.log('OCR Text:', text); // Debug logging
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    let extractedData = {
      title: '',
      amount: 0,
      date: '',
      merchant: ''
    };

    // Improved amount extraction - look for total patterns first
    const totalPatterns = [
      /(?:total|subtotal|amount|sum)[\s:]*\$?\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/i,
      /\$\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/g,
      /(\d{1,4}(?:,\d{3})*\.\d{2})/g
    ];

    let foundAmount = false;
    for (const pattern of totalPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          const amountMatch = match.match(/(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/);
          if (amountMatch) {
            const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
            if (amount > 0 && amount < 10000) { // Reasonable amount range
              extractedData.amount = Math.max(extractedData.amount, amount);
              foundAmount = true;
            }
          }
        }
      }
      if (foundAmount) break;
    }

    // Improved date extraction with better patterns
    const datePatterns = [
      /(?:date|issued|receipt date)[\s:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/g,
      /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/g
    ];

    for (const pattern of datePatterns) {
      const dateMatch = text.match(pattern);
      if (dateMatch) {
        const dateStr = dateMatch[1] || dateMatch[0];
        try {
          // Try different date formats
          const formats = [dateStr, dateStr.replace(/\./g, '/'), dateStr.replace(/-/g, '/')];
          for (const format of formats) {
            const parsedDate = new Date(format);
            if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 2000) {
              extractedData.date = parsedDate.toISOString().split('T')[0];
              break;
            }
          }
        } catch (e) {
          console.log('Date parsing error:', e);
        }
        if (extractedData.date) break;
      }
    }

    // Improved merchant extraction - look for business names in first few lines
    const skipWords = ['online', 'receipt', 'invoice', 'bill', 'total', 'subtotal', 'amount', 'qty', 'description'];
    const amountRegex = /[\$£€¥]?\s*\d+/;
    const dateRegex = /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/;

    for (const line of lines.slice(0, 8)) {
      const cleanLine = line.toLowerCase();
      const isSkipWord = skipWords.some(word => cleanLine.includes(word));
      const hasAmount = amountRegex.test(line);
      const hasDate = dateRegex.test(line);
      const isShort = line.length < 3;
      const isLong = line.length > 50;
      
      if (!isSkipWord && !hasAmount && !hasDate && !isShort && !isLong) {
        // Look for business names that might contain "Inc", "LLC", "Co", etc.
        if (line.match(/\b(inc|llc|ltd|co|corp|company|store|shop|restaurant|cafe|market)\b/i) ||
            line.length > 5) {
          extractedData.merchant = line;
          extractedData.title = `Purchase at ${line}`;
          break;
        }
      }
    }

    // Fallback merchant extraction - just take the first meaningful line
    if (!extractedData.merchant) {
      for (const line of lines.slice(0, 3)) {
        if (line.length > 2 && line.length < 50 && 
            !amountRegex.test(line) && !dateRegex.test(line)) {
          extractedData.merchant = line;
          extractedData.title = `Purchase at ${line}`;
          break;
        }
      }
    }

    // Final fallback
    if (!extractedData.title) {
      extractedData.title = 'Receipt Purchase';
    }

    console.log('Extracted:', extractedData); // Debug logging
    return extractedData;
  };

  const processReceipt = async () => {
    if (!selectedFile) return;

    setOcrLoading(true);
    setError('');
    setOcrProgress('Initializing OCR...');

    try {
      // Try backend OCR first (if available), fallback to client-side Tesseract
      let extractedData;
      
      try {
        // Attempt backend OCR processing
        setOcrProgress('Processing with server OCR...');
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const response = await fetch('/api/expenses/process-receipt', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (response.ok) {
          const backendData = await response.json();
          extractedData = {
            title: backendData.title,
            amount: backendData.amount,
            date: backendData.date ? backendData.date.split('T')[0] : new Date().toISOString().split('T')[0],
            merchant: backendData.merchant
          };
        } else {
          throw new Error('Backend OCR failed');
        }
      } catch (backendError) {
        // Fallback to client-side OCR
        setOcrProgress('Using local OCR processing...');
        const { data: { text } } = await Tesseract.recognize(
          selectedFile,
          'eng',
          {
            logger: m => {
              if (m.status === 'recognizing text') {
                setOcrProgress(`Processing... ${Math.round(m.progress * 100)}%`);
              }
            }
          }
        );

        setOcrProgress('Extracting expense details...');
        extractedData = parseReceiptText(text);
      }

      // Update form with extracted data
      setFormData(prev => ({
        ...prev,
        title: extractedData.title || prev.title,
        amount: extractedData.amount || prev.amount,
        expenseDate: extractedData.date || prev.expenseDate,
        description: extractedData.merchant ? `Receipt from ${extractedData.merchant}` : prev.description
      }));

      setOcrProgress('');
      setSelectedFile(null);
    } catch (err) {
      setError('Failed to process receipt. Please try again or enter details manually.');
      console.error('OCR Error:', err);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (formData.categoryId === 0) {
      setError('Please select a category');
      return;
    }

    const expenseData = {
      ...formData,
      expenseDate: new Date(formData.expenseDate).toISOString()
    };

    if (expense) {
      onSubmit({ ...expenseData, id: expense.id } as UpdateExpenseDto);
    } else {
      onSubmit(expenseData as CreateExpenseDto);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <div className="form-content">
        {error && <div className="error-message">{error}</div>}
        
        {/* Receipt Upload Section */}
        <div className="form-group receipt-upload">
        <label>📷 Scan Receipt (Optional)</label>
        <div className="receipt-upload-area">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={ocrLoading}
            className="file-input"
          />
          {selectedFile && (
            <div className="selected-file">
              <span>Selected: {selectedFile.name}</span>
              <button
                type="button"
                onClick={processReceipt}
                disabled={ocrLoading}
                className="btn-process-receipt"
              >
                {ocrLoading ? 'Processing...' : 'Extract Details'}
              </button>
            </div>
          )}
          {ocrProgress && (
            <div className="ocr-progress">
              {ocrProgress}
            </div>
          )}
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter expense title"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="amount">Amount *</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="0.00"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="categoryId">Category *</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
          >
            <option value={0}>Select category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="expenseDate">Date *</label>
        <input
          type="date"
          id="expenseDate"
          name="expenseDate"
          value={formData.expenseDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter description (optional)"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional notes (optional)"
          rows={2}
        />
      </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? (expense ? 'Updating...' : 'Creating...') : (expense ? 'Update' : 'Create')}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;