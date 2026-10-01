'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, CardContent, CardHeader, CardTitle, ErrorNotice, Field, Input, cn } from '@store/ui'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { GoogleButton } from '@/components/GoogleButton'
import { api, errorMessage } from '@/lib/api'
import { ME_KEY, useMe } from '@/lib/queries'
import { safeNext } from '@/lib/safe-next'

const loginSchema = z.object({ email: z.email('Email tidak valid'), password: z.string().min(1, 'Password wajib diisi') })
const registerSchema = z.object({
  nama: z.string().trim().min(1, 'Nama wajib diisi'),
  email: z.email('Email tidak valid'),
  password: z.string().min(8, 'Minimal 8 karakter').max(72, 'Maksimal 72 karakter'),
})
type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

export function AuthForms() {
  const router = useRouter()
  const qc = useQueryClient()
  const next = safeNext(useSearchParams().get('next'))
  const me = useMe()
  const [mode, setMode] = useState<'masuk' | 'daftar'>('masuk')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (me.data) router.replace(next)
  }, [me.data, next, router])

  const login = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })
  const register = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })

  async function done(pembeli: Awaited<ReturnType<typeof api.login>>) {
    qc.setQueryData(ME_KEY, pembeli)
    await qc.invalidateQueries({ queryKey: ['keranjang'] })
    router.replace(next)
    router.refresh()
  }

  async function run(action: () => Promise<Awaited<ReturnType<typeof api.login>>>) {
    setError(null)
    try {
      await done(await action())
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{mode === 'masuk' ? 'Masuk' : 'Daftar akun'}</CardTitle>
          <div role="tablist" aria-label="Masuk atau daftar" className="mt-2 grid grid-cols-2 rounded-md bg-muted p-1 text-sm">
            {(['masuk', 'daftar'] as const).map((m) => (
              <button
                key={m}
                role="tab"
                type="button"
                aria-selected={mode === m}
                onClick={() => {
                  setMode(m)
                  setError(null)
                }}
                className={cn('rounded px-3 py-1.5 font-medium capitalize', mode === m && 'bg-card shadow-xs')}
              >
                {m}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error ? <ErrorNotice message={error} /> : null}

          <GoogleButton onCredential={(token) => void run(() => api.loginGoogle(token))} />

          {mode === 'masuk' ? (
            <form className="flex flex-col gap-4" noValidate onSubmit={login.handleSubmit((v) => run(() => api.login(v.email, v.password)))}>
              <Field label="Email" htmlFor="l-email" error={login.formState.errors.email?.message}>
                <Input id="l-email" type="email" autoComplete="username" {...login.register('email')} />
              </Field>
              <Field label="Password" htmlFor="l-pass" error={login.formState.errors.password?.message}>
                <Input id="l-pass" type="password" autoComplete="current-password" {...login.register('password')} />
              </Field>
              <Button type="submit" loading={login.formState.isSubmitting}>
                Masuk
              </Button>
            </form>
          ) : (
            <form className="flex flex-col gap-4" noValidate onSubmit={register.handleSubmit((v) => run(() => api.register(v)))}>
              <Field label="Nama lengkap" htmlFor="r-nama" error={register.formState.errors.nama?.message}>
                <Input id="r-nama" autoComplete="name" {...register.register('nama')} />
              </Field>
              <Field label="Email" htmlFor="r-email" error={register.formState.errors.email?.message}>
                <Input id="r-email" type="email" autoComplete="email" {...register.register('email')} />
              </Field>
              <Field label="Password" htmlFor="r-pass" error={register.formState.errors.password?.message} hint="Minimal 8 karakter.">
                <Input id="r-pass" type="password" autoComplete="new-password" {...register.register('password')} />
              </Field>
              <Button type="submit" loading={register.formState.isSubmitting}>
                Daftar
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
