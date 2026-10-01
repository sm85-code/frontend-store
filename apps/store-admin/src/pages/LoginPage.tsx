import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Card, CardContent, CardHeader, CardTitle, ErrorNotice, Field, Input } from '@store/ui'
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
    <main className="auth-bg grid min-h-screen place-items-center p-4">
      <Card className="floating-card w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            T
          </div>
          <CardTitle className="modern-brand-title text-xl">Masuk Admin Toko</CardTitle>
          <p className="text-sm text-muted-foreground">Khusus pengelola toko.</p>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
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
            {error ? <ErrorNotice message={error} /> : null}
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
            <Button type="submit" loading={isSubmitting}>
              Masuk
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
