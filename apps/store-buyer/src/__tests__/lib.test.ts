import type { KeranjangItem, Produk } from '@store/shared'
import { describe, expect, it } from 'vitest'
import { filterProduk } from '@/lib/catalog'
import { QueryClient } from '@tanstack/react-query'
import { ME_KEY, cartCount, cartTotal, dropSession } from '@/lib/queries'
import { safeNext } from '@/lib/safe-next'

describe('safeNext (post-login redirect)', () => {
  it('keeps same-site relative paths, including query strings', () => {
    expect(safeNext('/checkout')).toBe('/checkout')
    expect(safeNext('/produk/abc?x=1')).toBe('/produk/abc?x=1')
  })

  it('falls back for missing values', () => {
    expect(safeNext(null)).toBe('/')
    expect(safeNext('')).toBe('/')
    expect(safeNext(undefined, '/pesanan')).toBe('/pesanan')
  })

  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    'javascript:alert(1)',
    'evil.example/path',
    '/ok\nSet-Cookie: x=1',
  ])('rejects open-redirect attempt %j', (value) => {
    expect(safeNext(value)).toBe('/')
  })
})

const p = (over: Partial<Produk>): Produk => ({
  id: 'x', nama: 'Produk', deskripsi: '', kategori_id: null, kategori_nama: null, harga: '1000', stok: 1,
  foto_key: null, foto_url: null, aktif: true, sumber: 'manual', ...over,
})

describe('filterProduk', () => {
  const list = [p({ id: '1', nama: 'Beras Premium', kategori_id: 'k1' }), p({ id: '2', nama: 'Gula Pasir', kategori_id: 'k2' })]

  it('filters by name (case-insensitive) and category, and returns everything with no filter', () => {
    expect(filterProduk(list, undefined, undefined)).toHaveLength(2)
    expect(filterProduk(list, 'beras', undefined).map((x) => x.id)).toEqual(['1'])
    expect(filterProduk(list, undefined, 'k2').map((x) => x.id)).toEqual(['2'])
    expect(filterProduk(list, 'beras', 'k2')).toEqual([])
    expect(filterProduk(list, '  GULA ', undefined).map((x) => x.id)).toEqual(['2'])
  })
})

describe('cart helpers', () => {
  const items: KeranjangItem[] = [
    { produk_id: 'a', nama: 'A', harga: '1000.00', qty: 2, subtotal: '2000.00', stok_tersedia: 5 },
    { produk_id: 'b', nama: 'B', harga: '500.50', qty: 1, subtotal: '500.50', stok_tersedia: 5 },
  ]

  it('sums quantity and the backend-computed subtotals', () => {
    expect(cartCount(items)).toBe(3)
    expect(cartTotal(items)).toBeCloseTo(2500.5)
    expect(cartCount(undefined)).toBe(0)
    expect(cartTotal(undefined)).toBe(0)
  })
})

describe('dropSession (sign out)', () => {
  it('turns the existing me query into signed-out and removes the other cached data', () => {
    const qc = new QueryClient()
    qc.setQueryData(ME_KEY, { id: '1', nama: 'Budi', email: 'b@x.com' })
    qc.setQueryData(['keranjang'], [{ produk_id: 'a' }])
    qc.setQueryData(['pesanan'], [])
    const meQuery = qc.getQueryCache().find({ queryKey: ME_KEY })

    dropSession(qc)

    expect(qc.getQueryData(ME_KEY)).toBeNull()
    // same query object: mounted observers keep tracking it and see the null
    expect(qc.getQueryCache().find({ queryKey: ME_KEY })).toBe(meQuery)
    expect(qc.getQueryData(['keranjang'])).toBeUndefined()
    expect(qc.getQueryData(['pesanan'])).toBeUndefined()
  })
})
