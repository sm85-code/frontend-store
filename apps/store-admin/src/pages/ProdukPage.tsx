import { zodResolver } from '@hookform/resolvers/zod'
import { fmtRp, type Produk } from '@store/shared'
import Spinner from '@/components/Spinner'
import TableShell from '@/components/TableShell'
import { useConfirm } from '@/components/ConfirmProvider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { ErrorLine, Field, PageTitle } from '@/components/erp'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ImageUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { api, errorMessage } from '../lib/api'

const selectClass =
  'h-9 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const schema = z.object({
  nama: z.string().trim().min(1, 'Nama wajib diisi').max(255),
  deskripsi: z.string().max(5000),
  kategori_id: z.string(),
  harga: z.string().refine((v) => v !== '' && Number(v) >= 0, 'Harga tidak valid'),
  stok: z.string().refine((v) => /^\d+$/.test(v), 'Stok harus bilangan bulat ≥ 0'),
})
type Values = z.infer<typeof schema>

const empty: Values = { nama: '', deskripsi: '', kategori_id: '', harga: '', stok: '0' }

function toValues(p: Produk): Values {
  return {
    nama: p.nama,
    deskripsi: p.deskripsi,
    kategori_id: p.kategori_id ?? '',
    harga: String(Number(p.harga)),
    stok: String(p.stok),
  }
}

function ProdukForm({ produk, onDone }: { produk: Produk | null; onDone: () => void }) {
  const qc = useQueryClient()
  const kategori = useQuery({ queryKey: ['kategori'], queryFn: api.listKategori })
  const [fotoNotice, setFotoNotice] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: produk ? toValues(produk) : empty })

  const simpan = useMutation({
    mutationFn: (v: Values) => {
      const input = {
        nama: v.nama.trim(),
        deskripsi: v.deskripsi,
        kategori_id: v.kategori_id || null,
        harga: v.harga,
        stok: Number(v.stok),
      }
      return produk ? api.patchProduk(produk.id, input) : api.createProduk(input)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['produk'] })
      toast.success(produk ? 'Produk diperbarui' : 'Produk ditambahkan')
      onDone()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const foto = useMutation({
    mutationFn: (file: File) => api.uploadFoto(produk!.id, file),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['produk'] })
      toast.success('Foto diunggah')
    },
    onError: (e: Error & { isNotReady?: boolean }) =>
      e.isNotReady ? setFotoNotice(e.message) : toast.error(errorMessage(e)),
  })

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit((v) => simpan.mutate(v))}>
      <Field label="Nama produk" htmlFor="p-nama" error={errors.nama?.message}>
        <Input id="p-nama" aria-invalid={!!errors.nama} {...register('nama')} />
      </Field>
      <Field label="Deskripsi" htmlFor="p-desk" error={errors.deskripsi?.message}>
        <Textarea id="p-desk" {...register('deskripsi')} />
      </Field>
      <Field label="Kategori" htmlFor="p-kat">
        <select id="p-kat" className={selectClass} {...register('kategori_id')}>
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
          <Input id="p-stok" inputMode="numeric" aria-invalid={!!errors.stok} {...register('stok')} />
        </Field>
      </div>

      {produk ? (
        <div className="flex flex-col gap-2 rounded-lg border p-3">
          <div className="flex items-center gap-3">
            {produk.foto_url ? (
              <img src={produk.foto_url} alt={`Foto ${produk.nama}`} className="size-16 rounded-lg object-cover" />
            ) : (
              <div className="grid size-16 place-items-center rounded-lg bg-muted text-xs text-muted-foreground">Belum ada</div>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium hover:bg-muted">
              <ImageUp className="size-4" /> {foto.isPending ? 'Mengunggah…' : 'Unggah foto'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={foto.isPending}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (!file) return
                  setFotoNotice(null)
                  if (file.size > 5 * 1024 * 1024) return toast.error('Ukuran foto maksimal 5 MB')
                  foto.mutate(file)
                }}
              />
            </label>
          </div>
          {fotoNotice ? <p className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}>{fotoNotice}</p> : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Foto bisa diunggah setelah produk disimpan.</p>
      )}

      <div className="flex justify-end gap-2">
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
  const produk = useQuery({ queryKey: ['produk'], queryFn: api.listProduk })
  const [cari, setCari] = useState('')
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

  const rows = useMemo(() => {
    const q = cari.trim().toLowerCase()
    return (produk.data ?? []).filter((p) => !q || p.nama.toLowerCase().includes(q))
  }, [produk.data, cari])

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
      <PageTitle title="Produk" actions={<Button onClick={() => setEditing('baru')}>Tambah Produk</Button>} />

      <Card>
        <CardHeader>
          <CardTitle>Cari Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            aria-label="Cari produk"
            placeholder="Cari nama produk…"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {produk.isPending ? (
            <Spinner column label="Memuat produk…" />
          ) : produk.error ? (
            <ErrorLine message={errorMessage(produk.error)} />
          ) : (
            <TableShell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {p.foto_url ? (
                            <img src={p.foto_url} alt="" loading="lazy" className="size-10 rounded-lg object-cover" />
                          ) : (
                            <div className="size-10 rounded-lg bg-muted" aria-hidden />
                          )}
                          <div>
                            <p className="font-medium">{p.nama}</p>
                            {p.sumber === 'erp' ? (
                              <Badge variant="secondary" className="mt-0.5">
                                Dari ERP
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{p.kategori_nama ?? '-'}</TableCell>
                      <TableCell>{fmtRp(p.harga)}</TableCell>
                      <TableCell>{p.stok}</TableCell>
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
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        {cari ? 'Tidak ada produk yang cocok.' : 'Belum ada produk.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableShell>
          )}
        </CardContent>
      </Card>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
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
