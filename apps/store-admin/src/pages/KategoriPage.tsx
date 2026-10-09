import { BulkActions, useBulkSelection } from '@/components/BulkActions'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Kategori } from '@store/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import Spinner from '@/components/Spinner'
import TableShell from '@/components/TableShell'
import { useConfirm } from '@/components/ConfirmProvider'
import { ErrorLine, Field, PageTitle } from '@/components/erp'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api, errorMessage } from '../lib/api'

const schema = z.object({ nama: z.string().trim().min(1, 'Nama kategori wajib diisi').max(128) })

export default function KategoriPage() {
  const qc = useQueryClient()
  const confirm = useConfirm()
  const kategori = useQuery({ queryKey: ['kategori'], queryFn: api.listKategori })
  const bulk = useBulkSelection('kategori', (kategori.data ?? []).map((p) => p.id))
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ nama: string }>({ resolver: zodResolver(schema) })

  const tambah = useMutation({
    mutationFn: (nama: string) => api.createKategori(nama),
    onSuccess: () => {
      reset()
      void qc.invalidateQueries({ queryKey: ['kategori'] })
      toast.success('Kategori ditambahkan')
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
  const hapusMut = useMutation({
    mutationFn: (id: string) => api.deleteKategori(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['kategori'] })
      void qc.invalidateQueries({ queryKey: ['produk'] })
      toast.success('Kategori dihapus')
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  async function onDelete(k: Kategori) {
    const ok = await confirm({
      title: 'Hapus kategori?',
      description: `Kategori "${k.nama}" akan dihapus. Produknya tetap ada.`,
      destructive: true,
    })
    if (ok) hapusMut.mutate(k.id)
  }

  return (
    <div className="space-y-4">
      <PageTitle title="Kategori"  />

      <Card>
        <CardHeader>
          <CardTitle>Kategori Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex max-w-md items-start gap-2" noValidate onSubmit={handleSubmit((v) => tambah.mutate(v.nama))}>
            <div className="flex-1">
              <Field label="Nama kategori" htmlFor="nama" error={errors.nama?.message}>
                <Input id="nama" aria-invalid={!!errors.nama} {...register('nama')} />
              </Field>
            </div>
            <Button type="submit" className="mt-[1.65rem]" disabled={tambah.isPending}>
              {tambah.isPending ? 'Menyimpan…' : 'Tambah'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <BulkActions ids={(kategori.data ?? []).map((p) => p.id)} selected={bulk.selected} setSelected={bulk.setSelected} actions={[{ label: 'Hapus', destructive: true, run: api.deleteKategori }]} onComplete={() => { for (const key of ['kategori', 'produk']) void qc.invalidateQueries({ queryKey: [key] }) }} />

      <Card>
        <CardContent className="pt-6">
          {kategori.isPending ? (
            <Spinner column label="Memuat kategori…" />
          ) : kategori.error ? (
            <ErrorLine message={errorMessage(kategori.error)} />
          ) : (
            <TableShell minWidth={320}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><span className="sr-only">Pilih</span></TableHead><TableHead>Nama</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kategori.data.map((k) => (
                    <TableRow key={k.id}><TableCell><input type="checkbox" aria-label={`Pilih ${k.nama}`} checked={bulk.selected.includes(k.id)} onChange={() => bulk.toggle(k.id)} /></TableCell>
                      <TableCell className="font-medium">{k.nama}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="destructive" aria-label={`Hapus ${k.nama}`} onClick={() => onDelete(k)}>
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {kategori.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                        Belum ada kategori.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableShell>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
