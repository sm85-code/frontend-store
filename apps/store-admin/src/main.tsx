import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfirmProvider } from './components/ConfirmProvider'
import { Toaster } from './components/ui/sonner'
import App from './App'
import { ThemeProvider } from './lib/appearance'
import { createQueryClient } from './lib/query'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={createQueryClient()}>
        <ConfirmProvider>
          <App />
          <Toaster />
        </ConfirmProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
