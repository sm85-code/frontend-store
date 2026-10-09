import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ChatBubble, ChatComposer } from './chat'

const baseProduk = [{ id: 'p1', nama: 'Kaos Polos', harga: '50000', foto_url: null }]

describe('ChatBubble', () => {
  it('links urls but never renders markup', () => {
    const { container } = render(
      <ul>
        <ChatBubble pesan={{ id: '1', isi: 'lihat https://a.id/x <b>tebal</b> 😊', created_at: '' }} milik={false} waktu="10:00" />
      </ul>,
    )
    expect(screen.getByRole('link', { name: 'https://a.id/x' }).getAttribute('rel')).toContain('noopener')
    expect(container.querySelector('b')).toBeNull()
    expect(container.textContent).toContain('<b>tebal</b> 😊')
  })

  it('shows a video player and a product card link', () => {
    const { container } = render(
      <ul>
        <ChatBubble
          pesan={{ id: '1', isi: '', created_at: '', lampiran: { jenis: 'video', url: 'https://img/x.mp4' }, produk: { id: 'p1', slug: 's', nama: 'Kaos', harga: '50000', foto_url: null } }}
          milik
          waktu="x"
          produkHref={(p) => `/produk/${p.slug}`}
        />
      </ul>,
    )
    expect(container.querySelector('video')).not.toBeNull()
    expect(screen.getByRole('link', { name: /Kaos/ }).getAttribute('href')).toBe('/produk/s')
  })
})

describe('ChatComposer', () => {
  const setup = () => {
    const props = { produk: baseProduk, onKirimTeks: vi.fn().mockResolvedValue(undefined), onKirimFile: vi.fn().mockResolvedValue(undefined), onTolak: vi.fn() }
    render(<ChatComposer {...props} />)
    return props
  }

  it('inserts an emoji and sends text', async () => {
    const p = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Emoji' }))
    fireEvent.click(screen.getByRole('button', { name: 'Emoji 😊' }))
    fireEvent.click(screen.getByRole('button', { name: 'Kirim' }))
    await waitFor(() => expect(p.onKirimTeks).toHaveBeenCalledWith('😊', null))
  })

  it('attaches a product card', async () => {
    const p = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Kirim link produk' }))
    fireEvent.click(screen.getByRole('button', { name: /Kaos Polos/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Kirim' }))
    await waitFor(() => expect(p.onKirimTeks).toHaveBeenCalledWith('', 'p1'))
  })

  it('rejects an oversized video and a wrong file type', () => {
    const p = setup()
    const input = document.querySelector('input[type=file]') as HTMLInputElement
    const big = new File(['x'], 'v.mp4', { type: 'video/mp4' })
    Object.defineProperty(big, 'size', { value: 21 * 1024 * 1024 })
    fireEvent.change(input, { target: { files: [big] } })
    fireEvent.change(input, { target: { files: [new File(['x'], 'a.pdf', { type: 'application/pdf' })] } })
    expect(p.onTolak).toHaveBeenCalledTimes(2)
  })

  it('sends a picked photo with its caption', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:x')
    URL.revokeObjectURL = vi.fn()
    const p = setup()
    const input = document.querySelector('input[type=file]') as HTMLInputElement
    const img = new File(['x'], 'a.jpg', { type: 'image/jpeg' })
    fireEvent.change(input, { target: { files: [img] } })
    fireEvent.change(screen.getByLabelText('Pesan'), { target: { value: 'ini ya' } })
    fireEvent.click(screen.getByRole('button', { name: 'Kirim' }))
    await waitFor(() => expect(p.onKirimFile).toHaveBeenCalledWith(img, 'ini ya'))
  })
})

it('sends a selected buyer order without requiring text', async () => {
  const send = vi.fn().mockResolvedValue({})
  render(<ChatComposer produk={[]} pesanan={[{ id: 'o1', total: '100000' }]} onKirimTeks={send} onKirimFile={vi.fn()} onTolak={vi.fn()} />)
  fireEvent.change(screen.getByLabelText('Lampirkan pesanan pembeli'), { target: { value: 'o1' } })
  fireEvent.click(screen.getByRole('button', { name: 'Kirim' }))
  await waitFor(() => expect(send).toHaveBeenCalledWith('', null, 'o1'))
})
