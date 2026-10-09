import type { Client } from './client'
import type {
  Admin,
  Alamat,
  AlamatInput,
  Kategori,
  KeranjangItem,
  LaporanPenjualan,
  Pembeli,
  Pengaturan,
  PengaturanPengirimanInput,
  LabelPengiriman,
  LacakPengiriman,
  OpsiOngkir,
  Pengiriman,
  PengirimanInput,
  Percakapan,
  Pesanan,
  Produk,
  ProdukInput,
  ProdukPatch,
  ProdukTerlaris,
  RingkasanStatus,
  Staff,
  StatusPengiriman,
  StatusPesanan,
  VarianInput,
} from './types'

export const ADMIN_PREFIX = '/api/store/admin'
export const BUYER_PREFIX = '/api/store/buyer'

type Range = { dari: string; sampai: string }

export function adminEndpoints(c: Client) {
  return {
    login: (email: string, password: string) => c.post<Admin>('/auth/login', { email, password }),
    logout: () => c.post<{ ok: true }>('/auth/logout'),
    me: () => c.get<Admin>('/auth/me'),
    gantiPassword: (current_password: string, new_password: string) =>
      c.post<{ ok: true }>('/auth/ganti-password', { current_password, new_password }),

    daftarProduk: (query: { halaman: number; cari: string; urutan?: string }) =>
      c.get<{ items: Produk[]; total: number }>('/daftar/produk', { query }),
    daftarPesanan: (query: { halaman: number; cari: string; status_filter?: string; dari?: string; sampai?: string; urutan?: string }) =>
      c.get<{ items: (Pesanan & { nama_pembeli?: string })[]; total: number }>('/daftar/pesanan', { query }),
    listProduk: () => c.get<Produk[]>('/produk'),
    createProduk: (input: ProdukInput) => c.post<Produk>('/produk', input),
    patchProduk: (id: string, patch: ProdukPatch) => c.patch<Produk>(`/produk/${id}`, patch),
    deleteProduk: (id: string) => c.delete<{ ok: true }>(`/produk/${id}`),
    uploadFoto: (id: string, file: File) => {
      const form = new FormData()
      form.append('file', file)
      return c.post<Produk>(`/produk/${id}/foto`, form)
    },

    deleteFoto: (id: string, fotoId: string) => c.delete<Produk>(`/produk/${id}/foto/${fotoId}`),
    urutkanFoto: (id: string, ids: string[]) => c.put<Produk>(`/produk/${id}/foto/urutan`, { ids }),
    simpanVarian: (id: string, varian: VarianInput[]) => c.put<Produk>(`/produk/${id}/varian`, { varian }),

    listKategori: () => c.get<Kategori[]>('/kategori'),
    createKategori: (nama: string) => c.post<Kategori>('/kategori', { nama }),
    deleteKategori: (id: string) => c.delete<{ ok: true }>(`/kategori/${id}`),

    listPesanan: () => c.get<Pesanan[]>('/pesanan'),
    verifikasiPembayaran: (id: string, transactionId: string) => c.post<Pesanan>(`/pesanan/${id}/verifikasi-pembayaran?transaction_id=${encodeURIComponent(transactionId)}`),
    rekonsiliasiKurir: (id: string, orderId: string) => c.post<Pengiriman>(`/pesanan/${id}/rekonsiliasi-kurir?order_id=${encodeURIComponent(orderId)}`),
    getPesanan: (id: string) => c.get<Pesanan>(`/pesanan/${id}`),
    ubahStatusPesanan: (id: string, status: StatusPesanan) => c.patch<Pesanan>(`/pesanan/${id}/status`, { status }),
    getPengiriman: (id: string) => c.get<Pengiriman>(`/pesanan/${id}/pengiriman`),
    buatPengiriman: (id: string, input: PengirimanInput) => c.post<Pengiriman>(`/pesanan/${id}/pengiriman`, input),
    labelPengiriman: (id: string) => c.get<LabelPengiriman>(`/pesanan/${id}/pengiriman/label`),
    opsiKurir: (id: string) => c.get<OpsiOngkir[]>(`/pesanan/${id}/pengiriman/opsi-kurir`),
    gantiKurir: (id: string, kurir: string, layanan: string) =>
      c.put<Pengiriman>(`/pesanan/${id}/pengiriman/kurir`, { kurir, layanan }),
    buatPengirimanBiteship: (id: string) => c.post<Pengiriman>(`/pesanan/${id}/pengiriman/biteship`),
    lacakPengiriman: (id: string) => c.get<LacakPengiriman>(`/pesanan/${id}/pengiriman/lacak`),
    ubahStatusPengiriman: (id: string, status: StatusPengiriman, tracking_id?: string) =>
      c.patch<Pengiriman>(`/pesanan/${id}/pengiriman/status`, { status, tracking_id: tracking_id || null }),

    laporanPenjualan: (r: Range) => c.get<LaporanPenjualan>('/laporan/penjualan', { query: r }),
    laporanProdukTerlaris: (r: Range & { limit?: number }) => c.get<ProdukTerlaris[]>('/laporan/produk-terlaris', { query: r }),
    laporanRingkasanStatus: () => c.get<RingkasanStatus>('/laporan/ringkasan-status'),

    daftarChat: (query: { halaman: number; cari: string; unread: boolean; unanswered: boolean }) => c.get<{ items: Percakapan[]; total: number }>('/chat-halaman', { query }),
    listChat: () => c.get<Percakapan[]>('/chat'),
    pesananChat: (id: string) => c.get<Pesanan[]>(`/chat/${id}/pesanan`),
    getChat: (id: string, before?: string) => c.get<Percakapan>(`/chat/${id}`, { query: { before } }),
    kirimChat: (id: string, isi: string, produk_id?: string | null, pesanan_id?: string | null) =>
      c.post<Percakapan>(`/chat/${id}`, { isi, produk_id: produk_id ?? null, pesanan_id }),
    kirimLampiranChat: (id: string, file: File, isi = '') => {
      const form = new FormData()
      form.append('file', file)
      form.append('isi', isi)
      return c.post<Percakapan>(`/chat/${id}/lampiran`, form)
    },

    getPengaturan: () => c.get<Pengaturan>('/pengaturan'),
    patchPengaturanPengiriman: (input: PengaturanPengirimanInput) => c.patch<Pengaturan>('/pengaturan/pengiriman', input),
    patchPengaturan: (metode_proses_pesanan: Pengaturan['metode_proses_pesanan']) =>
      c.patch<Pengaturan>('/pengaturan', { metode_proses_pesanan }),

    listStaff: () => c.get<Staff[]>('/staff'),
    createStaff: (input: { nama: string; email: string; password: string }) => c.post<Staff>('/staff', input),
    patchStaff: (id: string, nama: string) => c.patch<Staff>(`/staff/${id}`, { nama }),
    deleteStaff: (id: string) => c.delete<{ ok: true }>(`/staff/${id}`),
  }
}

