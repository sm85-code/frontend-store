import { BulkActions, useBulkSelection } from '@/components/BulkActions'
import { SlidersHorizontal, Plus } from 'lucide-react'
import { DropdownMenu } from 'radix-ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { fmtRp, type Produk } from '@store/shared'
import Spinner from '@/components/Spinner'
import TableShell from '@/components/TableShell'
import { useConfirm } from '@/components/ConfirmProvider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { ErrorLine, Field, PageTitle } from '@/components/erp'
import FotoManager from '@/components/FotoManager'
import VarianEditor from '@/components/VarianEditor'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { api, errorMessage } from '../lib/api'

import { ListPagination } from '../components/ListPagination'

const selectClass =
  'h-9 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const schema = z.object({
  nama: z.string().trim().min(1, 'Nama wajib diisi').max(255),
  deskripsi: z.string().max(5000),
  kategori_id: z.string(),
  harga: z.string().refine((v) => v !== '' && Number(v) >= 0, 'Harga tidak valid'),
  stok: z.string().refine((v) => /^\d+$/.test(v), 'Stok harus bilangan bulat ≥ 0'),
  berat_gram: z.string().refine((v) => /^\d+$/.test(v), 'Berat harus bilangan bulat (gram)'),
  panjang_cm: z.string().refine((v) => v !== '' && Number(v) >= 0, 'Angka tidak valid'),
  lebar_cm: z.string().refine((v) => v !== '' && Number(v) >= 0, 'Angka tidak valid'),
  tinggi_cm: z.string().refine((v) => v !== '' && Number(v) >= 0, 'Angka tidak valid'),
  preorder: z.boolean(),
  cod: z.boolean(),
  hari_proses: z.string(),
}).refine((v) => !v.preorder || (/^\d+$/.test(v.hari_proses) && Number(v.hari_proses) >= 3 && Number(v.hari_proses) <= 14), {
  path: ['hari_proses'],
  message: 'Pre-order 3 sampai 14 hari',
})
type Values = z.infer<typeof schema>

const empty: Values = {
  nama: '', deskripsi: '', kategori_id: '', harga: '', stok: '0',
  berat_gram: '0', panjang_cm: '0', lebar_cm: '0', tinggi_cm: '0', preorder: false, cod: false, hari_proses: '2',
}
const num = (v: string | number | undefined) => String(Number(v ?? 0))

function toValues(p: Produk): Values {
  return {
    nama: p.nama,
    deskripsi: p.deskripsi,
    kategori_id: p.kategori_id ?? '',
    harga: String(Number(p.harga)),
    stok: String(p.stok),
    berat_gram: num(p.berat_gram),
    panjang_cm: num(p.panjang_cm),
    lebar_cm: num(p.lebar_cm),
    tinggi_cm: num(p.tinggi_cm),
    preorder: p.preorder ?? false,
    cod: p.cod ?? false,
    hari_proses: String(p.hari_proses ?? 2),
  }
}

