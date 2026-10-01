'use client'

import { Home, MessageCircle, Package, ShoppingCart, User, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cartCount, useCart, useMe } from '@/lib/queries'

interface Tab {
  href: string
  label: string
  icon: LucideIcon
  /** Paths (prefixes) that light this tab up. */
  match: string[]
}

/** The tab for a path, or null when none applies (e.g. the product page). Exact for "/", prefix for the rest. */
export function activeTab(pathname: string, tabs: Pick<Tab, 'href' | 'match'>[]): string | null {
  for (const t of tabs) {
    if (t.match.some((m) => (m === '/' ? pathname === '/' : pathname === m || pathname.startsWith(`${m}/`)))) return t.href
  }
  return null
}

export function BottomNav() {
  const pathname = usePathname()
  const me = useMe()
  const cart = useCart()
  const count = cartCount(cart.data)

  const akun: Tab = me.data
    ? { href: '/akun/alamat', label: 'Akun', icon: User, match: ['/akun'] }
    : { href: '/masuk', label: 'Masuk', icon: User, match: ['/masuk'] }
  const left: Tab[] = [
    { href: '/', label: 'Beranda', icon: Home, match: ['/'] },
    { href: '/pesanan', label: 'Pesanan', icon: Package, match: ['/pesanan'] },
  ]
  const right: Tab[] = [{ href: '/chat', label: 'Chat', icon: MessageCircle, match: ['/chat'] }, akun]
  const keranjang: Tab = { href: '/keranjang', label: 'Keranjang', icon: ShoppingCart, match: ['/keranjang', '/checkout'] }
  const active = activeTab(pathname, [...left, keranjang, ...right])

  const item = (t: Tab) => {
    const on = active === t.href
    const Icon = t.icon
    return (
      <li key={t.href} className="flex-1">
        <Link
          href={t.href}
          aria-current={on ? 'page' : undefined}
          className={`relative flex h-full flex-col items-center justify-center gap-0.5 text-[0.7rem] font-medium transition-colors active:scale-95 ${
            on ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          {on ? <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-primary" aria-hidden /> : null}
          <span className={`grid size-8 place-items-center rounded-full transition-colors ${on ? 'bg-primary/25' : ''}`}>
            <Icon className="size-5" strokeWidth={on ? 2.5 : 2} aria-hidden />
          </span>
          {t.label}
        </Link>
      </li>
    )
  }

  const kOn = active === keranjang.href
  return (
    <nav aria-label="Navigasi utama" className="bottom-nav fixed inset-x-0 bottom-0 z-40 md:hidden">
      <ul className="mx-auto flex h-16 max-w-md items-stretch">
        {left.map(item)}
        <li className="relative flex-1">
          <Link
            href={keranjang.href}
            aria-label={`Keranjang, ${count} item`}
            aria-current={kOn ? 'page' : undefined}
            className="absolute left-1/2 top-0 flex size-14 -translate-x-1/2 -translate-y-4 flex-col items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-lift)] ring-4 ring-background transition active:scale-95"
          >
            <ShoppingCart className="size-6" strokeWidth={2.4} aria-hidden />
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-foreground px-1 text-[0.68rem] font-bold text-background">
                {count}
              </span>
            ) : null}
          </Link>
          <span className="absolute inset-x-0 bottom-1 text-center text-[0.7rem] font-medium text-muted-foreground">Keranjang</span>
        </li>
        {right.map(item)}
      </ul>
    </nav>
  )
}
