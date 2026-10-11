import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfirmProvider } from './components/ConfirmProvider'
import { Toaster } from './components/ui/sonner'
import App from './App'
import MultilineText from './components/MultilineText'
import { ThemeProvider } from './lib/appearance'
import { createQueryClient } from './lib/query'
import './index.css'

// Setelah deploy, index.html lama di cache bisa menunjuk ke file hash yang sudah
// tidak ada -> layar putih. Muat ulang sekali agar mengambil index.html terbaru.
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  try {
    if (sessionStorage.getItem('chunk-reload')) return
    sessionStorage.setItem('chunk-reload', '1')
  } catch {
    return
  }
  window.location.reload()
})
window.setTimeout(() => {
  try {
    sessionStorage.removeItem('chunk-reload')
  } catch {
    /* ignore */
  }
}, 10_000)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={createQueryClient()}>
        <ConfirmProvider>
          <App />
          <MultilineText />
          <Toaster />
        </ConfirmProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
