'use client'

import { ApiError } from '@store/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Plus } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { api, errorMessage } from '@/lib/api'
import { CART_KEY } from '@/lib/queries'

/** Square "+" on a product card: one tap puts one piece in the cart (signed-out visitors are sent to log in). */
export function QuickAdd({ produkId, nama }: { produkId: string; nama: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const qc = useQueryClient()
  const add = useMutation({
    mutationFn: () => api.tambahKeranjang(produkId, 1),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CART_KEY })
      toast.success(`${nama} masuk keranjang`)
    },
    onError: (e) => {
      if (e instanceof ApiError && e.isUnauthorized) {
        router.push(`/masuk?next=${encodeURIComponent(pathname)}`)
        return
      }
      toast.error(errorMessage(e))
    },
  })
  return (
    <button
      type="button"
      aria-label={`Tambah ${nama} ke keranjang`}
      disabled={add.isPending}
      onClick={() => add.mutate()}
      className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground transition active:scale-90 disabled:opacity-60"
    >
      {add.isSuccess ? <Check className="size-4.5" /> : <Plus className="size-5" strokeWidth={2.6} />}
    </button>
  )
}
