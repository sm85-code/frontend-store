import { zodResolver } from '@hookform/resolvers/zod'
import { fmtRp, type Produk } from '@store/shared'
import { Badge, Button, EmptyState, ErrorNotice, Field, Input, Modal, Notice, Select, Table, Td, Textarea, Th } from '@store/ui'
import { PageSpinner } from '../components/Spinner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ImageUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PageHeader } from '../components/PageHeader'
import { api, errorMessage } from '../lib/api'

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
        <Select id="p-kat" {...register('kategori_id')}>
          <option value="">Tanpa kategori</option>
          {kategori.data?.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama}
            </option>
          ))}
        </Select>
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
        <div className="flex flex-col gap-2 rounded-md border p-3">
          <div className="flex items-center gap-3">
            {produk.foto_url ? (
              <img src={produk.foto_url} alt={`Foto ${produk.nama}`} className="size-16 rounded-md object-cover" />
            ) : (
              <div className="grid size-16 place-items-center rounded-md bg-muted text-xs text-muted-foreground">Belum ada</div>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-medium hover:bg-muted">
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
          {fotoNotice ? <Notice tone="warning">{fotoNotice}</Notice> : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Foto bisa diunggah setelah produk disimpan.</p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onDone}>
          Batal
        </Button>
        <Button type="submit" loading={simpan.isPending}>
          Simpan
        </Button>
      </div>
    </form>
  )
}

export default function ProdukPage() {
  const qc = useQueryClient()
  const produk = useQuery({ queryKey: ['produk'], queryFn: api.listProduk })
  const [cari, setCari] = useState('')
  const [editing, setEditing] = useState<Produk | 'baru' | null>(null)
  const [hapus, setHapus] = useState<Produk | null>(null)

  const aktifMut = useMutation({
    mutationFn: (p: Produk) => api.patchProduk(p.id, { aktif: !p.aktif }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['produk'] }),
    onError: (e) => toast.error(errorMessage(e)),
  })
  const hapusMut = useMutation({
    mutationFn: (id: string) => api.deleteProduk(id),
    onSuccess: () => {
      setHapus(null)
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

  return (
    <>
      <PageHeader
        title="Produk"
        actions={
          <Button onClick={() => setEditing('baru')}>
            <Plus className="size-4" /> Tambah produk
          </Button>
        }
      />
      <Input
        aria-label="Cari produk"
        placeholder="Cari nama produk…"
        value={cari}
        onChange={(e) => setCari(e.target.value)}
        className="mb-4 max-w-sm"
      />

      {produk.isPending ? (
        <PageSpinner />
      ) : produk.error ? (
        <ErrorNotice message={errorMessage(produk.error)} />
      ) : rows.length === 0 ? (
        <EmptyState title={cari ? 'Tidak ada produk yang cocok' : 'Belum ada produk'} />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Produk</Th>
              <Th>Kategori</Th>
              <Th className="text-right">Harga</Th>
              <Th className="text-right">Stok</Th>
              <Th>Status</Th>
              <Th className="w-28" />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    {p.foto_url ? (
                      <img src={p.foto_url} alt="" loading="lazy" className="size-10 rounded-md object-cover" />
                    ) : (
                      <div className="size-10 rounded-md bg-muted" aria-hidden />
                    )}
                    <div>
                      <p className="font-medium">{p.nama}</p>
                      {p.sumber === 'erp' ? <Badge className="mt-0.5">Dari ERP</Badge> : null}
                    </div>
                  </div>
                </Td>
                <Td>{p.kategori_nama ?? '-'}</Td>
                <Td className="text-right">{fmtRp(p.harga)}</Td>
                <Td className="text-right">{p.stok}</Td>
                <Td>
                  <button
                    type="button"
                    onClick={() => aktifMut.mutate(p)}
                    disabled={aktifMut.isPending}
                    aria-label={`${p.aktif ? 'Nonaktifkan' : 'Aktifkan'} ${p.nama}`}
                  >
                    <Badge tone={p.aktif ? 'success' : 'neutral'}>{p.aktif ? 'Aktif' : 'Nonaktif'}</Badge>
                  </button>
                </Td>
                <Td>
                  <div className="flex">
                    <Button variant="ghost" size="icon" aria-label={`Ubah ${p.nama}`} onClick={() => setEditing(p)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label={`Hapus ${p.nama}`} onClick={() => setHapus(p)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'baru' ? 'Produk baru' : 'Ubah produk'}>
        {editing !== null ? (
          <ProdukForm key={editing === 'baru' ? 'baru' : editing.id} produk={editing === 'baru' ? null : editing} onDone={() => setEditing(null)} />
        ) : null}
      </Modal>
      <ConfirmDialog
        open={hapus !== null}
        title="Hapus produk?"
        message={`"${hapus?.nama ?? ''}" akan dihapus permanen. Produk yang sudah pernah dipesan sebaiknya dinonaktifkan saja.`}
        loading={hapusMut.isPending}
        onClose={() => setHapus(null)}
        onConfirm={() => hapus && hapusMut.mutate(hapus.id)}
      />
    </>
  )
}
