# Production Tracker Frontend

This is a production-ready React application built for the Production Tracker system. It enables piece-rate workers (sheet makers) to intuitively submit their daily tallies while providing an admin oversight experience.

## Tech Stack
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Features
- **Worker Flow**: 
  - Easy login from active worker list
  - Dashboard with daily verification and real-time monthly stats
  - Intuitive standard-based numeric Entry form with running totals
  - History of production entries and viewable detailed receipts
  - Dedicated Monthly Earnings report breakdown
- **Admin Flow** (under `/admin`):
  - Dashboard stats tracking active workers and items
  - View all workers and their statuses
  - Manage sheet type prices
  - Aggregated reporting overviews
- **Mobile First Focus**: Extra-large tap targets, numeric keypads optimized, floating bottom action bars for single-hand reachability.

## Project Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Variables**
Copy the sample environment file and set the API URL matching your backend.
```bash
cp .env.example .env
```

3. **Start Development Server**
```bash
npm run dev
```

4. **Production Build**
```bash
npm run build
npm run preview
```

## Folder Structure

```
frontend/
├── src/
│   ├── components/ 
│   │   ├── ui/         # Reusable atomic elements (Button, Card, Input)
│   │   └── ...         # Higher-order components like ProtectedRoute
│   ├── contexts/       # React Contexts (AuthContext)
│   ├── layouts/        # Base layouts (AdminLayout, WorkerLayout)
│   ├── pages/          # All route definitions and page views
│   │   ├── admin/
│   │   └── worker/
│   ├── services/       # Axios wrappers and API request layers
│   ├── types/          # Core model TS interfaces mapping to backend entities
│   ├── App.tsx         # Main entry, Router setup
│   └── main.tsx        # React DOM render
├── .env.example
├── index.html
├── tailwind.config.ts  # Handled implicitly via Vite/Tailwind v4 integration
├── tsconfig.json
└── vite.config.ts
```

## Design System

The application relies heavily on `src/index.css` to define core css variables.
It strictly adheres to a clean, component-first methodology. Instead of muddying components with inline utility classes everywhere, the foundation utilizes `components/ui/*` constructs built with Tailwind. 
