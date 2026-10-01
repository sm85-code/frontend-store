import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GantiPasswordCard } from '../components/GantiPasswordCard'

const api = vi.hoisted(() => ({ gantiPassword: vi.fn() }))
vi.mock('../lib/api', () => ({ api, errorMessage: (e: unknown) => (e instanceof Error ? e.message : 'x') }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <GantiPasswordCard />
    </QueryClientProvider>,
  )
  return userEvent.setup()
}

beforeEach(() => vi.clearAllMocks())

describe('GantiPasswordCard', () => {
  it('rejects mismatching confirmation without calling the API', async () => {
    const user = setup()
    await user.type(screen.getByLabelText('Password saat ini'), 'lama-12345')
    await user.type(screen.getByLabelText('Password baru'), 'baru-67890')
    await user.type(screen.getByLabelText('Ulangi password baru'), 'beda-67890')
    await user.click(screen.getByRole('button', { name: 'Ganti password' }))
    expect(await screen.findByText('Password baru tidak sama')).toBeInTheDocument()
    expect(api.gantiPassword).not.toHaveBeenCalled()
  })

  it('sends current and new password and clears the form', async () => {
    api.gantiPassword.mockResolvedValue({ ok: true })
    const user = setup()
    await user.type(screen.getByLabelText('Password saat ini'), 'lama-12345')
    await user.type(screen.getByLabelText('Password baru'), 'baru-67890')
    await user.type(screen.getByLabelText('Ulangi password baru'), 'baru-67890')
    await user.click(screen.getByRole('button', { name: 'Ganti password' }))
    await waitFor(() => expect(api.gantiPassword).toHaveBeenCalledWith('lama-12345', 'baru-67890'))
    await waitFor(() => expect(screen.getByLabelText('Password baru')).toHaveValue(''))
  })
})
