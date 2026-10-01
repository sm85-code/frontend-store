import { Search } from 'lucide-react'

/** Plain GET form (works without JavaScript and keeps the search URL shareable). */
export function SearchBar({ q, kategori, className = '' }: { q?: string; kategori?: string; className?: string }) {
  return (
    <form action="/" method="get" role="search" className={`relative ${className}`}>
      {kategori ? <input type="hidden" name="kategori" value={kategori} /> : null}
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        type="search"
        name="q"
        defaultValue={q ?? ''}
        placeholder="Cari produk di Ampelkuning…"
        aria-label="Cari produk"
        className="h-11 w-full rounded-full border border-input bg-card pl-10 pr-24 text-sm shadow-[var(--shadow-card)] outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/20"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition active:scale-95"
      >
        Cari
      </button>
    </form>
  )
}
