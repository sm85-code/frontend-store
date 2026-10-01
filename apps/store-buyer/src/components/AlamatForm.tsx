'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Alamat } from '@store/shared'
import { Button, Field, Input, Textarea } from '@store/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { api, errorMessage } from '@/lib/api'

export const ALAMAT_KEY = ['alamat'] as const

const schema = z.object({
  label: z.string().trim().min(1, 'Label wajib diisi').max(64),
  nama_penerima: z.string().trim().min(1, 'Nama penerima wajib diisi'),
  telepon_penerima: z.string().regex(/^\+?[0-9][0-9\-\s]{7,19}$/, 'Nomor telepon tidak valid (8-20 digit)'),
  alamat_lengkap: z.string().trim().min(1, 'Alamat wajib diisi'),
  kota: z.string(),
  provinsi: z.string(),
  kode_pos: z.string().regex(/^([0-9]{5})?$/, 'Kode pos harus 5 digit'),
})
type Values = z.infer<typeof schema>

export function AlamatForm({ onSaved, onCancel }: { onSaved?: (a: Alamat) => void; onCancel?: () => void }) {
  const qc = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { label: 'Rumah', nama_penerima: '', telepon_penerima: '', alamat_lengkap: '', kota: '', provinsi: '', kode_pos: '' },
  })
  const simpan = useMutation({
    mutationFn: (v: Values) => api.createAlamat({ ...v, utama: false }),
    onSuccess: (alamat) => {
      reset()
      void qc.invalidateQueries({ queryKey: ALAMAT_KEY })
      toast.success('Alamat disimpan')
      onSaved?.(alamat)
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  return (
    <form className="grid gap-3 sm:grid-cols-2" noValidate onSubmit={handleSubmit((v) => simpan.mutate(v))}>
      <Field label="Label" htmlFor="a-label" error={errors.label?.message}>
        <Input id="a-label" {...register('label')} />
      </Field>
      <Field label="Nama penerima" htmlFor="a-nama" error={errors.nama_penerima?.message}>
        <Input id="a-nama" autoComplete="name" {...register('nama_penerima')} />
      </Field>
      <Field label="Telepon penerima" htmlFor="a-telp" error={errors.telepon_penerima?.message}>
        <Input id="a-telp" type="tel" autoComplete="tel" {...register('telepon_penerima')} />
      </Field>
      <Field label="Kode pos" htmlFor="a-pos" error={errors.kode_pos?.message}>
        <Input id="a-pos" inputMode="numeric" autoComplete="postal-code" {...register('kode_pos')} />
      </Field>
      <Field label="Kota / Kabupaten" htmlFor="a-kota">
        <Input id="a-kota" {...register('kota')} />
      </Field>
      <Field label="Provinsi" htmlFor="a-prov">
        <Input id="a-prov" {...register('provinsi')} />
      </Field>
      <Field label="Alamat lengkap" htmlFor="a-alamat" error={errors.alamat_lengkap?.message} className="sm:col-span-2">
        <Textarea id="a-alamat" autoComplete="street-address" {...register('alamat_lengkap')} />
      </Field>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" loading={simpan.isPending}>Simpan alamat</Button>
        {onCancel ? <Button variant="outline" onClick={onCancel}>Batal</Button> : null}
      </div>
    </form>
  )
}
