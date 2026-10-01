import { Loader2 } from 'lucide-react'
import { cn } from '../cn'

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2">
      <Loader2 className={cn('size-5 animate-spin', className)} aria-hidden />
      {label ? <span className="text-sm text-muted-foreground">{label}</span> : <span className="sr-only">Memuat…</span>}
    </span>
  )
}

export function PageSpinner({ label = 'Memuat…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner label={label} />
    </div>
  )
}
