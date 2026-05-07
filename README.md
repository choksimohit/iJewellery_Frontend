# iJewellery Frontend

React frontend for the iJewellery Gold Loan Management System. Built with Vite, TypeScript, and Tailwind CSS. Consumes the iJewellery FastAPI backend.

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (gold + navy theme)
- **Routing:** React Router v6
- **State:** Zustand (auth persistence)
- **HTTP:** Axios (with JWT interceptor)
- **Notifications:** react-hot-toast
- **Icons:** Lucide React
- **Hosting:** Vercel

## Project Structure

```
iJewellery_Frontend/
├── src/
│   ├── api/
│   │   ├── client.ts       # Axios instance with JWT interceptor + auto-logout
│   │   ├── auth.ts         # Login API call
│   │   ├── dashboard.ts    # Dashboard stats API call
│   │   ├── loans.ts        # Loan search, lookups, next-number, entry API calls
│   │   └── customers.ts    # Customer lookup by phone + create customer
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Layout.tsx  # App shell (sidebar + header + outlet)
│   │   │   ├── Sidebar.tsx # Dark navy sidebar with gold active states
│   │   │   └── Header.tsx  # Top bar with user info + logout
│   │   └── ui/
│   │       ├── Card.tsx    # Card, CardHeader, CardTitle, CardContent
│   │       └── Badge.tsx   # Status badge (success, warning, danger, etc.)
│   ├── lib/
│   │   └── utils.ts        # cn(), formatCurrency(), formatDate()
│   ├── pages/
│   │   ├── Login.tsx       # Login page (gold gradient + card)
│   │   ├── Dashboard.tsx   # Stats cards + source-wise table
│   │   └── loans/
│   │       ├── LoanSearch.tsx  # Search by number / name / phone / address
│   │       └── LoanEntry.tsx   # Multi-item loan entry form
│   ├── store/
│   │   └── authStore.ts    # Zustand store (token + user, persisted to localStorage)
│   └── types/
│       └── index.ts        # TypeScript interfaces (Loan, Lookups, DashboardStats, CustomerInfo, etc.)
├── index.html
├── package.json
├── vite.config.ts          # Dev proxy: /api → localhost:8000
├── tailwind.config.js      # Custom gold + navy color palette
├── tsconfig.json
└── postcss.config.js
```

## Getting Started

### 1. Prerequisites

- Node.js 18+
- iJewellery Backend running (locally or deployed)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

| File | Used when |
|------|-----------|
| `.env` | Local development (`npm run dev`) |
| `.env.production` | Production build (`npm run build`) |

`.env` (local):
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

`.env.production` (deployed):
```env
VITE_API_BASE_URL=https://i-jewellery-backend.vercel.app/api
```

### 4. Run locally

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4. Build for production

```bash
npm run build
```

Output goes to `dist/` — ready for Vercel or any static host.

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Username + password sign-in |
| `/dashboard` | Dashboard | Metal rates, portfolio stats, source-wise breakdown |
| `/loans/entry` | Loan Entry | Mobile search → customer card/create → multi-item gold loan |
| `/loans/search` | Loan Search | Search loans by number, name, phone, address, source |

## Environment & API URL

The API base URL is controlled via environment files. `client.ts` reads `VITE_API_BASE_URL` automatically:

| Environment | File | API URL |
|-------------|------|---------|
| Development | `.env` | `http://localhost:8000/api` |
| Production | `.env.production` | `https://i-jewellery-backend.vercel.app/api` |

## Deploying to Vercel

1. Push this folder to a GitHub repository
2. Import the repo in [vercel.com](https://vercel.com)
3. Vercel auto-detects Vite and uses `.env.production` at build time — no manual env vars needed

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `gold-500` | `#D4A017` | Primary buttons, active nav, accents |
| `gold-600` | `#B8860B` | Button hover states |
| `navy-900` | `#0F172A` | Sidebar background |
| `navy-800` | `#1E293B` | Sidebar hover states |
| Font | Inter | All UI text |

## Adding More Modules

To add a new page (e.g. Loan Closure):

1. Create `src/api/closure.ts` with the API call
2. Create `src/pages/loans/LoanClosure.tsx`
3. Add the route in `src/App.tsx`
4. Add the nav link in `src/components/Layout/Sidebar.tsx`
# iJewellery_Frontend
