import type { Produk, Varian, VarianInput } from '@store/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { api, errorMessage } from '../lib/api'

const selectClass =
  'h-9 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

interface Row {
  id?: string
  nama: string
  sku: string
  harga: string
  stok: string
  berat: string
  p: string
  l: string
  t: string
  foto_id: string
  aktif: boolean
}

const blank = (): Row => ({ nama: '', sku: '', harga: '', stok: '0', berat: '', p: '', l: '', t: '', foto_id: '', aktif: true })
const opt = (v: string | number | null | undefined) => (v === null || v === undefined || Number(v) === 0 ? '' : String(Number(v)))

function fromVarian(v: Varian): Row {
  return {
    id: v.id,
    nama: v.nama,
    sku: v.sku ?? '',
    harga: opt(v.harga_sendiri),
    stok: String(v.stok),
    berat: opt(v.berat_gram_sendiri),
    p: opt(v.panjang_cm_sendiri),
    l: opt(v.lebar_cm_sendiri),
    t: opt(v.tinggi_cm_sendiri),
    foto_id: v.foto_id ?? '',
    aktif: v.aktif,
  }
}

function toInput(r: Row): VarianInput {
  return {
    id: r.id,
    nama: r.nama.trim(),
    sku: r.sku.trim(),
    harga: r.harga === '' ? null : r.harga,
    stok: Number(r.stok),
    berat_gram: r.berat === '' ? null : Number(r.berat),
    panjang_cm: r.p === '' ? null : r.p,
    lebar_cm: r.l === '' ? null : r.l,
    tinggi_cm: r.t === '' ? null : r.t,
    foto_id: r.foto_id || null,
    aktif: r.aktif,
  }
}

function Num({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
      {label}
      <Input inputMode="decimal" value={value} placeholder={hint} aria-label={label} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

/** Optional variants (e.g. size/colour). Empty price, weight or size fields fall back to the product's values. */
export default function VarianEditor({ produk, onChange }: { produk: Produk; onChange: (p: Produk) => void }) {
  const qc = useQueryClient()
  const [rows, setRows] = useState<Row[]>(() => (produk.varian ?? []).map(fromVarian))
  const fotos = (produk.foto ?? []).filter((f): f is { id: string; url: string | null } => !!f.id)

  const simpan = useMutation({
    mutationFn: () => api.simpanVarian(produk.id, rows.map(toInput)),
    onSuccess: (p) => {
      onChange(p)
      setRows((p.varian ?? []).map(fromVarian))
      void qc.invalidateQueries({ queryKey: ['produk'] })
      toast.success('Varian disimpan')
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const set = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  function validasi(): string | null {
    for (const r of rows) {
      if (!r.nama.trim()) return 'Nama varian wajib diisi'
      if (!/^\d+$/.test(r.stok)) return `Stok varian "${r.nama}" harus bilangan bulat ≥ 0`
      if (r.berat !== '' && !/^\d+$/.test(r.berat)) return `Berat varian "${r.nama}" harus bilangan bulat (gram)`
      for (const v of [r.harga, r.p, r.l, r.t]) if (v !== '' && !(Number(v) >= 0)) return `Angka varian "${r.nama}" tidak valid`
    }
    const names = rows.map((r) => r.nama.trim().toLowerCase())
    return new Set(names).size === names.length ? null : 'Nama varian tidak boleh sama'
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Varian (opsional)</p>
          <p className="text-xs text-muted-foreground">
            Jika ada varian, stok dihitung per varian dan pembeli wajib memilih salah satu.
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => setRows((rs) => [...rs, blank()])} disabled={rows.length >= 50}>
          <Plus className="size-4" /> Varian
        </Button>
      </div>

      {rows.map((r, i) => (
        <div key={r.id ?? `n${i}`} className="flex flex-col gap-2 rounded-lg bg-muted/40 p-2.5">
          <div className="flex items-center gap-2">
            <Input aria-label={`Nama varian ${i + 1}`} placeholder="Nama varian (mis. Merah / XL)" value={r.nama} onChange={(e) => set(i, { nama: e.target.value })} />
            <label className="flex shrink-0 items-center gap-1.5 text-xs">
              <input type="checkbox" checked={r.aktif} onChange={(e) => set(i, { aktif: e.target.checked })} /> Aktif
            </label>
            <Button type="button" size="icon" variant="ghost" aria-label={`Hapus varian ${i + 1}`} onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}>
              <Trash2 className="size-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Num label="Harga (Rp)" hint="ikut produk" value={r.harga} onChange={(v) => set(i, { harga: v })} />
            <Num label="Stok" value={r.stok} onChange={(v) => set(i, { stok: v })} />
            <Num label="Berat (gram)" hint="ikut produk" value={r.berat} onChange={(v) => set(i, { berat: v })} />
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              SKU
              <Input aria-label="SKU" value={r.sku} onChange={(e) => set(i, { sku: e.target.value })} />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Num label="Panjang (cm)" hint="ikut produk" value={r.p} onChange={(v) => set(i, { p: v })} />
            <Num label="Lebar (cm)" hint="ikut produk" value={r.l} onChange={(v) => set(i, { l: v })} />
            <Num label="Tinggi (cm)" hint="ikut produk" value={r.t} onChange={(v) => set(i, { t: v })} />
          </div>
          {fotos.length ? (
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Foto varian
              <select className={selectClass} value={r.foto_id} onChange={(e) => set(i, { foto_id: e.target.value })}>
                <option value="">Tanpa foto khusus</option>
                {fotos.map((f, k) => (
                  <option key={f.id} value={f.id}>
                    Foto {k + 1}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      ))}

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          disabled={simpan.isPending}
          onClick={() => {
            const err = validasi()
            if (err) return toast.error(err)
            simpan.mutate()
          }}
        >
          {simpan.isPending ? 'Menyimpan…' : 'Simpan varian'}
        </Button>
      </div>
    </div>
  )
}
