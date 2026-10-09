'use client'

import { Button, ThemeToggle, buttonVariants } from '@store/ui'
import { LogOut, MessageCircle, Package, ShoppingCart, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Logo } from '@/components/Logo'
import { SearchBar } from '@/components/SearchBar'
import { api } from '@/lib/api'
import { cartCount, useCart, useMe, useSignedOut } from '@/lib/queries'

function Search({ className, namaToko }: { className?: string; namaToko: string }) {
  const params = useSearchParams()
  return <SearchBar namaToko={namaToko} q={params.get('q') ?? undefined} kategori={params.get('kategori') ?? undefined} className={className} />
}

export function Header({ namaToko = 'AmpelKuning' }: { namaToko?: string }) {
  const me = useMe()
  const cart = useCart()
  const signedOut = useSignedOut()
  const router = useRouter()
  const count = cartCount(cart.data)

  return (
    <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center gap-3 px-4 sm:px-6 md:h-[4.75rem]">
        <Link href="/" aria-label={`${namaToko}, ke beranda`} className="mr-auto md:mr-0">
          <Logo nama={namaToko} />
        </Link>

        <Suspense fallback={<div className="mx-6 hidden h-11 flex-1 md:block" />}>
          <Search namaToko={namaToko} className="mx-6 hidden max-w-xl flex-1 md:block" />
        </Suspense>

        <nav aria-label="Akun dan keranjang" className="flex items-center gap-1">
          <ThemeToggle />
          {/* On phones these live in the bottom tab bar. */}
          <div className="hidden items-center gap-1 md:flex">
            <Link href="/keranjang" className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'relative' })} aria-label={`Keranjang, ${count} item`}>
              <ShoppingCart className="size-5" />
              {count > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[0.7rem] font-bold text-primary-foreground">
                  {count}
                </span>
              ) : null}
            </Link>
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
                  <LogOut className="size-4" /> Keluar
                </Button>
              </>
            ) : me.isPending ? null : (
              <Link href="/masuk" className={buttonVariants({ size: 'sm', className: 'rounded-lg px-5' })}>
                Masuk
              </Link>
            )}
          </div>
        </nav>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <Suspense fallback={<div className="h-11" />}>
          <Search namaToko={namaToko} />
        </Suspense>
      </div>
    </header>
  )
}
