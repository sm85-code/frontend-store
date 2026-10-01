import { PageSpinner } from './components/Spinner'
import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import { AuthProvider, useAuth } from './lib/auth'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ProdukPage = lazy(() => import('./pages/ProdukPage'))
const KategoriPage = lazy(() => import('./pages/KategoriPage'))
const PesananPage = lazy(() => import('./pages/PesananPage'))
const PesananDetailPage = lazy(() => import('./pages/PesananDetailPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const PengaturanPage = lazy(() => import('./pages/PengaturanPage'))
const StaffPage = lazy(() => import('./pages/StaffPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

export function Protected({ children, ownerOnly = false }: { children: ReactNode; ownerOnly?: boolean }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <PageSpinner label="Menyiapkan panel…" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (ownerOnly && user.role !== 'owner') return <Navigate to="/" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageSpinner />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Protected><DashboardPage /></Protected>} />
              <Route path="/produk" element={<Protected><ProdukPage /></Protected>} />
              <Route path="/kategori" element={<Protected><KategoriPage /></Protected>} />
              <Route path="/pesanan" element={<Protected><PesananPage /></Protected>} />
              <Route path="/pesanan/:id" element={<Protected><PesananDetailPage /></Protected>} />
              <Route path="/chat" element={<Protected><ChatPage /></Protected>} />
              <Route path="/pengaturan" element={<Protected><PengaturanPage /></Protected>} />
              <Route path="/staff" element={<Protected ownerOnly><StaffPage /></Protected>} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
