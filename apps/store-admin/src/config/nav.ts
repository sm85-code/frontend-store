import type { LucideIcon } from 'lucide-react'
import { Home, Store, MessageSquare, Package, Receipt, Settings, Tags, Users } from 'lucide-react'
import type { Role } from '@/config/roles'

export interface NavItem {
  to: string
  label: string
  shortLabel?: string
  icon: LucideIcon
  roles: Role[]
}

/** Fixed mobile bottom-nav slot order (left→right). Lainnya is appended in BottomNav. */
export const BOTTOM_NAV_PATHS = ['/', '/pesanan', '/produk', '/chat'] as const

export const ALL_ROLES: Role[] = ['owner', 'admin']

export const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: Home, roles: ALL_ROLES },
  { to: '/pesanan', label: 'Pesanan', icon: Receipt, roles: ALL_ROLES },
  { to: '/produk', label: 'Produk', icon: Package, roles: ALL_ROLES },
  { to: '/kategori', label: 'Kategori', icon: Tags, roles: ALL_ROLES },
  { to: '/chat', label: 'Chat', icon: MessageSquare, roles: ALL_ROLES },
  { to: '/profil-toko', label: 'Profil Toko', icon: Store, roles: ALL_ROLES },
  { to: '/pengaturan', label: 'Pengaturan', icon: Settings, roles: ALL_ROLES },
  { to: '/staff', label: 'Staff', icon: Users, roles: ['owner'] },
]

export function filterNavForUser(
  user: { role: string } | null | undefined,
  items: NavItem[] = NAV,
): NavItem[] {
  if (!user) return []
  return items.filter((n) => (n.roles as string[]).includes(user.role))
}

export function navFor(role: string | undefined): NavItem[] {
  return filterNavForUser(role ? { role } : null)
}
