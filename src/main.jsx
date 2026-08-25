import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'

// Auto-reload page when dynamic imports fail due to code updates
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    console.warn('Vite preload error detected, reloading page...', event);
    window.location.reload();
  });

  window.addEventListener('error', (event) => {
    if (event.message && (
      event.message.includes('Failed to fetch dynamically imported module') || 
      event.message.includes('Loading chunk') ||
      event.message.includes('dynamically imported module')
    )) {
      console.warn('Dynamic import error caught globally, reloading page...');
      window.location.reload();
    }
  }, true);
}
import { CurrencyProvider } from './context/CurrencyContext'
import { LanguageProvider } from './context/LanguageContext'
import './styles/tokens.css'
import './index.css'
import './styles/layout.css'
import './styles/premium.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurrencyProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </CurrencyProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
