/** Small ERP-style building blocks shared by the admin pages (mirrors how the ERP pages lay these out). */
import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function Field({
  label,
  htmlFor,
  error,
  className,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

/** The ERP's inline error box (login, forms, failed loads). */
export function ErrorLine({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-lg border px-3 py-2 text-sm"
      style={{ borderColor: 'var(--status-error-border)', background: 'var(--status-error-bg)', color: 'var(--status-error)' }}
    >
      {message}
    </p>
  )
}

export function PageTitle({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="page-h1 font-heading text-2xl font-bold">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions}
    </div>
  )
}
