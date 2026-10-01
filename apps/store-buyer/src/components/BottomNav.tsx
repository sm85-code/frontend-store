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

  const itemKeranjang = (t: Tab) => item(t, count)
  const item = (t: Tab, badge = 0) => {
    const on = active === t.href
    const Icon = t.icon
    return (
      <li key={t.href} className="flex-1">
        <Link
          href={t.href}
          aria-current={on ? 'page' : undefined}
          aria-label={t.href === '/keranjang' ? `Keranjang, ${badge} item` : undefined}
          className={`relative flex h-full flex-col items-center justify-center gap-0.5 text-[0.7rem] font-medium transition-colors active:scale-95 ${
            on ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          {on ? <span className="absolute inset-x-6 top-0 h-[3px] rounded-b bg-primary" aria-hidden /> : null}
          <span className="relative grid size-7 place-items-center">
            <Icon className="size-[1.35rem]" strokeWidth={on ? 2.5 : 2} aria-hidden />
            {badge > 0 ? (
              <span className="absolute -right-2 -top-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[0.62rem] font-bold text-primary-foreground">
                {badge}
              </span>
            ) : null}
          </span>
          {t.label}
        </Link>
      </li>
    )
  }

  const all: Tab[] = [
    left[0]!,
    left[1]!,
    keranjang,
    ...right,
  ]
  return (
    <nav aria-label="Navigasi utama" className="bottom-nav fixed inset-x-0 bottom-0 z-40 md:hidden">
      <ul className="mx-auto flex h-16 max-w-md items-stretch">
        {all.map((t) => (t.href === keranjang.href ? itemKeranjang(t) : item(t)))}
      </ul>
    </nav>
  )
}
