using ExpenseTracker.API.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services using extension methods
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddIdentityServices();
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddControllers();
builder.Services.AddApiDocumentation();

var app = builder.Build();

// Configure pipeline
app.ConfigurePipeline();

app.Run();