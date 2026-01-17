# Expense Tracker

A full-stack expense tracking application built with .NET 9 and React, following Clean Architecture principles.

## Tech Stack

### Backend
- **.NET 9** - Web API
- **Entity Framework Core** - ORM with SQLite
- **ASP.NET Core Identity** - Authentication & Authorization
- **JWT** - Token-based authentication
- **AutoMapper** - Object mapping
- **FluentValidation** - Input validation

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Recharts** - Data visualization

## Architecture

The backend follows **Clean Architecture** principles with clear separation of concerns:

```
backend/
├── ExpenseTracker.Core/           # Domain Layer (innermost)
│   ├── Entities/                  # Domain models
│   ├── Enums/                     # Domain enumerations
│   └── Interfaces/                # Repository & service contracts
│
├── ExpenseTracker.Application/    # Application Layer
│   ├── DTOs/                      # Data transfer objects
│   ├── Interfaces/                # Application service contracts
│   ├── Services/                  # Business logic orchestration
│   ├── Mappings/                  # AutoMapper profiles
│   └── Validators/                # FluentValidation validators
│
├── ExpenseTracker.Infrastructure/ # Infrastructure Layer
│   ├── Data/                      # DbContext
│   ├── Repositories/              # Repository implementations
│   └── Services/                  # External service implementations
│
└── ExpenseTracker.API/            # Presentation Layer (outermost)
    ├── Controllers/               # API endpoints
    ├── Extensions/                # DI configuration
    └── Program.cs                 # Application entry point
```

### Dependency Flow

```
        API
         │
    ┌────┴────┐
    ▼         ▼
Application  Infrastructure
    │         │
    └────┬────┘
         ▼
       Core
```

- **Core**: No dependencies (pure domain)
- **Application**: References Core only
- **Infrastructure**: References Core only
- **API**: References Application and Infrastructure

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- npm or yarn

### Running the Backend

```bash
cd backend/ExpenseTracker.API
dotnet run
```

The API will start at `http://localhost:5000`

### Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:5173`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all user expenses |
| GET | `/api/expenses/{id}` | Get expense by ID |
| POST | `/api/expenses` | Create new expense |
| PUT | `/api/expenses/{id}` | Update expense |
| DELETE | `/api/expenses/{id}` | Delete expense |
| GET | `/api/expenses/category/{id}` | Get expenses by category |
| GET | `/api/expenses/date-range` | Get expenses by date range |
| GET | `/api/expenses/total` | Get total expenses |
| POST | `/api/expenses/process-receipt` | Process receipt image (OCR) |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/{id}` | Get category by ID |

## Project Structure

### Core Layer
Contains domain entities and interfaces:
- `User`, `Expense`, `Category` - Domain entities
- `IExpenseRepository`, `ICategoryRepository` - Repository contracts
- `ITokenService` - Infrastructure service contract

### Application Layer
Contains business logic:
- `AuthService` - Authentication orchestration
- `ExpenseService` - Expense management orchestration
- DTOs for API communication
- Validators for input validation

### Infrastructure Layer
Contains external concerns:
- `ApplicationDbContext` - EF Core database context
- `ExpenseRepository`, `CategoryRepository` - Data access
- `TokenService` - JWT generation
- `OcrService` - Receipt processing via external API

### API Layer
Contains HTTP handling:
- Controllers for REST endpoints
- DI configuration
- Middleware setup

## Testing

### Backend Tests
```bash
cd backend
dotnet test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Configuration

### Backend (`appsettings.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=ExpenseTracker.db"
  },
  "JwtSettings": {
    "SecretKey": "your-secret-key",
    "Issuer": "ExpenseTrackerAPI",
    "Audience": "ExpenseTrackerClient",
    "ExpirationHours": 24
  }
}
```

## License

This project is for personal/educational use.
