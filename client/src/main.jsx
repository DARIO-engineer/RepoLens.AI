import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { I18nProvider } from './i18n.jsx'
import { Analytics } from '@vercel/analytics/react'
import { AppErrorBoundary } from './components/AppErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <I18nProvider>
        <App />
        <Analytics />
      </I18nProvider>
    </AppErrorBoundary>
  </StrictMode>,
)
