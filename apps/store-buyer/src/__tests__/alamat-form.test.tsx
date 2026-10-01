import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AlamatForm } from '@/components/AlamatForm'
import type { Kecamatan, Provinsi } from '@/lib/wilayah'

const api = vi.hoisted(() => ({ createAlamat: vi.fn() }))
vi.mock('@/lib/api', () => ({ api, errorMessage: (e: unknown) => (e instanceof Error ? e.message : 'x') }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const INDEX: Provinsi[] = [
  ['32', 'Jawa Barat', [['32.73', 'Kota Bandung']]],
  ['51', 'Bali', [['51.71', 'Kota Denpasar']]],
]
const BANDUNG: Kecamatan[] = [['32.73.01', 'Sukasari', [['32.73.01.1001', 'Sukarasa', '40152'], ['32.73.01.1002', 'Gegerkalong', '40153']]]]

beforeEach(() => {
  vi.clearAllMocks()
  api.createAlamat.mockImplementation(async (input) => ({ id: 'a1', ...input }))
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const file = String(url)
      if (file.endsWith('/wilayah/index.json')) return new Response(JSON.stringify(INDEX))
      if (file.endsWith('/wilayah/32.73.json')) return new Response(JSON.stringify(BANDUNG))
      return new Response('{}', { status: 404 })
    }),
  )
})

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <AlamatForm />
    </QueryClientProvider>,
  )
  return userEvent.setup()
}

async function isiDasar(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nama penerima'), 'Budi')
  await user.type(screen.getByLabelText('Telepon penerima'), '081234567890')
  await user.type(screen.getByLabelText(/Alamat lengkap/), 'Jl. Cipaganti No. 5')
}

describe('AlamatForm: cascading address', () => {
  it('enables each level only after its parent is chosen, and fills the postal code from the village', async () => {
    const user = setup()
    const prov = await screen.findByLabelText('Provinsi')
    await waitFor(() => expect(prov).toBeEnabled())
    expect(screen.getByLabelText('Kota / Kabupaten')).toBeDisabled()
    expect(screen.getByLabelText('Kecamatan')).toBeDisabled()
    expect(screen.getByLabelText('Desa / Kelurahan')).toBeDisabled()

    await user.selectOptions(prov, 'Jawa Barat')
    await user.selectOptions(screen.getByLabelText('Kota / Kabupaten'), 'Kota Bandung')
    await waitFor(() => expect(screen.getByLabelText('Kecamatan')).toBeEnabled())
    await user.selectOptions(screen.getByLabelText('Kecamatan'), 'Sukasari')
    await user.selectOptions(screen.getByLabelText('Desa / Kelurahan'), 'Gegerkalong')
    expect(screen.getByLabelText('Kode pos')).toHaveValue('40153')
    await user.selectOptions(screen.getByLabelText('Desa / Kelurahan'), 'Sukarasa')
    expect(screen.getByLabelText('Kode pos')).toHaveValue('40152')
  })

  it('clears the lower levels when a higher one changes', async () => {
    const user = setup()
    await waitFor(() => expect(screen.getByLabelText('Provinsi')).toBeEnabled())
    await user.selectOptions(screen.getByLabelText('Provinsi'), 'Jawa Barat')
    await user.selectOptions(screen.getByLabelText('Kota / Kabupaten'), 'Kota Bandung')
    await waitFor(() => expect(screen.getByLabelText('Kecamatan')).toBeEnabled())
    await user.selectOptions(screen.getByLabelText('Kecamatan'), 'Sukasari')
    await user.selectOptions(screen.getByLabelText('Desa / Kelurahan'), 'Sukarasa')

    await user.selectOptions(screen.getByLabelText('Provinsi'), 'Bali')
    expect(screen.getByLabelText('Kota / Kabupaten')).toHaveValue('')
    expect(screen.getByLabelText('Kecamatan')).toBeDisabled()
    expect(screen.getByLabelText('Desa / Kelurahan')).toBeDisabled()
    expect(screen.getByLabelText('Kode pos')).toHaveValue('')
  })

  it('refuses to save until every level is chosen', async () => {
    const user = setup()
    await waitFor(() => expect(screen.getByLabelText('Provinsi')).toBeEnabled())
    await isiDasar(user)
    await user.click(screen.getByRole('button', { name: /simpan alamat/i }))
    // Each message shows up twice: as the empty option of the select and as the validation error under it.
    await waitFor(() => expect(screen.getAllByText('Pilih provinsi')).toHaveLength(2))
    expect(screen.getAllByText('Pilih kota / kabupaten')).toHaveLength(2)
    expect(screen.getAllByText('Pilih kecamatan')).toHaveLength(2)
    expect(screen.getAllByText('Pilih desa / kelurahan')).toHaveLength(2)
    expect(api.createAlamat).not.toHaveBeenCalled()
  })

  it('saves province, city, district, village, postal code and the village code', async () => {
    const user = setup()
    await waitFor(() => expect(screen.getByLabelText('Provinsi')).toBeEnabled())
    await isiDasar(user)
    await user.selectOptions(screen.getByLabelText('Provinsi'), 'Jawa Barat')
    await user.selectOptions(screen.getByLabelText('Kota / Kabupaten'), 'Kota Bandung')
    await waitFor(() => expect(screen.getByLabelText('Kecamatan')).toBeEnabled())
    await user.selectOptions(screen.getByLabelText('Kecamatan'), 'Sukasari')
    await user.selectOptions(screen.getByLabelText('Desa / Kelurahan'), 'Sukarasa')
    await user.click(screen.getByRole('button', { name: /simpan alamat/i }))
    await waitFor(() => expect(api.createAlamat).toHaveBeenCalledTimes(1))
    expect(api.createAlamat.mock.calls[0]![0]).toMatchObject({
      nama_penerima: 'Budi',
      alamat_lengkap: 'Jl. Cipaganti No. 5',
      provinsi: 'Jawa Barat',
      kota: 'Kota Bandung',
      kecamatan: 'Sukasari',
      kelurahan: 'Sukarasa',
      kode_pos: '40152',
      kode_wilayah: '32.73.01.1001',
      utama: false,
    })
  })
})
