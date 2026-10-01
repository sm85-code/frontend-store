import type { Admin } from '@store/shared'
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { createContext, use, useMemo, type ReactNode } from 'react'
import { api } from './api'

export const ME_KEY = ['me'] as const

/** Sign-out state: update the EXISTING `me` query (so mounted observers see "signed out") and drop every other
 *  cached query. `queryClient.clear()` is not enough: observers keep the removed query and stay "signed in". */
export function dropSession(client: QueryClient) {
  client.setQueryData(ME_KEY, null)
  client.removeQueries({ predicate: (q) => q.queryKey[0] !== ME_KEY[0] })
}

interface AuthState {
  user: Admin | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<Admin>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  // A 401 here just means "not signed in" -- it is the answer, not an error to retry.
  const { data, isPending } = useQuery({
    queryKey: ME_KEY,
    queryFn: () => api.me().catch((e: { status?: number }) => (e.status === 401 ? null : Promise.reject(e))),
    retry: false,
    staleTime: Infinity,
  })

  const value = useMemo<AuthState>(
    () => ({
      user: data ?? null,
      loading: isPending,
      signIn: async (email, password) => {
        const admin = await api.login(email, password)
        queryClient.setQueryData(ME_KEY, admin)
        return admin
      },
      signOut: async () => {
        await api.logout().catch(() => undefined)
        dropSession(queryClient)
      },
    }),
    [data, isPending, queryClient],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthState {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
