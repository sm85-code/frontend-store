'use client'

import { formatAlamat, type Alamat } from '@store/shared'
import { Badge, Button, EmptyState, ErrorNotice, PageSpinner, buttonVariants } from '@store/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { ALAMAT_KEY, AlamatForm } from '@/components/AlamatForm'
import { api, errorMessage } from '@/lib/api'
import { useMe } from '@/lib/queries'

export default function AlamatPage() {
  const me = useMe()
  const qc = useQueryClient()
  const alamat = useQuery({ queryKey: ALAMAT_KEY, queryFn: api.listAlamat, enabled: !!me.data })
  const [edit, setEdit] = useState<Alamat | undefined>()
  const [tambah, setTambah] = useState(false)
  const refresh = () => qc.invalidateQueries({ queryKey: ALAMAT_KEY })
  const utama = useMutation({ mutationFn: (id: string) => api.patchAlamat(id, { utama: true }), onSuccess: refresh, onError: (e) => toast.error(errorMessage(e)) })
  const hapus = useMutation({ mutationFn: (id: string) => api.deleteAlamat(id), onSuccess: refresh, onError: (e) => toast.error(errorMessage(e)) })

  if (me.isPending) return <PageSpinner />
  if (!me.data) return <EmptyState title="Masuk untuk mengelola alamat" action={<Link href="/masuk?next=/akun/alamat" className={buttonVariants()}>Masuk</Link>} />

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Alamat saya</h1>
      <p className="mb-4 text-sm text-muted-foreground">{me.data.nama} · {me.data.email}</p>
      {alamat.isPending ? <PageSpinner /> : alamat.error ? <ErrorNotice message={errorMessage(alamat.error)} /> : (
        <ul className="mb-4 flex flex-col gap-3">
          {alamat.data.map((a) => (
            <li key={a.id} className="flex flex-col items-start justify-between gap-3 sm:flex-row rounded-lg border bg-card p-4 text-sm shadow-[var(--shadow-card)]">
              <div>
                <p className="font-medium">{a.label} {a.utama ? <Badge tone="info">Utama</Badge> : null}</p>
                <p>{a.nama_penerima} ({a.telepon_penerima})</p>
                <p className="text-muted-foreground">{formatAlamat({ alamat: a.alamat_lengkap, kelurahan: a.kelurahan, kecamatan: a.kecamatan, kota: a.kota, provinsi: a.provinsi, kodePos: a.kode_pos })}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-1">
                <Button variant="outline" size="sm" onClick={() => { setEdit(a); setTambah(true) }}><Pencil className="size-4" />Ubah</Button>
                {!a.utama ? <Button variant="outline" size="sm" loading={utama.isPending} onClick={() => utama.mutate(a.id)}>Jadikan utama</Button> : null}
                <Button variant="ghost" size="icon" aria-label={`Hapus alamat ${a.label}`} onClick={() => { if (window.confirm(`Hapus alamat ${a.label}?`)) hapus.mutate(a.id) }}><Trash2 className="size-4" /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {tambah ? <AlamatForm key={edit?.id ?? "baru"} awal={edit} onSaved={() => setTambah(false)} onCancel={() => setTambah(false)} /> : <Button onClick={() => { setEdit(undefined); setTambah(true) }}>Tambah alamat</Button>}
    </div>
  )
}
