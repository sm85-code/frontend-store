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
import { nameSchema, passwordSchema } from '../lib/validation'

const schema = z.object({
  nama: nameSchema,
  email: z.email('Email tidak valid'),
  password: passwordSchema,
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

const editSchema = z.object({ nama: nameSchema })

function EditStaffForm({ staff, onDone }: { staff: Staff; onDone: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema), defaultValues: { nama: staff.nama },
  })
  const simpan = useMutation({
    mutationFn: ({ nama }: z.infer<typeof editSchema>) => api.patchStaff(staff.id, nama),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['staff'] })
      if (staff.id === qc.getQueryData<Staff>(['me'])?.id) void qc.invalidateQueries({ queryKey: ['me'] })
      toast.success('Nama admin diperbarui')
      onDone()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit((v) => simpan.mutate(v))}>
      <Field label="Nama" htmlFor="edit-nama" error={errors.nama?.message}>
        <Input id="edit-nama" autoComplete="name" aria-invalid={!!errors.nama} {...register('nama')} />
      </Field>
      <p className="text-sm text-muted-foreground">Email dan peran akun: {staff.email} · {staff.role}</p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={simpan.isPending} onClick={onDone}>Batal</Button>
        <Button type="submit" disabled={simpan.isPending}>{simpan.isPending ? 'Menyimpan…' : 'Simpan perubahan'}</Button>
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
  const [editing, setEditing] = useState<Staff | null>(null)
  const [search, setSearch] = useState('')
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

        actions={<Button onClick={() => setBaru(true)}>Tambah Admin</Button>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <Input className="mb-4" aria-label="Cari admin" placeholder="Cari nama atau email admin…" value={search} onChange={(e) => setSearch(e.target.value)} />
          {staff.isPending ? (
            <Spinner column label="Memuat staff…" />
          ) : staff.error ? (
            <div className="space-y-2"><ErrorLine message={errorMessage(staff.error)} /><Button variant="outline" disabled={staff.isFetching} onClick={() => void staff.refetch()}>Coba lagi</Button></div>
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
                  {staff.data.filter((s) => `${s.nama} ${s.email}`.toLowerCase().includes(search.trim().toLowerCase())).length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Tidak ada admin yang cocok.</TableCell></TableRow> : null}
                  {staff.data.filter((s) => `${s.nama} ${s.email}`.toLowerCase().includes(search.trim().toLowerCase())).map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.nama}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>
                        <Badge variant={s.role === 'owner' ? 'default' : 'secondary'}>{s.role}</Badge>
                      </TableCell>
                      <TableCell>{fmtDate(s.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button className="mr-2" size="sm" variant="outline" aria-label={`Edit ${s.nama}`} onClick={() => setEditing(s)}>Edit</Button>
                        {s.role !== 'owner' && s.id !== user?.id ? (
                          <Button size="sm" variant="destructive" aria-label={`Hapus ${s.nama}`} disabled={hapusMut.isPending} onClick={() => onDelete(s)}>
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

      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Admin</DialogTitle></DialogHeader>
          {editing ? <EditStaffForm key={editing.id} staff={editing} onDone={() => setEditing(null)} /> : null}
        </DialogContent>
      </Dialog>

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
