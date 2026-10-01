'use client'

import { Button, ThemeToggle, buttonVariants } from '@store/ui'
import { LogOut, MessageCircle, Package, ShoppingCart, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { cartCount, useCart, useMe, useSignedOut } from '@/lib/queries'

export function Header() {
  const me = useMe()
  const cart = useCart()
  const signedOut = useSignedOut()
  const router = useRouter()
  const count = cartCount(cart.data)

  return (
    <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link href="/" className="mr-auto text-lg font-bold tracking-tight">
          Ampel<span className="text-primary">kuning</span>
        </Link>

        <Link href="/keranjang" className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'relative' })} aria-label={`Keranjang, ${count} item`}>
          <ShoppingCart className="size-5" />
          {count > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[0.7rem] font-bold text-primary-foreground">
              {count}
            </span>
          ) : null}
        </Link>
        <ThemeToggle />

        {me.data ? (
          <>
            <Link href="/pesanan" className={buttonVariants({ variant: 'ghost', size: 'icon' })} aria-label="Pesanan saya">
              <Package className="size-5" />
            </Link>
            <Link href="/chat" className={buttonVariants({ variant: 'ghost', size: 'icon' })} aria-label="Chat">
              <MessageCircle className="size-5" />
            </Link>
            <Link href="/akun/alamat" className={buttonVariants({ variant: 'ghost', size: 'icon' })} aria-label={`Akun ${me.data.nama}`}>
              <User className="size-5" />
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await api.logout().catch(() => undefined)
                signedOut()
                router.push('/')
                router.refresh()
              }}
            >
              <LogOut className="size-4" /> <span className="hidden sm:inline">Keluar</span>
            </Button>
          </>
        ) : me.isPending ? null : (
          <Link href="/masuk" className={buttonVariants({ size: 'sm' })}>
            Masuk
          </Link>
        )}
      </div>
    </header>
  )
}
