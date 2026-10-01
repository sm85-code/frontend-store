import { Button, ThemeToggle, cn } from '@store/ui'
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
  X,
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

export default function Layout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [location.pathname])

  const items = navFor(user?.role)

  const nav = (
    <nav aria-label="Menu utama" className="flex flex-col gap-1">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
              isActive && 'bg-primary/20 text-foreground',
            )
          }
        >
          <Icon className="size-4" aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="hidden border-r bg-card p-4 lg:block">
        <p className="mb-6 px-3 text-lg font-bold">Admin Toko</p>
        {nav}
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-card/90 px-4 backdrop-blur">
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Buka menu" onClick={() => setOpen(true)}>
            <Menu className="size-5" />
          </Button>
          <p className="font-semibold lg:hidden">Admin Toko</p>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user?.nama} · {user?.role}
            </span>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOut()
                navigate('/login', { replace: true })
              }}
            >
              <LogOut className="size-4" /> Keluar
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">{children}</main>
      </div>

      {open ? (
        <div className="fixed inset-0 z-30 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 bg-black/50" aria-label="Tutup menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-card p-4 shadow-xl">
            <div className="mb-6 flex items-center justify-between px-3">
              <p className="text-lg font-bold">Admin Toko</p>
              <Button variant="ghost" size="icon" aria-label="Tutup menu" onClick={() => setOpen(false)}>
                <X className="size-5" />
              </Button>
            </div>
            {nav}
          </div>
        </div>
      ) : null}
    </div>
  )
}
