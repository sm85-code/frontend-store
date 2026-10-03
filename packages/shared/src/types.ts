/** Response shapes of the `store` tenant in sm85-arch (/api/store/admin, /api/store/buyer).
 *  Money values are decimal STRINGS ("65000.00"), exactly as the backend sends them. */

export type AdminRole = 'owner' | 'admin'

export interface Admin {
  id: string
  nama: string
  email: string
  role: AdminRole
}

export interface Staff extends Admin {
  created_at: string
}

export interface Pembeli {
  id: string
  nama: string
  email: string
}

export interface Produk {
  id: string
  /** SEO URL segment (/produk/<slug>); absent on responses from a backend that predates slugs. */
  slug?: string | null
  nama: string
  deskripsi: string
  kategori_id: string | null
  kategori_nama: string | null
  harga: string
  stok: number
  foto_key: string | null
  foto_url: string | null
  aktif: boolean
  sumber: 'manual' | 'erp'
  /** Fields below come from a backend that supports gallery/variants; all optional so older responses still type-check. */
  harga_min?: string
  harga_max?: string
  foto?: FotoProduk[]
  berat_gram?: number
  panjang_cm?: string
  lebar_cm?: string
  tinggi_cm?: string
  preorder?: boolean
  hari_proses?: number
  varian?: Varian[]
}

export interface FotoProduk {
  id: string | null
  url: string | null
}

export interface Varian {
  id: string
  nama: string
  sku: string
  /** Effective price (own price, else the product's). */
  harga: string
  harga_sendiri: string | null
  stok: number
  berat_gram: number
  panjang_cm: string
  lebar_cm: string
  tinggi_cm: string
  berat_gram_sendiri: number | null
  panjang_cm_sendiri: string | null
  lebar_cm_sendiri: string | null
  tinggi_cm_sendiri: string | null
  foto_id: string | null
  foto_url: string | null
  aktif: boolean
}

export interface VarianInput {
  id?: string
  nama: string
  sku: string
  harga: string | null
  stok: number
  berat_gram: number | null
  panjang_cm: string | null
  lebar_cm: string | null
  tinggi_cm: string | null
  foto_id: string | null
  aktif: boolean
}

export interface ProdukInput {
  nama: string
  deskripsi: string
  kategori_id: string | null
  harga: string
  stok: number
  berat_gram?: number
  panjang_cm?: string
  lebar_cm?: string
  tinggi_cm?: string
  preorder?: boolean
  hari_proses?: number
}

export type ProdukPatch = Partial<ProdukInput> & { aktif?: boolean }

export interface Kategori {
  id: string
  nama: string
}

export interface KeranjangItem {
  /** Cart line id; absent on a backend that predates variants (then produk_id addresses the line). */
  id?: string
  produk_id: string
  varian_id?: string | null
  nama_varian?: string | null
  preorder?: boolean
  hari_proses?: number
  foto_url?: string | null
  nama: string
  harga: string
  qty: number
  subtotal: string
  stok_tersedia: number
}

export type StatusPesanan =
  | 'menunggu_pembayaran'
  | 'dibayar'
  | 'diproses'
  | 'dikirim'
  | 'selesai'
  | 'dibatalkan'

export interface ItemPesanan {
  produk_id: string
  varian_id?: string | null
  nama_varian?: string | null
  preorder?: boolean
  hari_proses?: number
  nama_produk: string
  harga_satuan: string
  qty: number
  subtotal: string
}

export interface Pesanan {
  id: string
  status: StatusPesanan
  total: string
  metode_pembayaran: string | null
  created_at: string
  items: ItemPesanan[]
}

export type StatusPengiriman = 'menunggu_pickup' | 'dikirim' | 'diterima' | 'bermasalah'

export interface Pengiriman {
  id: string
  pesanan_id: string
  kurir: string
  layanan: string
  /** Readable service name ("Reguler"); absent on responses from a backend that predates it. */
  layanan_nama?: string
  ongkir: string
  nama_penerima: string
  telepon_penerima: string
  alamat_tujuan: string
  /** Structured destination; absent on responses from a backend that predates it. */
  kelurahan_tujuan?: string
  kecamatan_tujuan?: string
  kota_tujuan?: string
  provinsi_tujuan?: string
  kode_pos_tujuan?: string
  kode_wilayah_tujuan?: string
  tracking_id: string | null
  status: StatusPengiriman
}

/** One courier service offered for the cart; the price is computed by the backend. */
export interface OpsiOngkir {
  kurir: string
  kurir_nama: string
  layanan: string
  layanan_nama: string
  ongkir: string
  estimasi: string
}

export interface PengirimanInput {
  kurir: string
  layanan: string
  ongkir?: string
  nama_penerima: string
  telepon_penerima: string
  alamat_tujuan: string
  kota_tujuan?: string
  provinsi_tujuan?: string
  kode_pos_tujuan?: string
  kecamatan_tujuan?: string
  kelurahan_tujuan?: string
  kode_wilayah_tujuan?: string
}

export interface Alamat {
  id: string
  label: string
  nama_penerima: string
  telepon_penerima: string
  alamat_lengkap: string
  kota: string
  provinsi: string
  kode_pos: string
  /** Added with the structured address; absent on rows/responses that predate it. */
  kecamatan?: string
  kelurahan?: string
  /** Kemendagri village code, e.g. 32.73.01.1001. */
  kode_wilayah?: string
  utama: boolean
}

export type AlamatInput = Omit<Alamat, 'id'>

export interface PesanChat {
  id: string
  pengirim_admin: boolean
  isi: string
  created_at: string
  /** Optional on a backend that predates attachments. */
  lampiran?: { jenis: 'gambar' | 'video'; url: string | null } | null
  produk?: { id: string; slug: string | null; nama: string; harga: string; foto_url: string | null } | null
}

export interface Percakapan {
  id: string
  user_id: string
  nama_pembeli: string | null
  unread_admin: boolean
  unread_pembeli: boolean
  updated_at: string
  pesan?: PesanChat[]
}

export interface LaporanPenjualan {
  dari: string
  sampai: string
  harian: { tanggal: string; jumlah_pesanan: number; total_penjualan: string }[]
  grand_total: string
}

export interface ProdukTerlaris {
  produk_id: string
  nama_produk: string
  total_qty: number
  total_omzet: string
}

export type RingkasanStatus = Partial<Record<StatusPesanan, number>>

export type MetodeProsesPesanan = 'pickup' | 'drop_off'

export interface Pengaturan {
  metode_proses_pesanan: MetodeProsesPesanan
  updated_at: string
}
