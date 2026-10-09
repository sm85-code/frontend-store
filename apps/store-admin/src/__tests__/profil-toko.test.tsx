import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ProfilTokoPage from '../pages/ProfilTokoPage'
const mocks = vi.hoisted(() => ({ profilToko: vi.fn(), simpanProfilToko: vi.fn() }))
vi.mock('../lib/api', () => ({ api: mocks, errorMessage: (error: Error) => error.message }))
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }))
const profile = { nama: 'Toko Lama', email: 'toko@gmail.com', telepon: '081313511101', whatsapp: '6281313511101', jalan: 'Jl. Lama', desa: 'Desa', kecamatan: 'Kecamatan', kabupaten: 'Kabupaten', provinsi: 'Jawa Barat', kodePos: '46396', jam: '08.00–16.00', instagram: '', instagramNama: '', tiktok: '', tiktokNama: '' }
function setup() {
  mocks.profilToko.mockResolvedValue(profile)
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}><ProfilTokoPage /></QueryClientProvider>)
  return userEvent.setup()
}
describe('Profil Toko', () => {
  it('loads the saved profile and saves all public fields without shipping settings', async () => {
    mocks.simpanProfilToko.mockResolvedValue({ ...profile, nama: 'Toko Baru' })
    const user = setup()
    const field = await screen.findByLabelText('Nama toko')
    await user.clear(field); await user.type(field, 'Toko Baru')
    await user.click(screen.getByRole('button', { name: 'Simpan profil' }))
    await waitFor(() => expect(mocks.simpanProfilToko).toHaveBeenCalledWith({ ...profile, nama: 'Toko Baru' }))
  })
  it('keeps edited values and displays a failed save', async () => {
    mocks.simpanProfilToko.mockRejectedValue(new Error('Nomor WhatsApp tidak valid'))
    const user = setup()
    const field = await screen.findByLabelText('Nama toko')
    await user.clear(field); await user.type(field, 'Belum tersimpan')
    await user.click(screen.getByRole('button', { name: 'Simpan profil' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Nomor WhatsApp tidak valid')
    expect(field).toHaveValue('Belum tersimpan')
  })
})
