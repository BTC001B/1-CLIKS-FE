import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { ErrorBoundary } from './components/common';
import MainLayout from './layouts/MainLayout';
import AuditorLayout from './layouts/AuditorLayout';
import Landing from './pages/Landing';


// Lazy Load Pages to optimize bundle size
const Auth = React.lazy(() => import('./pages/Auth'));
const Income = React.lazy(() => import('./pages/Income'));
const Expenses = React.lazy(() => import('./pages/Expenses'));
const Transactions = React.lazy(() => import('./pages/Transactions'));
const Budgets = React.lazy(() => import('./pages/Budgets'));
const Accounts = React.lazy(() => import('./pages/Accounts'));
const PlannedPayments = React.lazy(() => import('./pages/PlannedPayments'));
const Savings = React.lazy(() => import('./pages/Savings'));
const Investments = React.lazy(() => import('./pages/Investments'));
const Debts = React.lazy(() => import('./pages/Debts'));
const Finance = React.lazy(() => import('./pages/Finance'));
const Transfers = React.lazy(() => import('./pages/finance/Transfers'));
const FinanceAccounts = React.lazy(() => import('./pages/finance/Accounts'));
const Bills = React.lazy(() => import('./pages/finance/Bills'));
const FinanceSavings = React.lazy(() => import('./pages/finance/Savings'));
const Rewards = React.lazy(() => import('./pages/finance/Rewards'));
const Books = React.lazy(() => import('./pages/Books'));
const BooksDashboard = React.lazy(() => import('./pages/books/Dashboard'));
const Auditor = React.lazy(() => import('./pages/Auditor'));
const Public = React.lazy(() => import('./pages/Public'));
const Stock = React.lazy(() => import('./pages/Stock'));
const Wallet = React.lazy(() => import('./pages/finance/Wallet'));
const FinancialPlan = React.lazy(() => import('./pages/financial-plan/FinancialPlan'));
const BusinessCA = React.lazy(() => import('./pages/BusinessCA'));

const People = React.lazy(() => import('./pages/People'));
const PeopleOverview = React.lazy(() => import('./pages/people/PeopleOverview'));
const PeopleTransactions = React.lazy(() => import('./pages/people/PeopleTransactions'));
const PeopleReminders = React.lazy(() => import('./pages/people/PeopleReminders'));
const PeopleRecords = React.lazy(() => import('./pages/people/PeopleRecords'));
const PersonProfile = React.lazy(() => import('./pages/people/PersonProfile'));
const SplitExpense = React.lazy(() => import('./pages/SplitExpense'));
const Segregation = React.lazy(() => import('./pages/Segregation'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));
const FAQ = React.lazy(() => import('./pages/FAQ'));
const Subscription = React.lazy(() => import('./pages/Subscription'));


import './App.css';

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '200px', color: '#64748B' }}>
    Loading...
  </div>
);

function AppContent() {

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={
          <Suspense fallback={<PageLoader />}>
            <Auth />
          </Suspense>
        } />
        <Route path="/auditor" element={
          <Suspense fallback={<PageLoader />}>
            <AuditorLayout>
              <Auditor />
            </AuditorLayout>
          </Suspense>
        } />
        <Route path="/books/profile" element={
          <Suspense fallback={<PageLoader />}>
            <Profile />
          </Suspense>
        } />

        {/* Protected Routes - All routes within MainLayout require authentication */}
        <Route path="*" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <MainLayout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Root Redirect */}
                    <Route path="/" element={<Navigate to="/books/dashboard" replace />} />
                    
                    {/* Finance (formerly Home) Section */}
                    <Route path="/finance" element={<Navigate to="/payments/planner" replace />} />
                    <Route path="/finance/dashboard" element={<Finance />} />
                    <Route path="/finance/income" element={<Income />} />
                    <Route path="/finance/expenses" element={<Expenses />} />
                    <Route path="/finance/budgets" element={<Budgets />} />
                    <Route path="/finance/accounts" element={<Accounts />} />
                    <Route path="/payments/transactions" element={<Transactions />} />
                    <Route path="/finance/planned-payments" element={<PlannedPayments />} />
                    <Route path="/finance/savings" element={<Savings />} />
                    <Route path="/finance/investments" element={<Investments />} />
                    <Route path="/finance/debts" element={<Debts />} />

                    {/* Payments Routes shifted from Books */}
                    <Route path="/payments/wallet" element={<Wallet />} />
                    <Route path="/payments/planner" element={<FinancialPlan />} />

                    <Route path="/payments/segregation" element={<Segregation />} />
                    <Route path="/payments/split-expense" element={<SplitExpense />} />
                    <Route path="/payments/rewards-offers" element={<Rewards />} />

                    {/* Books Section */}
                    <Route path="/books" element={<Books />} />
                    <Route path="/books/dashboard" element={<BooksDashboard />} />
                    <Route path="/books/stock" element={<Stock />} />
                    <Route path="/books/people" element={<People />} />
                    <Route path="/books/people/overview" element={<PeopleOverview />} />
                    <Route path="/books/people/:id" element={<PersonProfile />} />
                    <Route path="/books/people/transactions" element={<PeopleTransactions />} />
                    <Route path="/books/people/reminders" element={<PeopleReminders />} />
                    <Route path="/books/people/records" element={<PeopleRecords />} />
                    <Route path="/books/settings" element={<Settings />} />
                    <Route path="/books/faq" element={<FAQ />} />

                    {/* Public / Social Section */}
                    <Route path="/public" element={<Public />} />
                    <Route path="/social/meetup" element={<Public />} />
                    <Route path="/social/trading" element={<Public />} />
                    <Route path="/social/beta-club" element={<Public />} />

                    {/* FIN-PRO CA Section */}
                    <Route path="/ca" element={<BusinessCA />} />
                    
                    {/* Subscription Section */}
                    <Route path="/subscription" element={<Subscription />} />


                  </Routes>
                </Suspense>
              </MainLayout>
            </ErrorBoundary>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AppContent />
  );
}

export default App;
