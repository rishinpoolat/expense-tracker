# Expense Tracker

A full-stack personal expense tracking application built with .NET 9 and React, following Clean Architecture principles.

## Tech Stack

### Backend
- **.NET 9** — Web API
- **Entity Framework Core** — ORM with SQLite
- **ASP.NET Core Identity** — User management & password hashing
- **JWT** — Token-based authentication
- **Google.Apis.Auth** — Google OAuth ID token verification
- **AutoMapper** — Object mapping
- **FluentValidation** — Input validation

### Frontend
- **React 19** — UI library
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Tailwind CSS** — Styling
- **React Router v7** — Navigation
- **Axios** — HTTP client
- **Recharts** — Data visualisation
- **Google Identity Services** — Google Sign-In button

## Architecture

The backend follows **Clean Architecture** with a strict one-way dependency rule:

```
backend/
├── ExpenseTracker.Core/           # Domain layer — no dependencies
│   ├── Entities/                  # User, Expense, Category
│   ├── Enums/                     # ExpenseCategory
│   └── Interfaces/                # IExpenseRepository, ICategoryRepository,
│                                  # ITokenService, IGoogleTokenVerifier
│
├── ExpenseTracker.Application/    # Use-case layer — depends on Core only
│   ├── DTOs/                      # Auth, Expense, Category DTOs
│   ├── Interfaces/                # IAuthService, IExpenseService
│   ├── Services/                  # AuthService, ExpenseService
│   ├── Mappings/                  # AutoMapper profiles
│   └── Validators/                # FluentValidation validators
│
├── ExpenseTracker.Infrastructure/ # Data/external layer — depends on Core only
│   ├── Data/                      # ApplicationDbContext (EF Core + Identity)
│   ├── Repositories/              # ExpenseRepository, CategoryRepository
│   └── Services/                  # TokenService, OcrService, GoogleTokenVerifier
│
└── ExpenseTracker.API/            # Presentation layer — depends on Application + Infrastructure
    ├── Controllers/               # AuthController, ExpensesController, CategoriesController
    ├── Extensions/                # DI wiring, middleware pipeline
    └── Program.cs                 # Entry point
```

### Dependency Rule

```
Core  ←  Application
Core  ←  Infrastructure
Application + Infrastructure  ←  API
```

Core has zero outward dependencies. Nothing inside Core may reference Application, Infrastructure, or API.

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)

### 1. Configure Google OAuth (required for Google Sign-In)

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**
2. Create an **OAuth 2.0 Client ID** (type: Web application)
3. Add `http://localhost:5173` to **Authorised JavaScript origins**
4. Copy the client ID into `backend/ExpenseTracker.API/appsettings.json` under `Google.ClientId`
5. Add your Gmail as a test user under **OAuth consent screen → Test users**

> Google Sign-In requires this step. Email/password login works without it.

### 2. Run the backend

```bash
cd backend/ExpenseTracker.API
dotnet run
```

API starts at **http://localhost:5274**. The SQLite database (`ExpenseTracker.db`) is created automatically on first run — no database setup needed.

### 3. Run the frontend

```bash
cd frontend
npm install   # first time only
npm run dev
```

App opens at **http://localhost:5173**.

### Usage

1. Open **http://localhost:5173**
2. Sign up with email/password **or** click **Sign in with Google**
3. Add expenses, upload receipt photos, filter by date range, view charts

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register with email + password |
| POST | `/api/auth/login` | Login with email + password |
| POST | `/api/auth/google` | Login / register with Google ID token |
| GET | `/api/auth/check-email/{email}` | Check if email is already registered |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all expenses for the authenticated user |
| GET | `/api/expenses/{id}` | Get a single expense |
| POST | `/api/expenses` | Create an expense |
| PUT | `/api/expenses/{id}` | Update an expense |
| DELETE | `/api/expenses/{id}` | Delete an expense |
| GET | `/api/expenses/category/{id}` | Filter expenses by category |
| GET | `/api/expenses/date-range` | Filter by `?startDate=&endDate=` |
| GET | `/api/expenses/total` | Sum of all expenses |
| GET | `/api/expenses/total/category/{id}` | Sum by category |
| POST | `/api/expenses/process-receipt` | Extract data from a receipt image (OCR) |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| GET | `/api/categories/{id}` | Get a single category |

All expense and category endpoints require a `Authorization: Bearer <token>` header.

## Configuration

`backend/ExpenseTracker.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=ExpenseTracker.db"
  },
  "JwtSettings": {
    "SecretKey": "<at-least-32-char-secret>",
    "Issuer": "ExpenseTrackerAPI",
    "Audience": "ExpenseTrackerClient",
    "ExpirationHours": 24
  },
  "Google": {
    "ClientId": "<your-oauth-client-id>"
  },
  "OcrSpace": {
    "ApiKey": "<your-ocr-space-api-key>"
  }
}
```

## Testing

```bash
# Frontend (vitest)
cd frontend && npm test

# Backend — no test project yet
```

## License

Personal / educational use.
