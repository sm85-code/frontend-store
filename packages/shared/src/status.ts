import type { StatusPengiriman, StatusPesanan } from './types'

/** Mirrors `_TRANSISI_STATUS` in the backend (store/application/services.py). Keep in sync. */
export const TRANSISI_PESANAN: Record<StatusPesanan, StatusPesanan[]> = {
  menunggu_konfirmasi: ['diproses', 'dibatalkan'],
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
  menunggu_konfirmasi: 'Menunggu konfirmasi',
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
  menunggu_konfirmasi: 'warning',
  menunggu_pembayaran: 'warning',
  dibayar: 'info',
  diproses: 'info',
  dikirim: 'info',
  selesai: 'success',
  dibatalkan: 'danger',
}

/** Largest order value (rupiah) that can be paid on delivery. Mirrors `COD_BATAS_TOTAL` in the backend. */
export const COD_BATAS = 500_000

/** Couriers the store can offer (Biteship codes). Mirrors `KURIR_DIDUKUNG` in the backend; instant couriers need coordinates and are left out. */
export const KURIR_PILIHAN: { kode: string; nama: string }[] = [
  { kode: 'jne', nama: 'JNE' },
  { kode: 'jnt', nama: 'J&T Express' },
  { kode: 'jntcargo', nama: 'J&T Cargo' },
  { kode: 'sicepat', nama: 'SiCepat' },
  { kode: 'anteraja', nama: 'AnterAja' },
  { kode: 'idexpress', nama: 'ID Express' },
  { kode: 'ninja', nama: 'Ninja Xpress' },
  { kode: 'lion', nama: 'Lion Parcel' },
  { kode: 'tiki', nama: 'TIKI' },
  { kode: 'pos', nama: 'POS Indonesia' },
  { kode: 'wahana', nama: 'Wahana' },
  { kode: 'rpx', nama: 'RPX' },
  { kode: 'sentralcargo', nama: 'Sentral Cargo' },
  { kode: 'dash_express', nama: 'Dash Express' },
  { kode: 'jdl', nama: 'JD Logistics' },
]
