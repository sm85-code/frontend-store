'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Alamat } from '@store/shared'
import { Button, Field, Input, Textarea } from '@store/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { WilayahFields } from '@/components/WilayahFields'
import { api, errorMessage } from '@/lib/api'
import { KOSONG, type HasilWilayah, type PilihanWilayah } from '@/lib/wilayah'

export const ALAMAT_KEY = ['alamat'] as const

const schema = z.object({
  label: z.string().trim().min(1, 'Label wajib diisi').max(64),
  nama_penerima: z.string().trim().min(1, 'Nama penerima wajib diisi'),
  telepon_penerima: z.string().regex(/^\+?[0-9][0-9\-\s]{7,19}$/, 'Nomor telepon tidak valid (8-20 digit)'),
  alamat_lengkap: z.string().trim().min(1, 'Alamat wajib diisi'),
  provinsi: z.string().min(1, 'Pilih provinsi'),
  kota: z.string().min(1, 'Pilih kota / kabupaten'),
  kecamatan: z.string().min(1, 'Pilih kecamatan'),
  kelurahan: z.string().min(1, 'Pilih desa / kelurahan'),
  kode_pos: z.string().regex(/^[0-9]{5}$/, 'Kode pos terisi otomatis setelah memilih kelurahan'),
  kode_wilayah: z.string().min(1),
})
type Values = z.infer<typeof schema>

export function AlamatForm({ onSaved, onCancel }: { onSaved?: (a: Alamat) => void; onCancel?: () => void }) {
  const qc = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: 'Rumah', nama_penerima: '', telepon_penerima: '', alamat_lengkap: '',
      provinsi: '', kota: '', kecamatan: '', kelurahan: '', kode_pos: '', kode_wilayah: '',
    },
  })
  const [wilayah, setWilayah] = useState<PilihanWilayah>(KOSONG)
  const pilihWilayah = (pilihan: PilihanWilayah, hasil: HasilWilayah) => {
    setWilayah(pilihan)
    for (const [field, value] of Object.entries(hasil) as [keyof HasilWilayah, string][]) {
      setValue(field, value, { shouldValidate: errors[field] !== undefined })
    }
  }
  const simpan = useMutation({
    mutationFn: (v: Values) => api.createAlamat({ ...v, utama: false }),
    onSuccess: (alamat) => {
      reset()
      setWilayah(KOSONG)
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
      <WilayahFields
        value={wilayah}
        onChange={pilihWilayah}
        errors={{ provinsi: errors.provinsi?.message, kota: errors.kota?.message, kecamatan: errors.kecamatan?.message, kelurahan: errors.kelurahan?.message }}
      />
      <Field label="Alamat lengkap (jalan, nomor, RT/RW, patokan)" htmlFor="a-alamat" error={errors.alamat_lengkap?.message} className="sm:col-span-2">
        <Textarea id="a-alamat" autoComplete="street-address" {...register('alamat_lengkap')} />
      </Field>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" loading={simpan.isPending}>Simpan alamat</Button>
        {onCancel ? <Button variant="outline" onClick={onCancel}>Batal</Button> : null}
      </div>
    </form>
  )
}
