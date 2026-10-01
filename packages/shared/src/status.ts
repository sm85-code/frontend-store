import type { StatusPengiriman, StatusPesanan } from './types'

/** Mirrors `_TRANSISI_STATUS` in the backend (store/application/services.py). Keep in sync. */
export const TRANSISI_PESANAN: Record<StatusPesanan, StatusPesanan[]> = {
  menunggu_pembayaran: ['dibayar', 'dibatalkan'],
  dibayar: ['diproses', 'dibatalkan'],
  diproses: ['dikirim'],
  dikirim: ['selesai'],
  selesai: [],
  dibatalkan: [],
}

/** Mirrors `_TRANSISI_STATUS_PENGIRIMAN`. */
export const TRANSISI_PENGIRIMAN: Record<StatusPengiriman, StatusPengiriman[]> = {
  menunggu_pickup: ['dikirim', 'bermasalah'],
  dikirim: ['diterima', 'bermasalah'],
  diterima: [],
  bermasalah: ['dikirim'],
}

export const LABEL_PESANAN: Record<StatusPesanan, string> = {
  menunggu_pembayaran: 'Menunggu pembayaran',
  dibayar: 'Dibayar',
  diproses: 'Diproses',
  dikirim: 'Dikirim',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
}

export const LABEL_PENGIRIMAN: Record<StatusPengiriman, string> = {
  menunggu_pickup: 'Menunggu pickup',
  dikirim: 'Dalam pengiriman',
  diterima: 'Diterima',
  bermasalah: 'Bermasalah',
}

export const STATUS_PESANAN_URUT = Object.keys(TRANSISI_PESANAN) as StatusPesanan[]

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

export const TONE_PESANAN: Record<StatusPesanan, Tone> = {
  menunggu_pembayaran: 'warning',
  dibayar: 'info',
  diproses: 'info',
  dikirim: 'info',
  selesai: 'success',
  dibatalkan: 'danger',
}
