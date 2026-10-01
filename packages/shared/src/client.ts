export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }

  get isUnauthorized() {
    return this.status === 401
  }

  /** The backend answers 501 for integrations that are not wired yet (payment, shipping, photo storage).
   *  503 is accepted too: on DigitalOcean App Platform an application 503 never reaches us as JSON (it is
   *  replaced by a 504 page), but other hosts may pass it through. */
  get isNotReady() {
    return this.status === 501 || this.status === 503
  }

  /** The server (or something in front of it) failed: 5xx, or no answer at all (status 0). */
  get isServerError() {
    return this.status === 0 || this.status >= 500
  }
}

export const SERVER_BUSY_MESSAGE = 'Layanan sedang sibuk atau belum bisa dihubungi. Coba lagi sebentar lagi.'

export interface ClientOptions {
  /** Origin of sm85-arch, with or without a trailing "/api" or slash. */
  baseUrl: string
  /** URL prefix of the sub-tenant, e.g. "/api/store/buyer". */
  prefix: string
  fetch?: typeof fetch
  timeoutMs?: number
}

export interface RequestOptions {
  query?: Record<string, string | number | boolean | null | undefined>
  body?: unknown
  /** Extra fetch init, e.g. Next.js `{ next: { revalidate: 60 } }` or forwarded headers. */
  init?: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } }
  signal?: AbortSignal
}

export const DEFAULT_TIMEOUT_MS = 15_000

export function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '').replace(/\/api$/i, '')
}

export function parseDetail(data: unknown, fallback: string): string {
  const detail = (data as { detail?: unknown } | null)?.detail
  if (typeof detail === 'string' && detail) return detail
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (typeof item === 'string' ? item : (item as { msg?: string })?.msg))
      .filter((m): m is string => Boolean(m))
    if (messages.length) return messages.join(', ')
  }
  return fallback
}

export type Client = ReturnType<typeof createClient>

export function createClient({ baseUrl, prefix, fetch: fetchImpl, timeoutMs = DEFAULT_TIMEOUT_MS }: ClientOptions) {
  const root = `${normalizeBaseUrl(baseUrl)}${prefix}`

  async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
    const search = new URLSearchParams()
    for (const [key, value] of Object.entries(opts.query ?? {})) {
      if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
    }
    const qs = search.toString()
    // `root` is relative ("/api/store/...") when baseUrl is empty => same origin (browser only).
    const target = `${root}${path}${qs ? `?${qs}` : ''}`

    const headers = new Headers(opts.init?.headers)
    let body: BodyInit | undefined
    if (opts.body instanceof FormData) {
      body = opts.body
    } else if (opts.body !== undefined) {
      headers.set('Content-Type', 'application/json')
      body = JSON.stringify(opts.body)
    }

    const timeout = AbortSignal.timeout(timeoutMs)
    const signal = opts.signal ? AbortSignal.any([opts.signal, timeout]) : timeout

    let response: Response
    try {
      response = await (fetchImpl ?? fetch)(target, {
        credentials: 'include',
        ...opts.init,
        method,
        headers,
        body,
        signal,
      })
    } catch (error) {
      if (opts.signal?.aborted) throw error
      throw new ApiError(0, 'Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba lagi.')
    }

    const text = await response.text()
    let data: unknown = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = null
      }
    }
    if (!response.ok) {
      // A 5xx without our JSON body comes from a proxy or gateway: show a plain message, not "HTTP 504".
      const fallback = response.status >= 500 ? SERVER_BUSY_MESSAGE : `Permintaan gagal (HTTP ${response.status})`
      throw new ApiError(response.status, parseDetail(data, fallback))
    }
    return data as T
  }

  return {
    get: <T>(path: string, opts?: RequestOptions) => request<T>('GET', path, opts),
    post: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>('POST', path, { ...opts, body }),
    patch: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>('PATCH', path, { ...opts, body }),
    put: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>('PUT', path, { ...opts, body }),
    delete: <T>(path: string, opts?: RequestOptions) => request<T>('DELETE', path, opts),
  }
}
