import { Button, ThemeToggle } from '@store/ui'
import {
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Receipt,
  Settings,
  Tags,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  ownerOnly?: boolean
}

export const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pesanan', label: 'Pesanan', icon: Receipt },
  { to: '/produk', label: 'Produk', icon: Package },
  { to: '/kategori', label: 'Kategori', icon: Tags },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/pengaturan', label: 'Pengaturan', icon: Settings },
  { to: '/staff', label: 'Staff', icon: Users, ownerOnly: true },
]

export function navFor(role: string | undefined): NavItem[] {
  return NAV.filter((item) => !item.ownerOnly || role === 'owner')
}

/** Shown as fixed tabs on phones; everything else lives under "Lainnya". */
const BOTTOM_NAV = ['/', '/pesanan', '/produk', '/chat']

function isActive(pathname: string, to: string): boolean {
  return to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`)
}

export default function Layout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [location.pathname])

  const items = navFor(user?.role)
  const bottom = items.filter((i) => BOTTOM_NAV.includes(i.to))
  const moreActive = items.some((i) => !BOTTOM_NAV.includes(i.to) && isActive(location.pathname, i.to))

  const keluar = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="floating-card fixed inset-x-3 top-3 z-40 flex h-14 items-center gap-2 rounded-2xl px-4 lg:hidden">
        <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          T
        </div>
        <p className="truncate text-sm font-semibold">Admin Toko</p>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      <aside
        className={`fixed top-0 left-0 z-50 h-[100dvh] w-72 transition-transform lg:sticky lg:transform-none ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="floating-card m-0 flex h-full flex-col overflow-hidden rounded-none lg:m-4 lg:h-[calc(100dvh-2rem)] lg:rounded-2xl">
          <div className="flex items-center gap-3 p-6">
            <div className="flex size-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
              T
            </div>
            <div>
              <p className="text-base leading-tight font-semibold">Admin Toko</p>
              <p className="text-xs text-muted-foreground">Ampel Kuning</p>
            </div>
          </div>

          <nav aria-label="Menu utama" className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
            {items.map(({ to, label, icon: Icon }) => {
              const active = isActive(location.pathname, to)
              return (
                <NavLink key={to} to={to} end={to === '/'} className={`side-link ${active ? 'active' : ''}`}>
                  <span className="nav-ico">
                    <Icon className="size-4" strokeWidth={active ? 2.5 : 2} aria-hidden />
                  </span>
                  <span>{label}</span>
                </NavLink>
              )
            })}
          </nav>

          <div className="shrink-0 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {user?.nama?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{user?.nama}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
              <ThemeToggle />
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={keluar}>
              <LogOut className="size-4" /> Keluar
            </Button>
          </div>
        </div>
      </aside>

      {open ? (
        <button type="button" className="fixed inset-0 z-40 bg-black/20 lg:hidden" aria-label="Tutup menu" onClick={() => setOpen(false)} />
      ) : null}

      <main className="min-w-0 flex-1 pt-20 pb-24 lg:pt-0 lg:pb-0">
        <div className="fade-in mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">{children}</div>
      </main>

      <nav
        aria-label="Navigasi utama"
        className="bottom-nav-shell fixed inset-x-0 bottom-0 z-30 flex items-stretch lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {bottom.map(({ to, label, icon: Icon }) => {
          const active = isActive(location.pathname, to)
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <span
                className={`flex size-8 items-center justify-center rounded-xl border bg-muted ${
                  active ? 'border-primary/35' : 'border-transparent'
                }`}
              >
                <Icon className="size-4.5" strokeWidth={active ? 2.5 : 2} aria-hidden />
              </span>
              <span className="truncate px-1">{label}</span>
            </NavLink>
          )
        })}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka menu lainnya"
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
            moreActive ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <span
            className={`flex size-8 items-center justify-center rounded-xl border bg-muted ${
              moreActive ? 'border-primary/35' : 'border-transparent'
            }`}
          >
            <Menu className="size-4.5" strokeWidth={moreActive ? 2.5 : 2} aria-hidden />
          </span>
          <span>Lainnya</span>
        </button>
      </nav>
    </div>
  )
}
