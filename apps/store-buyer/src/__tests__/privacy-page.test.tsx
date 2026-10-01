import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Footer } from '@/components/Footer'
import KebijakanPrivasiPage from '@/app/kebijakan-privasi/page'

describe('kebijakan privasi', () => {
  it('has the sections Google asks for: data collected, Google sign-in data, sharing, rights', () => {
    render(<KebijakanPrivasiPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Kebijakan Privasi' })).toBeInTheDocument()
    for (const heading of ['Data yang kami kumpulkan', 'Penggunaan data akun Google', 'Dengan siapa data dibagikan', 'Hak Anda']) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
    }
    expect(screen.getByText(/tidak pernah menerima/i)).toBeInTheDocument()
  })

  it('is reachable from the footer on every page', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'Kebijakan Privasi' })).toHaveAttribute('href', '/kebijakan-privasi')
  })
})
