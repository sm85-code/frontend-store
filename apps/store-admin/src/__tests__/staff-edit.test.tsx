import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import StaffPage from '../pages/StaffPage'
import { nameSchema, passwordSchema } from '../lib/validation'

const mocks = vi.hoisted(() => ({ listStaff: vi.fn(), patchStaff: vi.fn(), createStaff: vi.fn(), deleteStaff: vi.fn() }))
vi.mock('../lib/api', () => ({ api: mocks, errorMessage: (e: unknown) => e instanceof Error ? e.message : 'Error' }))
vi.mock('../lib/auth', () => ({ useAuth: () => ({ user: { id: 'owner', role: 'owner' } }) }))
vi.mock('../components/ConfirmProvider', () => ({ useConfirm: () => vi.fn() }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
const staff = { id: 'staff', nama: 'Admin Lama', email: 'admin@example.com', role: 'admin', created_at: '2026-10-06T00:00:00Z' }

beforeEach(() => {
  vi.clearAllMocks()
  mocks.listStaff.mockResolvedValue([staff])
  mocks.patchStaff.mockResolvedValue({ ...staff, nama: 'Admin Baru' })
})

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(<QueryClientProvider client={client}><StaffPage /></QueryClientProvider>)
  return userEvent.setup()
}

describe('Staff admin', () => {
  it('loads the existing name and submits the backend PATCH without changing email or role', async () => {
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Edit Admin Lama' }))
    const input = screen.getByLabelText('Nama')
    expect(input).toHaveValue('Admin Lama')
    await user.clear(input)
    await user.type(input, ' Admin Baru ')
    await user.click(screen.getByRole('button', { name: 'Simpan perubahan' }))
    await waitFor(() => expect(mocks.patchStaff).toHaveBeenCalledWith('staff', 'Admin Baru'))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(mocks.createStaff).not.toHaveBeenCalled()
  })

  it('rejects an empty edit before making a request', async () => {
    const user = setup()
    await user.click(await screen.findByRole('button', { name: 'Edit Admin Lama' }))
    await user.clear(screen.getByLabelText('Nama'))
    await user.click(screen.getByRole('button', { name: 'Simpan perubahan' }))
    expect(await screen.findByText('Nama wajib diisi')).toBeInTheDocument()
    expect(mocks.patchStaff).not.toHaveBeenCalled()
  })

  it('filters staff by email and shows an empty state', async () => {
    const user = setup()
    await screen.findByText('Admin Lama')
    await user.type(screen.getByLabelText('Cari admin'), 'not-found')
    expect(screen.getByText('Tidak ada admin yang cocok.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit Admin Lama' })).not.toBeInTheDocument()
  })

  it('matches backend Unicode byte and name limits', () => {
    expect(passwordSchema.safeParse('é'.repeat(36)).success).toBe(true)
    expect(passwordSchema.safeParse('é'.repeat(37)).success).toBe(false)
    expect(passwordSchema.safeParse('🙂'.repeat(19)).success).toBe(false)
    expect(nameSchema.safeParse('x'.repeat(256)).success).toBe(false)
  })
})
