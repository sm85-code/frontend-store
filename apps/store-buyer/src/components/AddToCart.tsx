'use client'

import { ApiError } from '@store/shared'
import { Button } from '@store/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { api, errorMessage } from '@/lib/api'
import { CART_KEY } from '@/lib/queries'

export function AddToCart({ produkId, stok }: { produkId: string; stok: number }) {
  const [qty, setQty] = useState(1)
  const router = useRouter()
  const pathname = usePathname()
  const qc = useQueryClient()
  const add = useMutation({
    mutationFn: () => api.tambahKeranjang(produkId, qty),
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

  if (stok <= 0) return <Button disabled>Stok habis</Button>

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center rounded-md border">
        <Button variant="ghost" size="icon" aria-label="Kurangi" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>
          <Minus className="size-4" />
        </Button>
        <output aria-live="polite" className="w-8 text-center text-sm font-medium">
          {qty}
        </output>
        <Button variant="ghost" size="icon" aria-label="Tambah" disabled={qty >= stok} onClick={() => setQty((q) => Math.min(stok, q + 1))}>
          <Plus className="size-4" />
        </Button>
      </div>
      <Button size="lg" loading={add.isPending} onClick={() => add.mutate()}>
        <ShoppingCart className="size-5" /> Tambah ke keranjang
      </Button>
    </div>
  )
}
