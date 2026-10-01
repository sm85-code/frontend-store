'use client'

import { ApiError, type KeranjangItem, type Pembeli } from '@store/shared'
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { api } from './api'

export const ME_KEY = ['me'] as const
export const CART_KEY = ['keranjang'] as const

/** `null` = signed out (a 401 is the answer here, not an error). */
export function useMe() {
  return useQuery<Pembeli | null>({
    queryKey: ME_KEY,
    queryFn: () => api.me().catch((e: unknown) => (e instanceof ApiError && e.isUnauthorized ? null : Promise.reject(e))),
    staleTime: 5 * 60_000,
    retry: false,
  })
}

export function useCart() {
  const me = useMe()
  return useQuery<KeranjangItem[]>({
    queryKey: CART_KEY,
    queryFn: api.getKeranjang,
    enabled: !!me.data,
  })
}

/** Sign-out state: update the EXISTING `me` query (so mounted observers see "signed out") and drop every other
 *  cached query. `queryClient.clear()` is not enough: observers keep the removed query and stay "signed in". */
export function dropSession(client: QueryClient) {
  client.setQueryData(ME_KEY, null)
  client.removeQueries({ predicate: (q) => q.queryKey[0] !== ME_KEY[0] })
}

export function useSignedOut() {
  const qc = useQueryClient()
  return () => dropSession(qc)
}

export function cartCount(items: KeranjangItem[] | undefined): number {
  return (items ?? []).reduce((n, i) => n + i.qty, 0)
}

export function cartTotal(items: KeranjangItem[] | undefined): number {
  return (items ?? []).reduce((n, i) => n + Number(i.subtotal), 0)
}
