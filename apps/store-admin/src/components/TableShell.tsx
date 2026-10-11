import type { ReactNode } from 'react'

/** Horizontal scroll wrapper for wide tables (matches live FE). */
export default function TableShell({
  children,
  minWidth = 560,
  label = "Tabel data",
}: {
  children: ReactNode
  minWidth?: number
  label?: string
}) {
  return (
    <div role="region" aria-label={label} tabIndex={0} className="relative w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain rounded-lg border bg-card focus-visible:outline-2 focus-visible:outline-ring">
      <div style={{ minWidth }}>{children}</div>
    </div>
  )
}
