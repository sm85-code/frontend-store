import { zodResolver } from '@hookform/resolvers/zod'
import { Logo } from '../components/Logo'
import { ErrorLine, Field } from '@/components/erp'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { errorMessage } from '../lib/api'
import { useAuth } from '../lib/auth'

const schema = z.object({
  email: z.email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})
type Values = z.infer<typeof schema>

export default function LoginPage() {
  const { user, loading, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) })

  const from = (location.state as { from?: string } | null)?.from ?? '/'
  if (!loading && user) return <Navigate to={from} replace />

  return (
    <main className="auth-bg flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2">
            <Logo className="h-16" />
          </div>
          <CardTitle className="modern-brand-title text-xl" role="heading" aria-level={1}>
            Masuk Admin Toko
          </CardTitle>
          <CardDescription>Khusus pengelola toko Ampel Kuning</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            noValidate
            onSubmit={handleSubmit(async ({ email, password }) => {
              setError(null)
              try {
                await signIn(email, password)
                navigate(from, { replace: true })
              } catch (e) {
                setError(errorMessage(e))
              }
            })}
          >
            {error ? <ErrorLine message={error} /> : null}
            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="username" aria-invalid={!!errors.email} {...register('email')} />
            </Field>
            <Field label="Password" htmlFor="password" error={errors.password?.message}>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
            </Field>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Memproses…' : 'Masuk'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
