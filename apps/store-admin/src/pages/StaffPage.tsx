import { zodResolver } from '@hookform/resolvers/zod'
import { fmtDate, type Staff } from '@store/shared'
import Spinner from '@/components/Spinner'
import TableShell from '@/components/TableShell'
import { useConfirm } from '@/components/ConfirmProvider'
import { ErrorLine, Field, PageTitle } from '@/components/erp'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
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
        <Button type="button" variant="outline" onClick={onDone}>
          Batal
        </Button>
        <Button type="submit" disabled={buat.isPending}>
          {buat.isPending ? 'Menyimpan…' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}

export default function StaffPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const confirm = useConfirm()
  const staff = useQuery({ queryKey: ['staff'], queryFn: api.listStaff })
  const [baru, setBaru] = useState(false)
  const hapusMut = useMutation({
    mutationFn: (id: string) => api.deleteStaff(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['staff'] })
      toast.success('Admin dihapus')
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  async function onDelete(s: Staff) {
    const ok = await confirm({
      title: 'Hapus admin?',
      description: `Akun ${s.nama} tidak akan bisa masuk lagi.`,
      destructive: true,
    })
    if (ok) hapusMut.mutate(s.id)
  }

  return (
    <div className="space-y-4">
      <PageTitle
        title="Staff Admin"
        description="Hanya owner yang bisa mengelola akun admin."
        actions={<Button onClick={() => setBaru(true)}>Tambah Admin</Button>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Admin</CardTitle>
        </CardHeader>
        <CardContent>
          {staff.isPending ? (
            <Spinner column label="Memuat staff…" />
          ) : staff.error ? (
            <ErrorLine message={errorMessage(staff.error)} />
          ) : (
            <TableShell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Peran</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.data.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.nama}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>
                        <Badge variant={s.role === 'owner' ? 'default' : 'secondary'}>{s.role}</Badge>
                      </TableCell>
                      <TableCell>{fmtDate(s.created_at)}</TableCell>
                      <TableCell className="text-right">
                        {s.role !== 'owner' && s.id !== user?.id ? (
                          <Button size="sm" variant="destructive" aria-label={`Hapus ${s.nama}`} onClick={() => onDelete(s)}>
                            Hapus
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableShell>
          )}
        </CardContent>
      </Card>

      <Dialog open={baru} onOpenChange={setBaru}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Admin</DialogTitle>
          </DialogHeader>
          {baru ? <StaffForm onDone={() => setBaru(false)} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
