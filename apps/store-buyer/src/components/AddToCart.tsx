'use client'

import { ApiError, fmtRp } from '@store/shared'
import { Button } from '@store/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { api, errorMessage } from '@/lib/api'
import { CART_KEY } from '@/lib/queries'

function useAddToCart(produkId: string) {
  const router = useRouter()
  const pathname = usePathname()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (qty: number) => api.tambahKeranjang(produkId, qty),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CART_KEY })
      toast.success('Ditambahkan ke keranjang')
    },
    onError: (e) => {
      if (e instanceof ApiError && e.isUnauthorized) {
        router.push(`/masuk?next=${encodeURIComponent(pathname)}`)
        return
      }
      toast.error(errorMessage(e))
    },
  })
}

export function AddToCart({ produkId, stok }: { produkId: string; stok: number }) {
  const [qty, setQty] = useState(1)
  const add = useAddToCart(produkId)

  if (stok <= 0) return <Button disabled>Stok habis</Button>

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center rounded-full border bg-card">
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Kurangi" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>
          <Minus className="size-4" />
        </Button>
        <output aria-live="polite" className="w-8 text-center text-sm font-bold">
          {qty}
        </output>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Tambah" disabled={qty >= stok} onClick={() => setQty((q) => Math.min(stok, q + 1))}>
          <Plus className="size-4" />
        </Button>
      </div>
      <Button size="lg" className="rounded-full px-7 font-bold" loading={add.isPending} onClick={() => add.mutate(qty)}>
        <ShoppingCart className="size-5" /> Tambah ke keranjang
      </Button>
    </div>
  )
}

/** Phones: price and the main action stay in reach above the tab bar while reading the product. */
export function StickyBuyBar({ produkId, stok, harga }: { produkId: string; stok: number; harga: string }) {
  const add = useAddToCart(produkId)
  return (
    <div className="bottom-nav fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t px-4 py-2.5 md:hidden" style={{ paddingBottom: '0.625rem' }}>
      <div className="mx-auto flex max-w-md items-center gap-3">
        <div className="min-w-0">
          <p className="text-[0.7rem] font-medium text-muted-foreground">Harga</p>
          <p className="truncate text-lg font-extrabold leading-tight">{fmtRp(harga)}</p>
        </div>
        <Button className="ml-auto h-11 flex-1 rounded-full font-bold" disabled={stok <= 0} loading={add.isPending} onClick={() => add.mutate(1)}>
          <ShoppingCart className="size-5" /> {stok <= 0 ? 'Stok habis' : 'Tambah'}
        </Button>
      </div>
    </div>
  )
}
