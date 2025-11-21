# Personal Finance Manager

A shared personal finance management application for Felipe and Caroline to manage household finances together.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: MongoDB Atlas with Prisma ORM
- **Authentication**: NextAuth v5 with hardcoded credentials
- **Styling**: Tailwind CSS
- **Charts**: Recharts for data visualization
- **State Management**: React Query for data fetching/caching
- **Data Mutations**: Server Actions only (no API routes)

## Features

### 1. Dashboard
- Financial overview with key metrics
- Budget progress bar with visual warnings (80%, 90% thresholds)
- Category spending breakdown (pie chart)
- Upcoming bills in next 7 days
- Projected end-of-month balance
- Real-time spending percentage calculation

### 2. Bills Management
- **Fixed Bills**: Recurring monthly bills (rent, utilities, subscriptions)
  - Set due day (1-31)
  - Toggle active/inactive status
  - Category organization
  - Track who created each bill
- **One-Time Bills/Debts**: Non-recurring payments
  - Track total amount and paid amount
  - Payment progress visualization
  - Status tracking (pending, partial, paid)
  - Payment history

### 3. Income Tracking
- Register monthly income per person
- Income types: salary, freelance, bonus, other
- Combined household income display
- Monthly breakdown by person
- Historical income records

### 4. Quick Expense Tracking
- Floating action button (always accessible)
- Fast one-click expense entry
- Categories: food, transport, entertainment, shopping, bills, other
- Auto-fills date and user information
- Optimistic UI updates

### 5. Expenses Management
- Complete expense history
- Monthly summary with statistics
- Category breakdown with totals
- Daily average spending
- Split view by person (Felipe/Caroline)

### 6. Calendar View
- Monthly calendar with all financial activities
- Color-coded transaction types:
  - 🛒 Orange: Quick expenses
  - 💳 Blue: Fixed bills
  - 📋 Purple: One-time bills
- Daily transaction totals
- Visual indicators for due dates
- Today's date highlighting

### 7. Budget Warnings
- 80% threshold: Warning message
- 90% threshold: Critical alert
- Upcoming bills warning (next 3 days)
- Insufficient funds alert
- Visual color-coded indicators

### 8. Shared Visibility
- All data shared between Felipe and Caroline
- Both users can add/edit/delete records
- "Added by" labels for tracking
- Real-time updates via React Query

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account
- Environment variables configured

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Persona-Finances
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create `.env` file with:
```env
# Database
NEXT_DATABASE_URL="mongodb+srv://mongoAdmin:OC2025@mongodb.7eemfhh.mongodb.net/Finances?retryWrites=true&w=majority"

# Authentication
AUTH_SECRET="persona-finances-secret-key-2025-nina123"
AUTH_URL="http://localhost:3000"

# User Passwords
FELIPE_PASSWORD="Nina123*"
CAROL_PASSWORD="Nina123*"

NODE_ENV="development"
```

4. Generate Prisma Client:
```bash
npx prisma generate
```

5. Push database schema:
```bash
npx prisma db push
```

6. Run development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## Authentication

Two hardcoded users are configured:

- **Username**: `felipe` | **Password**: Value from `FELIPE_PASSWORD` env var
- **Username**: `carol` | **Password**: Value from `CAROL_PASSWORD` env var

## Database Schema

### Models

- **User**: User accounts (felipe, carol)
- **FixedBill**: Recurring monthly bills
- **OneTimeBill**: Non-recurring debts/bills
- **Payment**: Payment records for one-time bills
- **Income**: Monthly income records
- **Expense**: Quick daily expenses
- **BudgetWarning**: Budget warning configurations

## Architecture

### Server Actions Pattern

All data mutations use Server Actions (no API routes):
- `/app/actions/bills.ts` - Fixed bill operations
- `/app/actions/debts.ts` - One-time bill and payment operations
- `/app/actions/income.ts` - Income management
- `/app/actions/expenses.ts` - Expense tracking
- `/app/actions/dashboard.ts` - Aggregated financial data

### Page Structure

```
/app
├── /dashboard - Main financial overview
├── /bills - Bills management (fixed + one-time)
├── /income - Income tracking
├── /expenses - Expense history
├── /calendar - Monthly calendar view
└── /login - Authentication
```

### Components

```
/components
├── /dashboard - Dashboard-specific components
├── /bills - Bill management components
├── /shared - Shared layout and utilities
└── /ui - Reusable UI components
```

## Development Notes

### Server Actions
All CRUD operations use Server Actions with `"use server"` directive. No API routes are used for data mutations.

### Authentication Middleware
Routes are protected using NextAuth middleware. Unauthenticated users are redirected to `/login`.

### Database Connection
Prisma is configured with MongoDB Atlas. The connection uses a singleton pattern optimized for serverless environments.

### Styling
Tailwind CSS with custom brand colors:
- Navy (`#221F26`) - Primary
- Red (`#ea384c`) - Accent
- Custom spacing and responsive breakpoints

## Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Open Prisma Studio
npm run db:studio

# View database
npx prisma studio
```

## Future Enhancements

Potential features for Phase 2:
- [ ] CSV/PDF export functionality
- [ ] Monthly reports with charts
- [ ] Email bill reminders
- [ ] Receipt upload (using AWS S3)
- [ ] Bank account balance tracking
- [ ] Category-based budgeting with limits
- [ ] Savings goals tracking
- [ ] Recurring expense pattern detection
- [ ] Split expense tracking (50/50)
- [ ] Multi-currency support
- [ ] Budget comparison (actual vs planned)

## Contributing

This is a personal project for Felipe and Caroline's household finance management.

## License

Private - All Rights Reserved
