import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t py-6 text-center text-sm text-muted-foreground">
      <p>© {new Date().getFullYear()} Ampelkuning. Semua hak dilindungi.</p>
      <p className="mt-1">
        <Link href="/kebijakan-privasi" className="underline underline-offset-2 hover:text-foreground">
          Kebijakan Privasi
        </Link>
      </p>
    </footer>
  )
}
