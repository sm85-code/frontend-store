import { Button } from '@/components/ui/button'

export function ListPagination({ page, total, onChange }: { page: number; total: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / 25))
  return <nav aria-label="Halaman tabel" className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm">
    <span>{total} data · Halaman {page} dari {pages}</span>
    <div className="flex gap-2">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Sebelumnya</Button>
      <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Berikutnya</Button>
    </div>
  </nav>
}
