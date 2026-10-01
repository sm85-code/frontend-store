import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, CardContent, CardHeader, CardTitle, Field, Input } from '@store/ui'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { api, errorMessage } from '../lib/api'

export const gantiPasswordSchema = z
  .object({
    lama: z.string().min(1, 'Password saat ini wajib diisi'),
    baru: z.string().min(8, 'Minimal 8 karakter').max(72, 'Maksimal 72 karakter'),
    ulang: z.string(),
  })
  .refine((v) => v.baru === v.ulang, { path: ['ulang'], message: 'Password baru tidak sama' })
  .refine((v) => v.baru !== v.lama, { path: ['baru'], message: 'Password baru harus berbeda dari yang lama' })
type Values = z.infer<typeof gantiPasswordSchema>

export function GantiPasswordCard() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(gantiPasswordSchema) })
  const ganti = useMutation({
    mutationFn: (v: Values) => api.gantiPassword(v.lama, v.baru),
    onSuccess: () => {
      reset()
      toast.success('Password diganti')
    },
    onError: (e) => toast.error(errorMessage(e)),
  })
  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Ganti password</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit((v) => ganti.mutate(v))}>
          <Field label="Password saat ini" htmlFor="pw-lama" error={errors.lama?.message}>
            <Input id="pw-lama" type="password" autoComplete="current-password" {...register('lama')} />
          </Field>
          <Field label="Password baru" htmlFor="pw-baru" error={errors.baru?.message}>
            <Input id="pw-baru" type="password" autoComplete="new-password" {...register('baru')} />
          </Field>
          <Field label="Ulangi password baru" htmlFor="pw-ulang" error={errors.ulang?.message}>
            <Input id="pw-ulang" type="password" autoComplete="new-password" {...register('ulang')} />
          </Field>
          <div className="flex justify-end">
            <Button type="submit" loading={ganti.isPending}>
              Ganti password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
