import { zodResolver } from '@hookform/resolvers/zod'
import { fmtDate, type Staff } from '@store/shared'
import { Badge, Button, ErrorNotice, Field, Input, Modal, Table, Td, Th } from '@store/ui'
import { PageSpinner } from '../components/Spinner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PageHeader } from '../components/PageHeader'
import { api, errorMessage } from '../lib/api'
import { useAuth } from '../lib/auth'

const schema = z.object({
  nama: z.string().trim().min(1, 'Nama wajib diisi'),
  email: z.email('Email tidak valid'),
  password: z.string().min(8, 'Minimal 8 karakter').max(72, 'Maksimal 72 karakter'),
})
type Values = z.infer<typeof schema>

function StaffForm({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) })
  const buat = useMutation({
    mutationFn: (v: Values) => api.createStaff(v),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['staff'] })
      toast.success('Admin ditambahkan')
      onDone()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit((v) => buat.mutate(v))}>
      <Field label="Nama" htmlFor="s-nama" error={errors.nama?.message}>
        <Input id="s-nama" {...register('nama')} />
      </Field>
      <Field label="Email" htmlFor="s-email" error={errors.email?.message}>
        <Input id="s-email" type="email" autoComplete="off" {...register('email')} />
      </Field>
      <Field label="Password awal" htmlFor="s-pass" error={errors.password?.message}>
        <Input id="s-pass" type="password" autoComplete="new-password" {...register('password')} />
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onDone}>
          Batal
        </Button>
        <Button type="submit" loading={buat.isPending}>
          Simpan
        </Button>
      </div>
    </form>
  )
}

export default function StaffPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const staff = useQuery({ queryKey: ['staff'], queryFn: api.listStaff })
  const [baru, setBaru] = useState(false)
  const [hapus, setHapus] = useState<Staff | null>(null)
  const hapusMut = useMutation({
    mutationFn: (id: string) => api.deleteStaff(id),
    onSuccess: () => {
      setHapus(null)
      void qc.invalidateQueries({ queryKey: ['staff'] })
      toast.success('Admin dihapus')
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  return (
    <>
      <PageHeader
        title="Staff admin"
        description="Hanya owner yang bisa mengelola akun admin."
        actions={
          <Button onClick={() => setBaru(true)}>
            <Plus className="size-4" /> Tambah admin
          </Button>
        }
      />
      {staff.isPending ? (
        <PageSpinner />
      ) : staff.error ? (
        <ErrorNotice message={errorMessage(staff.error)} />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Nama</Th>
              <Th>Email</Th>
              <Th>Peran</Th>
              <Th>Dibuat</Th>
              <Th className="w-16" />
            </tr>
          </thead>
          <tbody>
            {staff.data.map((s) => (
              <tr key={s.id}>
                <Td>{s.nama}</Td>
                <Td>{s.email}</Td>
                <Td>
                  <Badge tone={s.role === 'owner' ? 'info' : 'neutral'}>{s.role}</Badge>
                </Td>
                <Td>{fmtDate(s.created_at)}</Td>
                <Td>
                  {s.role !== 'owner' && s.id !== user?.id ? (
                    <Button variant="ghost" size="icon" aria-label={`Hapus ${s.nama}`} onClick={() => setHapus(s)}>
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal open={baru} onClose={() => setBaru(false)} title="Tambah admin">
        {baru ? <StaffForm onDone={() => setBaru(false)} /> : null}
      </Modal>
      <ConfirmDialog
        open={hapus !== null}
        title="Hapus admin?"
        message={`Akun ${hapus?.nama ?? ''} tidak akan bisa masuk lagi.`}
        loading={hapusMut.isPending}
        onClose={() => setHapus(null)}
        onConfirm={() => hapus && hapusMut.mutate(hapus.id)}
      />
    </>
  )
}
