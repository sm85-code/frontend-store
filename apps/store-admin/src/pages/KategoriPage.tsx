import { zodResolver } from '@hookform/resolvers/zod'
import type { Kategori } from '@store/shared'
import { Button, EmptyState, ErrorNotice, Field, Input, PageSpinner, Table, Td, Th } from '@store/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PageHeader } from '../components/PageHeader'
import { api, errorMessage } from '../lib/api'

const schema = z.object({ nama: z.string().trim().min(1, 'Nama kategori wajib diisi').max(128) })

export default function KategoriPage() {
  const qc = useQueryClient()
  const kategori = useQuery({ queryKey: ['kategori'], queryFn: api.listKategori })
  const [hapus, setHapus] = useState<Kategori | null>(null)
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
      setHapus(null)
      void qc.invalidateQueries({ queryKey: ['kategori'] })
      void qc.invalidateQueries({ queryKey: ['produk'] })
      toast.success('Kategori dihapus')
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  return (
    <>
      <PageHeader title="Kategori" description="Produk pada kategori yang dihapus tidak ikut terhapus, hanya kehilangan kategorinya." />
      <form className="mb-6 flex max-w-md items-start gap-2" noValidate onSubmit={handleSubmit((v) => tambah.mutate(v.nama))}>
        <Field label="Kategori baru" htmlFor="nama" error={errors.nama?.message} className="flex-1">
          <Input id="nama" aria-invalid={!!errors.nama} {...register('nama')} />
        </Field>
        <Button type="submit" className="mt-[1.65rem]" loading={tambah.isPending}>
          Tambah
        </Button>
      </form>

      {kategori.isPending ? (
        <PageSpinner />
      ) : kategori.error ? (
        <ErrorNotice message={errorMessage(kategori.error)} />
      ) : kategori.data.length === 0 ? (
        <EmptyState title="Belum ada kategori" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Nama</Th>
              <Th className="w-16" />
            </tr>
          </thead>
          <tbody>
            {kategori.data.map((k) => (
              <tr key={k.id}>
                <Td>{k.nama}</Td>
                <Td>
                  <Button variant="ghost" size="icon" aria-label={`Hapus ${k.nama}`} onClick={() => setHapus(k)}>
                    <Trash2 className="size-4" />
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <ConfirmDialog
        open={hapus !== null}
        title="Hapus kategori?"
        message={`Kategori "${hapus?.nama ?? ''}" akan dihapus. Produknya tetap ada.`}
        loading={hapusMut.isPending}
        onClose={() => setHapus(null)}
        onConfirm={() => hapus && hapusMut.mutate(hapus.id)}
      />
    </>
  )
}
