export default function Loading() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Memuat">
      <div className="skeleton h-44 rounded-3xl sm:h-56" />
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border bg-card">
            <div className="skeleton aspect-square rounded-none" />
            <div className="space-y-2 p-3">
              <div className="skeleton h-3 w-2/3" />
              <div className="skeleton h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Memuat…</span>
    </div>
  )
}
