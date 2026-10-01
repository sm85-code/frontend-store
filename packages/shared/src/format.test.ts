import { describe, expect, it } from 'vitest'
import { fmtRp, toDateInput } from './format'
import { LABEL_PESANAN, TRANSISI_PENGIRIMAN, TRANSISI_PESANAN } from './status'

describe('fmtRp', () => {
  it('formats decimal strings and numbers as rupiah', () => {
    expect(fmtRp('65000.00')).toBe('Rp 65.000')
    expect(fmtRp(1250000)).toBe('Rp 1.250.000')
    expect(fmtRp(null)).toBe('Rp 0')
    expect(fmtRp('abc')).toBe('Rp 0')
  })
})

describe('toDateInput', () => {
  it('uses the local calendar date', () => {
    expect(toDateInput(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('status transitions', () => {
  it('only allows the backend order flow', () => {
    expect(TRANSISI_PESANAN.menunggu_pembayaran).toEqual(['dibayar', 'dibatalkan'])
    expect(TRANSISI_PESANAN.selesai).toEqual([])
    expect(TRANSISI_PESANAN.dibatalkan).toEqual([])
  })

  it('has a label for every order status and a terminal shipment state', () => {
    for (const status of Object.keys(TRANSISI_PESANAN)) expect(LABEL_PESANAN).toHaveProperty(status)
    expect(TRANSISI_PENGIRIMAN.diterima).toEqual([])
  })
})
