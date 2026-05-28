# 📚 Books & Finance - Comprehensive A-Z Tech Handover Document

> **Confidential Technical Handover Documentation**  
> **Prepared for:** Junior Frontend Developers & Maintainers  
> **Author:** Senior Frontend Architect & Tech Lead  
> **Project Version:** `0.0.0` (as per `package.json`)  
> **Target Lifecycle:** Built for 3+ years of enterprise scalability & maintenance.

---

## 📋 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack Used](#2-tech-stack-used)
3. [Complete Folder Structure Analysis](#3-complete-folder-structure-analysis)
4. [Entry Flow of Application](#4-entry-flow-of-application)
5. [Routing Flow](#5-routing-flow)
6. [Component Architecture](#6-component-architecture)
7. [State Management Flow](#7-state-management-flow)
8. [API Architecture](#8-api-architecture)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Environment Variables](#10-environment-variables)
11. [Styling Architecture](#11-styling-architecture)
12. [Reusable Utilities](#12-reusable-utilities)
13. [Forms & Validation](#13-forms--validation)
14. [Data Flow Diagram](#14-data-flow-diagram)
15. [Feature-by-Feature Explanation](#15-feature-by-feature-explanation)
16. [Important Files Junior Must Know](#16-important-files-junior-must-know)
17. [Common Bugs & Fixes](#17-common-bugs--fixes)
18. [How to Run Project](#18-how-to-run-project)
19. [How to Add New Feature](#19-how-to-add-new-feature)
20. [Handover Notes for Junior Developer](#20-handover-notes-for-junior-developer)
21. [Project Dependency Map](#21-project-dependency-map)
22. [Security Notes](#22-security-notes)
23. [Performance Optimization Notes](#23-performance-optimization-notes)
24. [Final Junior Developer Learning Path](#24-final-junior-developer-learning-path)

---

## 1. Project Overview

### What is this Project?
**Books & Finance (CLIKS-FE)** is a premium, feature-rich web application designed for comprehensive personal and business finance management. It caters to budgeting, stock/inventory tracking, investment planning, goal tracking, and shared finance splits.

### Purpose of the Application & Business Goal
The primary business goal is to democratize financial literacy and streamline cashflow tracking for individuals, freelancers, and small business owners. Rather than maintaining disparate spreadsheets or using clunky legacy accounting software, users are provided with a consolidated hub that links day-to-day transaction records with future financial models.

### Main Features
- **Finance Module**: Granular tracking of incomes, expenses, customized budget pools, active bank accounts, transactions ledger, planned recurring payments, savings wallets, investment tracking, and debt lifecycles.
- **Books Module**: Inventory/stock control, robust multi-year financial planning calendars, people transaction management (money owed/lent), contact catalogs, category-based fund segregation, and group split bills.
- **Social Module**: A public feed that hosts community milestones, trading events, and peer updates.
- **Auditor Module**: Dedicated workflow dashboards (`AuditPanel`, `AuditorSidebar`) to detect accounting anomalies and perform audits.
- **Premium Features**: SS0 capabilities, customizable multi-currency supports, and full subscription gating.

### End Users
- **Individual Consumers**: Managing household budgets and savings milestones.
- **Freelancers & Solopreneurs**: Separating personal money from business expenses (using the Segregation page).
- **Small Teams & Collaborators**: Split group bills, track mutual debts, and manage inventory levels.
- **Auditors**: Compliance and transaction integrity validation agents.

### Problem this Product Solves
Traditional finance applications separate stock tracking, budgeting, and bill splitting. **CLIKS-FE** bridges this gap in a single high-performance dashboard that provides predictive insights based on active financial plans.

---

## 2. Tech Stack Used

| Technology | Purpose | Implementation Location |
| :--- | :--- | :--- |
| **React 19.2.0** | Core UI framework providing declarative, component-driven logic. | Entire `/src` directory |
| **Vite 7.2.4** | Next-generation frontend tooling and HMR dev server. | Root `vite.config.js` |
| **React Router DOM 7.12.0** | Client-side routing, query parameter state management, and protected routes. | `src/App.jsx` and `src/routes/` |
| **TanStack Query (v5.90.20)** | Declarative server-state caching, automatic refetching, and optimistic mutations. | `src/lib/queryClient.js`, hooks, and services |
| **Framer Motion 12.29.0** | Rich micro-animations, layout transitions, and premium drawer controls. | `src/components/`, `src/pages/Landing.jsx` |
| **Lucide React 0.562.0** | Consistent, scalable vector icons throughout pages. | Global use |
| **Styled Components 6.3.9** | Encapsulated, dynamic styling for specialized UI primitives. | `src/components/common/Loader.jsx`, `Tooltip.jsx` |
| **Cashfree SDK (`@cashfreepayments/cashfree-js`)** | Native secure checkout integration. | `src/pages/Subscription.jsx`, `src/pages/finance/Wallet.jsx` |
| **SheetJS (`xlsx`)** | Direct client-side JSON-to-Excel exporting. | `src/pages/Stock.jsx` |
| **Vanilla CSS & custom variables** | Curated design system tokens and glassmorphism layouts. | `src/styles/`, `src/index.css`, `src/App.css` |

---

## 3. Complete Folder Structure Analysis

```
CLIKS-FE/
├── 📁 public/                 # Static assets copied directly to build root
│   └── vite.svg               # Application favicon
├── 📁 dist/                   # Production-ready minified build assets
└── 📁 src/                    # Primary source code directory
    ├── 📄 main.jsx            # Application mount and context bootstrapping
    ├── 📄 App.jsx             # Route layout declarations and page lazy loading
    ├── 📄 App.css             # Main layout, container grids, and layout rules
    ├── 📄 index.css           # Global custom property design tokens
    ├── 📁 api/                # Core HTTP client infrastructure
    │   ├── client.js          # Fetch API wrapper with headers & Auth injection
    │   ├── errors.js          # Normalized API error structure & parsing
    │   └── index.js           # Barrel export for API layer
    ├── 📁 services/           # HTTP services fetching endpoints
    │   ├── authService.js     # Profiles & SSO Login endpoints
    │   ├── stockService.js    # Stock & inventory tracking calls
    │   ├── ...                # Modular files matching backend controllers
    │   └── index.js           # Services barrel export
    ├── 📁 context/            # React Global state providers
    │   ├── AuthContext.jsx    # Session control, user tracking & profile fetching
    │   ├── CurrencyContext.jsx# Application-wide currency selection
    │   ├── auth-context.js    # Context declaration reference
    │   └── index.js           # Context barrel export
    ├── 📁 components/         # Reusable presentation widgets
    │   ├── Topbar.jsx         # Premium blur-background top navigation
    │   ├── Sidebar.jsx        # Tree-view contextual navigation
    │   ├── Breadcrumbs.jsx    # Dynamic URL indicator routes
    │   ├── 📁 common/         # Low-level UI wrappers (Error, Tooltip)
    │   ├── 📁 dashboard/      # Custom tiles (MoneyGoalsTile, MarketPulseTile)
    │   └── 📁 ui/             # Core interactive components (Accordion, Toggle)
    ├── 📁 layouts/            # Component layout wrapper templates
    │   ├── MainLayout.jsx     # Topbar + Collapsible Sidebar + Page container
    │   └── AuditorLayout.jsx  # Specialized auditor environment navigation
    ├── 📁 lib/                # Shared framework wrappers
    │   ├── config.js          # Verified config parsing environment
    │   ├── queryClient.js     # TanStack Query cache defaults
    │   └── utils.js           # Class name merging utility (cn)
    ├── 📁 styles/             # Dedicated CSS token stylesheets
    │   ├── tokens.css         # Typography, padding, color tokens
    │   ├── layout.css         # Sidebar positions & scroll variables
    │   └── premium.css        # Interactive glassmorphic shadows and animations
    └── 📁 pages/              # Primary route view screens
        ├── Landing.jsx        # Split-screen credentials & SSO gateway
        ├── 📁 books/          # Submodule page targets for Books module
        ├── 📁 finance/        # Submodule page targets for Finance module
        ├── 📁 people/         # Contact split expense ledger sub-pages
        └── ...
```

---

## 4. Entry Flow of Application

The bootup sequence operates through these phases:

```
[index.html] -> Load bundle
  └── [src/main.jsx] -> Mounts React DOM
        ├── <QueryClientProvider> -> Bootstraps API Server cache
        ├── <AuthProvider>        -> Checks localToken, fetches Profile
        └── <CurrencyProvider>    -> Sets default currency symbol
              └── [src/App.jsx]   -> Initialized BrowserRouter
                    ├── Route path="/" -> renders Landing.jsx (Public)
                    └── Route path="*" -> gates ProtectedRoute
                          └── renders <MainLayout> with Lazy page bundles
```

### Flow Breakdown
1. **Bootstrap (`index.html`)**: References `src/main.jsx`.
2. **Mount (`main.jsx`)**: Wraps `<App />` with Context Providers.
3. **Authentication Check (`AuthContext.jsx`)**: Reads `books_auth_token` from `localStorage`. If found, `loading = true` and `authService.getProfile()` validates the session. If profile load fails with a `401`, tokens are destroyed, redirecting the user.
4. **App Rendering (`App.jsx`)**: Contains lazy-loaded path routing. Unauthenticated visits to non-public endpoints are redirected to `/`.

---

## 5. Routing Flow

The client router utilizes **React Router v7** with lazy-loaded code-splitting chunks.

| Route | Component | Purpose | Access Level |
| :--- | :--- | :--- | :--- |
| `/` | `Landing` | Login / Guest entry landing screen | Public |
| `/auth` | `Auth` | Unified SSO gateway / redirection landing | Public |
| `/auditor` | `Auditor` | Audit panels utilizing `AuditorLayout` | Public |
| `/books/profile` | `Profile` | Detailed profile view (standalone) | Public |
| `/books/dashboard`| `BooksDashboard`| Home metrics page for Books module | Protected |
| `/books/stock` | `Stock` | Inventory control, SheetJS reports | Protected |
| `/payments/planner`| `FinancialPlan` | Future planning dashboard | Protected |
| `/books/people` | `People` | Split bills ledger summaries | Protected |
| `/ca` | `BusinessCA` | Chartered accountant analysis dashboards | Protected |
| `/subscription` | `Subscription`| Subscription paywall with Cashfree | Protected |

---

## 6. Component Architecture

The CLIKS-FE layout relies on structured parent-child composition:

```
             [App.jsx Route Context]
                        |
                 [MainLayout.jsx]
             /          |         \
     [Topbar]       [Sidebar]      [Suspense Loader]
     /      \           |                 |
[Branding] [Profile] [TreeView items]  [Active Page Components]
```

### Key Shared Components
- **MainLayout (`src/layouts/MainLayout.jsx`)**: Sets dynamic CSS variables indicating sidebar open state (`--sidebar-width`).
- **Sidebar (`src/components/Sidebar.jsx`)**: Maps layout lists recursively. Generates active class highlights (`.sidebar-item.active`) using the color `--primary` (`#195BAC`).
- **ProfileDropdown (`src/components/ProfileDropdown.jsx`)**: Renders user detail cards animated by Framer Motion. Contains sign-out options which trigger a cache reset.

---

## 7. State Management Flow

CLIKS-FE isolates client UI states from server data models:

```
[User Action] ---> Mutates local state (useState) or URL parameters
       │
       └───> Dispatch TanStack mutation (useMutation)
                │
                ├───> [API Call] ---> Updates server DB
                │
                └───> onSuccess ---> Invalidate queries ---> Refetch background
```

- **Global Session State**: Isolated inside `<AuthProvider>` (`src/context/AuthContext.jsx`). Contains the current profile payload.
- **Server Cache state**: Handled by TanStack Query. Configured in `src/main.jsx` to reject automatic refetching on window focuses to prevent duplicate API bursts.
- **UI State**: Handled locally via React hooks or via React Router query strings.

---

## 8. API Architecture

### Service Client Configuration (`src/api/client.js`)
API communication uses native `fetch` with modular wrappers:
- Injects a token from `localStorage.getItem('books_auth_token')` via headers as `Authorization: Bearer <token>`.
- Auto-handles token timeouts using `AbortController`.
- Utilizes `normalizeError` to construct unified `ApiError` instances containing localized payloads.

### API Reference Contracts

| API Name | Endpoint | Method | Purpose | Response Payload | Used In |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SSO Login** | `/auth/sso` | `POST` | Exchange token for user details | `{ accessToken: string, user: Object }` | `AuthContext` |
| **Get Profile** | `/profile` | `GET` | Retrieve valid user data | `{ id: string, name: string, email: string }` | `AuthContext` |
| **Get Stock** | `/stock` | `GET` | Search and filter stock items | `Array<{ id, name, category, quantity }>` | `Stock.jsx` |
| **Get Stock Stats**| `/stock/stats` | `GET` | Get general inventory overview | `{ totalValue, totalItems, lowStockCount }`| `Stock.jsx` |

---

## 9. Authentication & Authorization

### The Flow
```
1. Redirect to external SSO Portal or inputs Token directly in landing page.
2. Token exchange: POST /auth/sso { bnxToken }.
3. Receive accessToken and user metadata.
4. Set 'books_auth_token' inside localStorage.
5. Invalidate query cache via queryClient.invalidateQueries().
6. Route context dynamically triggers ProtectedRoute wrapper update.
```

### Authorization Roles
The application supports special admin checks, subscription checks, and auditor capabilities:
- **Auditors**: Bypass regular workspace constraints. Handled inside `/auditor` routes and utilizing `AuditorLayout.jsx`.
- **Active Subscription**: Evaluated inside `Subscription.jsx`. Restricts page view limits if a user is unsubscribed.

---

## 10. Environment Variables

CLIKS-FE leverages Vite-specific environment variables parsed securely inside `src/lib/config.js`:

```env
VITE_API_BASE_URL=https://cliks.beta-softnet.com/api/v1  # Targeted Backend API Location
VITE_ENABLE_DEV_TOOLS=true                              # Toggles developer diagnostics console logging
```

> [!WARNING]
> Never commit environment files (like `.env`) holding active access passwords or database tokens into Github repository commits. Keep keys managed through secret variables configuration platforms on deployment hosts.

---

## 11. Styling Architecture

Our style layers consist of custom-curated vanilla CSS:

```
[src/styles/tokens.css]  ---> Base design system variables (Fonts, HSL colors)
       │
[src/styles/layout.css]  ---> Grid structures, spacing layout coordinates
       │
[src/styles/premium.css] ---> Hover transitions, box-shadows, animations, blurring
```

### Core Palette Custom Variables
- `--primary`: `#195bac` (brand blue)
- `--bg-color`: `#e9f4ff` (warm grey-blue layout backdrop)
- `--card-bg`: `#ffffff` (surface cards)
- `--text-main`: `#1e293b` (primary text)

---

## 12. Reusable Utilities

### Class Name Utility (`src/lib/utils.js`)
Combines dynamic parameters:
```js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

### Config Mapper (`src/lib/config.js`)
Validates environment setups at startup to prevent silent api call failures.

---

## 13. Forms & Validation

Interactive forms are managed via native React control bindings:
- **State bindings**: Individual values mapped using the `onChange` event in `useState`.
- **Validation**: Performed inside custom event submission blocks. Shows interactive banner blocks if inputs fail verification rules.

---

## 14. Data Flow Diagram

```
[User Clicks "Add to Stock"]
      │
[React form validation checks status] ──(fail)──> [Show Error alert UI]
      │ (pass)
[Dispatches stockService.createItem()]
      │
[Axios client fetches API /stock endpoint with Auth Header Bearer]
      │
[API response is normalized and Query Keys invalidated]
      │
[TanStack Query initiates background re-fetch]
      │
[Home page component state refreshes with updated stock array]
```

---

## 15. Feature-by-Feature Explanation

### 1. Split Expense (`/payments/split-expense`)
- **Purpose**: Calculate equal or unequal debt shares for groups.
- **API service**: `splitExpenseService.js`.
- **Business Logic**: Determines exact cross-settlement plans to resolve group debts.

### 2. Stock Management (`/books/stock`)
- **Purpose**: Log products, units, and inventory volumes.
- **Key Utility**: Client-side Excel export through SheetJS (`XLSX`).
- **Edge cases**: Flags low stock quantities based on configured triggers.

---

## 16. Important Files Junior Must Know

1. **`src/App.jsx`**: Handles routing gates and lazy loading.
2. **`src/api/client.js`**: Core HTTP handler containing custom interceptors.
3. **`src/context/AuthContext.jsx`**: Controls sessions and redirects.
4. **`src/pages/BusinessCA.jsx`**: The core charts dashboard component.

---

## 17. Common Bugs & Fixes

### 1. Cached User Cross-Contamination
- **Symptom**: User B logs in on the same computer and sees User A's data dashboard.
- **Fix**: The `logout()` function clears the TanStack query cache via `queryClient.clear()`.

### 2. Broken Endpoint Leading Slashes
- **Symptom**: Relative URL calls fail.
- **Fix**: The endpoint URL builder uses `new URL()` after slicing any leading slashes.

---

## 18. How to Run Project

### Development Setup
1. **Initialize node dependencies**:
   ```bash
   npm install
   ```
2. **Setup environment variables**:
   ```bash
   cp .env.example .env
   ```
3. **Run local server**:
   ```bash
   npm run dev
   ```

### Production Build
```bash
npm run build
npm run preview
```

---

## 19. How to Add New Feature

```
[1. Define backend service methods in src/services/<name>Service.js]
                        │
[2. Map endpoint targets using apiClient methods]
                        │
[3. Create UI page component in src/pages/ under correct modules]
                        │
[4. Declare lazy-loading path hooks in src/App.jsx]
                        │
[5. Hook state using TanStack useQuery and useMutation hooks]
```

---

## 20. Handover Notes for Junior Developer

- **Do NOT bypass `apiClient`**: Always execute API calls using `apiClient` to ensure JWTs and error handlers are applied.
- **Clean up subscriptions**: Use cleanup callbacks in `useEffect` to prevent browser resource leaks.
- **Responsive design**: Check page adjustments across mobile and desktop layout configurations before committing.

---

## 21. Project Dependency Map

```
[AuthContext] ──(Gates)──> [MainLayout] ──(Renders)──> [Pages]
                                                          │
   [apiClient] <──────(Imports)────── [Services] <────────┘
```

---

## 22. Security Notes

- **Access Token Integrity**: Access tokens are kept inside `localStorage`. Ensure no debug log files leak authorization strings into server dumps.
- **HTTPS Enforcement**: Keep `VITE_API_BASE_URL` pointing strictly to `https://` secure locations in production.

---

## 23. Performance Optimization Notes

- **Lazy Loading**: Major views are lazy-loaded via `React.lazy` inside `src/App.jsx` to reduce bundle sizes.
- **TanStack Caching**: Eliminates duplicate network overhead by storing response caches in memory.

---

## 24. Final Junior Developer Learning Path

```
Day 1 ──> Analyze folder structures and config properties
Day 2 ──> Test authentication gateways and local setups
Day 3 ──> Analyze apiClient interceptors and error handlers
Day 4 ──> Study TanStack Query integration in components
Day 5 ──> Implement a new mock service and add a custom page
```
