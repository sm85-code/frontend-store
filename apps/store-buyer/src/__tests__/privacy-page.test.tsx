import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Footer } from '@/components/Footer'
import KebijakanPrivasiPage from '@/app/kebijakan-privasi/page'

vi.mock('@/lib/kontak', () => ({ getKontak: async () => ({
  KONTAK: { nama: 'Toko Profil Baru', email: 'profil@gmail.com', telepon: '081234567890', jam: 'Senin 09.00–17.00', instagram: '', tiktok: '' }, WA_LINK: 'https://wa.me/6281234567890'
}) }))

describe('kebijakan privasi', () => {
  it('has the sections Google asks for: data collected, Google sign-in data, sharing, rights', async () => {
    render(await KebijakanPrivasiPage())
    expect(screen.getByRole('heading', { level: 1, name: 'Kebijakan Privasi' })).toBeInTheDocument()
    for (const heading of ['Data yang kami kumpulkan', 'Penggunaan data akun Google', 'Dengan siapa data dibagikan', 'Hak Anda']) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
    }
    expect(screen.getByText(/tidak pernah menerima/i)).toBeInTheDocument()
    expect(screen.getByText(/Toko Profil Baru/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'profil@gmail.com' })).toHaveAttribute('href', 'mailto:profil@gmail.com')
  })

  it('is reachable from the footer on every page', async () => {
    render(await Footer())
    expect(screen.getByRole('link', { name: 'Kebijakan Privasi' })).toHaveAttribute('href', '/kebijakan-privasi')
    expect(screen.getByRole('link', { name: 'profil@gmail.com' })).toHaveAttribute('href', 'mailto:profil@gmail.com')
    expect(screen.queryByText(/Instagram/)).not.toBeInTheDocument()
  })
})
