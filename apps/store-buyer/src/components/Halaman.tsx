import type { ReactNode } from 'react'

export function Halaman({ judul, ringkas, diperbarui, children }: { judul: string; ringkas: string; diperbarui?: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl sm:text-4xl">{judul}</h1>
      <p className="prose-id mt-3 text-muted-foreground">{ringkas}</p>
      {diperbarui ? <p className="mt-1 text-xs text-muted-foreground">Terakhir diperbarui: {diperbarui}</p> : null}
      {children}
    </article>
  )
}

export function Bagian({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <section className="mt-9">
      <h2 className="section-title mb-3">{judul}</h2>
      <div className="prose-id flex flex-col gap-3 text-[0.95rem]">{children}</div>
    </section>
  )
}
