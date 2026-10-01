import { buttonVariants } from '@store/ui'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="mx-auto mt-24 flex max-w-sm flex-col items-center gap-3 p-4 text-center">
      <p className="text-5xl font-bold">404</p>
      <p className="text-muted-foreground">Halaman tidak ditemukan.</p>
      <Link to="/" className={buttonVariants()}>
        Ke dashboard
      </Link>
    </div>
  )
}