export function buyerEndpoints(c: Client) {
  return {
    register: (input: { nama: string; email: string; password: string }) => c.post<Pembeli>('/auth/register', input),
    login: (email: string, password: string) => c.post<Pembeli>('/auth/login', { email, password }),
    loginGoogle: (id_token: string) => c.post<Pembeli>('/auth/google', { id_token }),
    logout: () => c.post<{ ok: true }>('/auth/logout'),
    me: () => c.get<Pembeli>('/auth/me'),

    listProduk: (init?: RequestInit) => c.get<Produk[]>('/produk', { init }),
    getProduk: (ref: string, init?: RequestInit) => c.get<Produk>(`/produk/${encodeURIComponent(ref)}`, { init }),
    listKategori: (init?: RequestInit) => c.get<Kategori[]>('/kategori', { init }),

    listAlamat: () => c.get<Alamat[]>('/alamat'),
    createAlamat: (input: AlamatInput) => c.post<Alamat>('/alamat', input),
    patchAlamat: (id: string, patch: Partial<AlamatInput>) => c.patch<Alamat>(`/alamat/${id}`, patch),
    deleteAlamat: (id: string) => c.delete<{ ok: true }>(`/alamat/${id}`),

    getKeranjang: () => c.get<KeranjangItem[]>('/keranjang'),
    tambahKeranjang: (produk_id: string, qty = 1, varian_id?: string | null) =>
      c.post<KeranjangItem>('/keranjang', { produk_id, qty, varian_id: varian_id ?? null }),
    /** `ref` is the cart line id (or the product id for a product without variants). */
    ubahKeranjang: (ref: string, qty: number) => c.patch<KeranjangItem>(`/keranjang/${ref}`, { qty }),
    hapusKeranjang: (ref: string) => c.delete<{ ok: true }>(`/keranjang/${ref}`),

    kemampuan: () => c.get<{ cod_batas: number; pengiriman_aktif: boolean }>('/kemampuan'),
    checkout: (cod = false, pengiriman?: PengirimanInput) => c.post<Pesanan>('/pesanan/checkout', { cod, pengiriman }),
    listPesanan: () => c.get<Pesanan[]>('/pesanan'),
    getPesanan: (id: string) => c.get<Pesanan>(`/pesanan/${id}`),
    cekOngkir: (kode_pos_tujuan: string, cod = false, pesanan_id?: string) =>
      c.post<OpsiOngkir[]>('/pengiriman/cek-ongkir', { kode_pos_tujuan, cod, pesanan_id }),
    isiPengiriman: (id: string, input: PengirimanInput) => c.post<Pengiriman>(`/pesanan/${id}/pengiriman`, input),
    getPengiriman: (id: string) => c.get<Pengiriman>(`/pesanan/${id}/pengiriman`),
    lacakPengiriman: (id: string) => c.get<LacakPengiriman>(`/pesanan/${id}/pengiriman/lacak`),
    bayar: (id: string) => c.post<{ checkout_url: string }>(`/pesanan/${id}/bayar`),

    getChat: (before?: string) => c.get<Percakapan>('/chat', { query: { before } }),
    kirimChat: (isi: string, produk_id?: string | null, pesanan_id?: string | null) => c.post<Percakapan>('/chat', { isi, produk_id: produk_id ?? null, pesanan_id }),
    kirimLampiranChat: (file: File, isi = '') => {
      const form = new FormData()
      form.append('file', file)
      form.append('isi', isi)
      return c.post<Percakapan>('/chat/lampiran', form)
    },
  }
}

export type AdminApi = ReturnType<typeof adminEndpoints>
export type BuyerApi = ReturnType<typeof buyerEndpoints>
