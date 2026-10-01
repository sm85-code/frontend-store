import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiError, type Admin } from '@store/shared'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Protected } from '../App'
import { useAuth } from '../lib/auth'
import { navFor } from '../components/Layout'
import { AuthProvider } from '../lib/auth'
import LoginPage from '../pages/LoginPage'

const api = vi.hoisted(() => ({ me: vi.fn(), login: vi.fn(), logout: vi.fn() }))
vi.mock('../lib/api', () => ({ api, errorMessage: (e: unknown) => (e instanceof Error ? e.message : 'x') }))

const owner: Admin = { id: '1', nama: 'Owner', email: 'o@x.com', role: 'owner' }
const admin: Admin = { id: '2', nama: 'Admin', email: 'a@x.com', role: 'admin' }

function renderApp(initial: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initial]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Protected><p>Isi beranda</p></Protected>} />
            <Route path="/staff" element={<Protected ownerOnly><p>Halaman staff</p></Protected>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('navFor', () => {
  it('shows Staff only to the owner', () => {
    expect(navFor('owner').map((n) => n.to)).toContain('/staff')
    expect(navFor('admin').map((n) => n.to)).not.toContain('/staff')
  })
})

describe('route protection', () => {
  it('sends an anonymous visitor (401 from /auth/me) to the login page', async () => {
    api.me.mockRejectedValue(new ApiError(401, 'Tidak terautentikasi'))
    renderApp('/')
    expect(await screen.findByRole('heading', { name: /masuk admin toko/i })).toBeInTheDocument()
  })

  it('lets a signed-in admin in, but keeps a plain admin out of owner-only pages', async () => {
    api.me.mockResolvedValue(admin)
    renderApp('/staff')
    expect(await screen.findByText('Isi beranda')).toBeInTheDocument()
    expect(screen.queryByText('Halaman staff')).not.toBeInTheDocument()
  })

  it('lets the owner into owner-only pages', async () => {
    api.me.mockResolvedValue(owner)
    renderApp('/staff')
    expect(await screen.findByText('Halaman staff')).toBeInTheDocument()
  })
})

describe('login form', () => {
  it('validates before calling the API', async () => {
    api.me.mockRejectedValue(new ApiError(401, 'x'))
    renderApp('/login')
    await userEvent.click(await screen.findByRole('button', { name: /^masuk$/i }))
    expect(await screen.findByText('Email tidak valid')).toBeInTheDocument()
    expect(api.login).not.toHaveBeenCalled()
  })

  it('shows the backend error on wrong credentials and stays on the form', async () => {
    api.me.mockRejectedValue(new ApiError(401, 'x'))
    api.login.mockRejectedValue(new ApiError(401, 'Email atau password salah'))
    renderApp('/login')
    await userEvent.type(await screen.findByLabelText('Email'), 'a@x.com')
    await userEvent.type(screen.getByLabelText('Password'), 'salah')
    await userEvent.click(screen.getByRole('button', { name: /^masuk$/i }))
    expect(await screen.findByText('Email atau password salah')).toBeInTheDocument()
  })

  it('signs in and leaves the login page', async () => {
    api.me.mockRejectedValue(new ApiError(401, 'x'))
    api.login.mockResolvedValue(owner)
    renderApp('/login')
    await userEvent.type(await screen.findByLabelText('Email'), 'o@x.com')
    await userEvent.type(screen.getByLabelText('Password'), 'rahasia123')
    await userEvent.click(screen.getByRole('button', { name: /^masuk$/i }))
    await waitFor(() => expect(api.login).toHaveBeenCalledWith('o@x.com', 'rahasia123'))
    expect(screen.queryByRole('heading', { name: /masuk admin toko/i })).not.toBeInTheDocument()
  })
})

describe('sign out', () => {
  it('shows the signed-out state to already-mounted components (stale observer regression)', async () => {
    api.me.mockResolvedValue(owner)
    api.logout.mockResolvedValue({ ok: true })
    function Probe() {
      const { user, signOut } = useAuth()
      return (
        <>
          <p>{user ? `masuk:${user.nama}` : 'keluar'}</p>
          <button type="button" onClick={() => void signOut()}>Keluar sekarang</button>
        </>
      )
    }
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <AuthProvider>
            <Probe />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    )
    expect(await screen.findByText('masuk:Owner')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Keluar sekarang' }))

    expect(await screen.findByText('keluar')).toBeInTheDocument()
    expect(api.logout).toHaveBeenCalledOnce()
  })
})
