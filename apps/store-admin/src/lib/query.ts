import { ApiError } from '@store/shared'
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { ME_KEY } from './auth'

/** A session that expires mid-use: drop the cached user so <Protected> sends the admin to /login. */
function handleUnauthorized(error: unknown, client: QueryClient) {
  if (error instanceof ApiError && error.isUnauthorized && client.getQueryData(ME_KEY)) {
    client.setQueryData(ME_KEY, null)
  }
}

export function createQueryClient() {
  const client: QueryClient = new QueryClient({
    queryCache: new QueryCache({ onError: (e) => handleUnauthorized(e, client) }),
    mutationCache: new MutationCache({ onError: (e) => handleUnauthorized(e, client) }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 2,
      },
    },
  })
  return client
}
