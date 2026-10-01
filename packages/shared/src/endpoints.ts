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
    getPesanan: (id: string) => c.get<Pesanan>(`/pesanan/${id}`),
    ubahStatusPesanan: (id: string, status: StatusPesanan) => c.patch<Pesanan>(`/pesanan/${id}/status`, { status }),
    getPengiriman: (id: string) => c.get<Pengiriman>(`/pesanan/${id}/pengiriman`),
    buatPengiriman: (id: string, input: PengirimanInput) => c.post<Pengiriman>(`/pesanan/${id}/pengiriman`, input),
    ubahStatusPengiriman: (id: string, status: StatusPengiriman, tracking_id?: string) =>
      c.patch<Pengiriman>(`/pesanan/${id}/pengiriman/status`, { status, tracking_id: tracking_id || null }),

    laporanPenjualan: (r: Range) => c.get<LaporanPenjualan>('/laporan/penjualan', { query: r }),
    laporanProdukTerlaris: (r: Range & { limit?: number }) => c.get<ProdukTerlaris[]>('/laporan/produk-terlaris', { query: r }),
    laporanRingkasanStatus: () => c.get<RingkasanStatus>('/laporan/ringkasan-status'),

    listChat: () => c.get<Percakapan[]>('/chat'),
    getChat: (id: string) => c.get<Percakapan>(`/chat/${id}`),
    kirimChat: (id: string, isi: string) => c.post<Percakapan>(`/chat/${id}`, { isi }),

    getPengaturan: () => c.get<Pengaturan>('/pengaturan'),
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

    checkout: () => c.post<Pesanan>('/pesanan/checkout'),
    listPesanan: () => c.get<Pesanan[]>('/pesanan'),
    getPesanan: (id: string) => c.get<Pesanan>(`/pesanan/${id}`),
    isiPengiriman: (id: string, input: PengirimanInput) => c.post<Pengiriman>(`/pesanan/${id}/pengiriman`, input),
    getPengiriman: (id: string) => c.get<Pengiriman>(`/pesanan/${id}/pengiriman`),
    bayar: (id: string) => c.post<{ checkout_url: string }>(`/pesanan/${id}/bayar`),

    getChat: () => c.get<Percakapan>('/chat'),
    kirimChat: (isi: string) => c.post<Percakapan>('/chat', { isi }),
  }
}

export type AdminApi = ReturnType<typeof adminEndpoints>
export type BuyerApi = ReturnType<typeof buyerEndpoints>
