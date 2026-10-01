// @vitest-environment node
import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { activeTab } from '@/components/BottomNav'
import { canonicalRedirect, looksLikeId, produkHref, segeraHabis } from '@/lib/catalog'
import { proxy } from '@/proxy'

const ID = '3f2b8c1e-5a4d-4e6f-9b7a-0c1d2e3f4a5b'

afterEach(() => vi.unstubAllGlobals())

describe('product addresses', () => {
  it('links by slug, falling back to the id while an older backend has none', () => {
    expect(produkHref({ id: ID, slug: 'kopi-arabika' })).toBe('/produk/kopi-arabika')
    expect(produkHref({ id: ID, slug: null })).toBe(`/produk/${ID}`)
    expect(produkHref({ id: ID })).toBe(`/produk/${ID}`)
  })

  it('redirects any other spelling of the address to the slug, and leaves the canonical one alone', () => {
    expect(canonicalRedirect(ID, { slug: 'kopi' })).toBe('/produk/kopi')
    expect(canonicalRedirect('Kopi', { slug: 'kopi' })).toBe('/produk/kopi')
    expect(canonicalRedirect('kopi', { slug: 'kopi' })).toBeNull()
    expect(canonicalRedirect(ID, { slug: null })).toBeNull()
  })

  it('tells ids from slugs', () => {
    expect(looksLikeId(ID)).toBe(true)
    expect(looksLikeId('kopi-arabika-250g')).toBe(false)
  })
})

describe('proxy: status codes of product pages', () => {
  const reply = (status: number, body: unknown = {}) => vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }))
  const passesThrough = (res: Response) => res.headers.get('x-middleware-next') === '1'

  it('answers an old id link with a permanent 308 to the slug address', async () => {
    vi.stubGlobal('fetch', reply(200, { slug: 'kopi-arabika' }))
    const res = await proxy(new NextRequest(`https://ampelkuning.com/produk/${ID}`))
    expect(res.status).toBe(308)
    expect(res.headers.get('location')).toBe('https://ampelkuning.com/produk/kopi-arabika')
  })

  it('lets the canonical slug address through', async () => {
    vi.stubGlobal('fetch', reply(200, { slug: 'kopi-arabika' }))
    expect(passesThrough(await proxy(new NextRequest('https://ampelkuning.com/produk/kopi-arabika')))).toBe(true)
  })

  it('answers an unknown product with a real 404 instead of a streamed 200', async () => {
    vi.stubGlobal('fetch', reply(404))
    const res = await proxy(new NextRequest('https://ampelkuning.com/produk/tidak-ada'))
    expect(res.status).toBe(404)
    expect(res.headers.get('x-middleware-rewrite')).toContain('/produk-tidak-ditemukan')
  })

  it.each([
    ['a backend without slugs', () => reply(200, { slug: null })],
    ['a backend error', () => reply(500)],
    ['an unreachable backend', () => vi.fn().mockRejectedValue(new Error('down'))],
  ])('falls through to the page on %s', async (_name, make) => {
    vi.stubGlobal('fetch', make())
    expect(passesThrough(await proxy(new NextRequest(`https://ampelkuning.com/produk/${ID}`)))).toBe(true)
  })
})

describe('storefront helpers', () => {
  it('lists only products that are nearly sold out', () => {
    const p = (stok: number) => ({ id: String(stok), nama: 'x', stok }) as never
    expect(segeraHabis([p(0), p(1), p(5), p(6), p(40)]).map((x: { stok: number }) => x.stok)).toEqual([1, 5])
  })

  it('lights the right bottom tab (exact for home, prefix for the rest, none on product pages)', () => {
    const tabs = [
      { href: '/', match: ['/'] },
      { href: '/pesanan', match: ['/pesanan'] },
      { href: '/keranjang', match: ['/keranjang', '/checkout'] },
    ]
    expect(activeTab('/', tabs)).toBe('/')
    expect(activeTab('/pesanan/abc', tabs)).toBe('/pesanan')
    expect(activeTab('/checkout', tabs)).toBe('/keranjang')
    expect(activeTab('/produk/kopi', tabs)).toBeNull()
  })
})