function ProdukForm({ produk: awal, onDone }: { produk: Produk | null; onDone: () => void }) {
  const qc = useQueryClient()
  const kategori = useQuery({ queryKey: ['kategori'], queryFn: api.listKategori })
  const kemampuan = useQuery({ queryKey: ['kemampuan'], queryFn: api.kemampuan })
  // Photos and variants save on their own and return the fresh product; keep it here so they stay in sync.
  const [produk, setProduk] = useState<Produk | null>(awal)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: awal ? toValues(awal) : empty })
  const preorder = watch('preorder')
  const [bp, bl, bt] = [watch('panjang_cm'), watch('lebar_cm'), watch('tinggi_cm')]
  const volumetrik = Math.ceil((Number(bp) * Number(bl) * Number(bt)) / 6000 * 1000)

  const simpan = useMutation({
    mutationFn: (v: Values) => {
      const input = {
        nama: v.nama.trim(),
        deskripsi: v.deskripsi,
        kategori_id: v.kategori_id || null,
        harga: v.harga,
        ...(!awal || !awal.varian?.length ? { stok: Number(v.stok), ...(awal ? { expected_stok: awal.stok } : {}) } : {}),
        berat_gram: Number(v.berat_gram),
        panjang_cm: v.panjang_cm,
        lebar_cm: v.lebar_cm,
        tinggi_cm: v.tinggi_cm,
        preorder: v.preorder,
        cod: v.cod,
        hari_proses: v.preorder ? Number(v.hari_proses) : 2,
      }
      return awal ? api.patchProduk(awal.id, input) : api.createProduk({ ...input, stok: Number(v.stok) })
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['produk'] })
      toast.success(awal ? 'Produk diperbarui' : 'Produk ditambahkan')
      onDone()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit((v) => simpan.mutate(v))}>
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
      <div className="flex min-w-0 flex-col gap-4">
      <Field label="Nama produk" htmlFor="p-nama" error={errors.nama?.message}>
        <Input id="p-nama" aria-invalid={!!errors.nama} {...register('nama')} />
      </Field>
      <Field label="Deskripsi" htmlFor="p-desk" error={errors.deskripsi?.message}>
        <Textarea id="p-desk" {...register('deskripsi')} />
      </Field>
      <Field label="Kategori" htmlFor="p-kat">
        <select id="p-kat" className={selectClass} {...register('kategori_id')} value={watch('kategori_id')} onChange={(e) => setValue('kategori_id', e.target.value)}>
          <option value="">Tanpa kategori</option>
          {kategori.data?.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Harga (Rp)" htmlFor="p-harga" error={errors.harga?.message}>
          <Input id="p-harga" inputMode="decimal" aria-invalid={!!errors.harga} {...register('harga')} />
        </Field>
        <Field label="Stok" htmlFor="p-stok" error={errors.stok?.message}>
          <Input id="p-stok" readOnly={!!produk?.varian?.length} inputMode="numeric" aria-invalid={!!errors.stok} {...register('stok')} />
        </Field>
      </div>
      {produk?.varian?.length ? (
        <p className="-mt-2 text-xs text-muted-foreground">Produk ini punya varian, jadi stok yang dijual dihitung dari stok tiap varian.</p>
      ) : null}

      <div className="flex flex-col gap-3 rounded-lg border p-3">
        <p className="text-sm font-medium">Berat &amp; dimensi (setelah dikemas)</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="Berat (gram)" htmlFor="p-berat" error={errors.berat_gram?.message}>
            <Input id="p-berat" inputMode="numeric" aria-invalid={!!errors.berat_gram} {...register('berat_gram')} />
          </Field>
          <Field label="Panjang (cm)" htmlFor="p-pj" error={errors.panjang_cm?.message}>
            <Input id="p-pj" inputMode="decimal" aria-invalid={!!errors.panjang_cm} {...register('panjang_cm')} />
          </Field>
          <Field label="Lebar (cm)" htmlFor="p-lb" error={errors.lebar_cm?.message}>
            <Input id="p-lb" inputMode="decimal" aria-invalid={!!errors.lebar_cm} {...register('lebar_cm')} />
          </Field>
          <Field label="Tinggi (cm)" htmlFor="p-tg" error={errors.tinggi_cm?.message}>
            <Input id="p-tg" inputMode="decimal" aria-invalid={!!errors.tinggi_cm} {...register('tinggi_cm')} />
          </Field>
        </div>
        {volumetrik > 0 ? (
          <p className="text-xs text-muted-foreground">Berat volumetrik (p × l × t ÷ 6000): {volumetrik} gram. Kurir memakai yang lebih besar.</p>
        ) : null}
      </div>

      </div>
      <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg border p-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" {...register('preorder')} /> Pre-order
        </label>
        {preorder ? (
          <Field label="Lama proses (hari, 3–14)" htmlFor="p-hari" error={errors.hari_proses?.message}>
            <Input id="p-hari" inputMode="numeric" className="max-w-28" aria-invalid={!!errors.hari_proses} {...register('hari_proses')} />
          </Field>
        ) : (
          <p className="text-xs text-muted-foreground">Bukan pre-order: barang ready, diproses dalam 2 hari.</p>
        )}
      </div>

      <div className="flex flex-col gap-1 rounded-lg border p-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" {...register('cod')} /> Bisa COD (bayar di tempat)
        </label>
        <p className="text-xs text-muted-foreground">
          Pembeli bisa memilih COD bila semua barang di keranjangnya COD dan nilai pesanan paling banyak {kemampuan.data ? fmtRp(kemampuan.data.cod_batas) : '—'}.
        </p>
      </div>

      {produk ? (
        <>
          <FotoManager produk={produk} onChange={setProduk} />
          <VarianEditor produk={produk} onChange={setProduk} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Foto dan varian bisa ditambahkan setelah produk disimpan.</p>
      )}
      </div>
      </div>

      <div className="sticky bottom-0 -mx-6 -mb-6 flex justify-end gap-2 border-t bg-background px-6 py-3">
        <Button type="button" variant="outline" onClick={onDone}>
          Batal
        </Button>
        <Button type="submit" disabled={simpan.isPending}>
          {simpan.isPending ? 'Menyimpan…' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}

export default function ProdukPage() {
  const qc = useQueryClient()
  const confirm = useConfirm()
  const [filterOpen, setFilterOpen] = useState(false)
  const [cari, setCari] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('terbaru')
  const produk = useQuery({ queryKey: ['produk', 'halaman', cari, page, sort], queryFn: () => api.daftarProduk({ halaman: page, cari, urutan: sort }) })
  const [editing, setEditing] = useState<Produk | 'baru' | null>(null)

  const aktifMut = useMutation({
    mutationFn: (p: Produk) => api.patchProduk(p.id, { aktif: !p.aktif }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['produk'] }),
    onError: (e) => toast.error(errorMessage(e)),
  })
  const hapusMut = useMutation({
    mutationFn: (id: string) => api.deleteProduk(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['produk'] })
      toast.success('Produk dihapus')
    },
    // A product that already appears in an order cannot be deleted (FK RESTRICT): tell the admin to deactivate it.
    onError: (e) => toast.error(errorMessage(e, 'Produk tidak bisa dihapus. Jika sudah pernah dipesan, nonaktifkan saja.')),
  })

  const rows = produk.data?.items ?? []
  const bulk = useBulkSelection(`${page}:${cari}:${sort}`, rows.map((p) => p.id))

  async function onDelete(p: Produk) {
    const ok = await confirm({
      title: 'Hapus produk?',
      description: `"${p.nama}" akan dihapus permanen. Produk yang sudah pernah dipesan sebaiknya dinonaktifkan saja.`,
      destructive: true,
    })
    if (ok) hapusMut.mutate(p.id)
  }

  return (
    <div className="space-y-4">
      <PageTitle title="Produk" actions={<Button size="sm" onClick={() => setEditing('baru')}><Plus className="size-4" />Tambah<span className="hidden sm:inline"> Produk</span></Button>} />

      <div className="flex items-center gap-2">
        <Input className="min-w-0 flex-1" aria-label="Cari produk" placeholder="Cari produk…" value={cari} onChange={(e) => { setCari(e.target.value); setPage(1) }} />
        <Button variant="outline" onClick={() => setFilterOpen(true)}><SlidersHorizontal className="size-4" />Urutan{sort !== 'terbaru' ? ' · aktif' : ''}</Button>
      </div>
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent><DialogHeader><DialogTitle>Urutan produk</DialogTitle></DialogHeader>
          <select aria-label="Urutan produk" className={selectClass} value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); setFilterOpen(false) }}><option value="terbaru">Terbaru</option><option value="nama">Nama A–Z</option><option value="harga">Harga tertinggi</option></select>
          <Button onClick={() => setFilterOpen(false)}>Selesai</Button>
        </DialogContent>
      </Dialog>

      <BulkActions ids={rows.map((p) => p.id)} selected={bulk.selected} setSelected={bulk.setSelected} actions={[{ label: 'Aktifkan', run: (id) => api.patchProduk(id, { aktif: true }) }, { label: 'Nonaktifkan', run: (id) => api.patchProduk(id, { aktif: false }) }, { label: 'Hapus', destructive: true, run: api.deleteProduk }]} onComplete={() => { for (const key of ['produk']) void qc.invalidateQueries({ queryKey: [key] }) }} />

      <Card className="border-0 bg-transparent shadow-none lg:border lg:bg-card lg:shadow-sm">
        <CardContent className="p-0 lg:p-6">
          {produk.isPending ? (
            <Spinner column label="Memuat produk…" />
          ) : produk.error ? (
            <ErrorLine message={errorMessage(produk.error)} />
          ) : (
            <>
            <ul className="space-y-3 lg:hidden" aria-label="Daftar produk">
              {rows.map((p) => (
                <li key={p.id} className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-start gap-3"><input type="checkbox" className="mt-1 shrink-0" aria-label={`Pilih ${p.nama}`} checked={bulk.selected.includes(p.id)} onChange={() => bulk.toggle(p.id)} />
                    {p.foto_url ? <img src={p.foto_url} alt="" loading="lazy" className="size-16 shrink-0 rounded-lg object-cover" /> : <div className="size-16 shrink-0 rounded-lg bg-muted" aria-hidden />}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="break-words font-medium leading-snug">{p.nama}</p>
                      <p className="text-sm text-muted-foreground">{p.kategori_nama ?? 'Tanpa kategori'}</p>
                      {p.preorder ? <p className="text-xs text-muted-foreground">Pre-order · {p.hari_proses} hari</p> : null}
                      {p.sumber === 'erp' ? <p className="text-xs text-muted-foreground">Dari ERP</p> : null}
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-3 border-t pt-3">
                    <div className="flex flex-wrap gap-x-2 font-semibold tabular-nums">
                      <span className="whitespace-nowrap">{fmtRp(p.harga_min ?? p.harga)}</span>
                      {p.harga_min && p.harga_max && p.harga_min !== p.harga_max ? <span className="whitespace-nowrap">– {fmtRp(p.harga_max)}</span> : null}
                    </div>
                    <span className="whitespace-nowrap text-sm text-muted-foreground">Stok {p.stok}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t pt-3">
                    <Badge variant={p.aktif ? 'default' : 'secondary'}>{p.aktif ? 'Aktif' : 'Nonaktif'}</Badge>
                    <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" aria-label={`Ubah ${p.nama}`} onClick={() => setEditing(p)}>Ubah</Button>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild><Button size="sm" variant="outline" aria-label={`Aksi lainnya ${p.nama}`}>•••</Button></DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content align="end" sideOffset={6} className="z-50 min-w-40 rounded-xl border bg-card p-1.5 shadow-lg">
                          <DropdownMenu.Item disabled={aktifMut.isPending} onSelect={() => aktifMut.mutate(p)} className="cursor-pointer rounded-lg px-3 py-2 text-sm outline-none focus:bg-muted data-[disabled]:opacity-50">{p.aktif ? 'Nonaktifkan' : 'Aktifkan'}</DropdownMenu.Item>
                          <DropdownMenu.Item disabled={hapusMut.isPending} onSelect={() => onDelete(p)} className="cursor-pointer rounded-lg px-3 py-2 text-sm text-destructive outline-none focus:bg-muted data-[disabled]:opacity-50">Hapus</DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                    </div>
                  </div>
                </li>
              ))}
              {rows.length === 0 ? <li className="py-8 text-center text-sm text-muted-foreground">{cari ? 'Tidak ada produk yang cocok.' : 'Belum ada produk.'}</li> : null}
            </ul>
            <div className="hidden lg:block">
            <TableShell minWidth={1000}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><span className="sr-only">Pilih</span></TableHead><TableHead>Produk</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                    <TableHead className="text-right">Stok</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p) => (
                    <TableRow key={p.id}><TableCell><input type="checkbox" aria-label={`Pilih ${p.nama}`} checked={bulk.selected.includes(p.id)} onChange={() => bulk.toggle(p.id)} /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {p.foto_url ? (
                            <img src={p.foto_url} alt="" loading="lazy" className="size-10 shrink-0 rounded-lg object-cover" />
                          ) : (
                            <div className="size-10 shrink-0 rounded-lg bg-muted" aria-hidden />
                          )}
                          <div>
                            <p className="min-w-56 max-w-sm break-words font-medium">{p.nama}</p>
                            {p.preorder ? (
                              <Badge variant="secondary" className="mr-1 mt-0.5">
                                Pre-order {p.hari_proses} hari
                              </Badge>
                            ) : null}
                            {p.sumber === 'erp' ? (
                              <Badge variant="secondary" className="mt-0.5">
                                Dari ERP
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{p.kategori_nama ?? '-'}</TableCell>
                      <TableCell className="whitespace-nowrap text-right tabular-nums">{p.harga_min && p.harga_max && p.harga_min !== p.harga_max ? `${fmtRp(p.harga_min)} – ${fmtRp(p.harga_max)}` : fmtRp(p.harga_min ?? p.harga)}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.stok}</TableCell>
                      <TableCell>
                        <Badge variant={p.aktif ? 'default' : 'secondary'}>{p.aktif ? 'Aktif' : 'Nonaktif'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={aktifMut.isPending}
                            aria-label={`${p.aktif ? 'Nonaktifkan' : 'Aktifkan'} ${p.nama}`}
                            onClick={() => aktifMut.mutate(p)}
                          >
                            {p.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                          </Button>
                          <Button size="sm" variant="ghost" aria-label={`Ubah ${p.nama}`} onClick={() => setEditing(p)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" aria-label={`Hapus ${p.nama}`} onClick={() => onDelete(p)}>
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        {cari ? 'Tidak ada produk yang cocok.' : 'Belum ada produk.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableShell>
            </div>
            </>
          )}
        </CardContent>
      </Card>

      <ListPagination page={page} total={produk.data?.total ?? 0} onChange={setPage} />
      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing === 'baru' ? 'Tambah Produk' : 'Edit Produk'}</DialogTitle>
          </DialogHeader>
          {editing !== null ? (
            <ProdukForm key={editing === 'baru' ? 'baru' : editing.id} produk={editing === 'baru' ? null : editing} onDone={() => setEditing(null)} />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
