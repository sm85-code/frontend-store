import { describe, expect, it, vi } from 'vitest'
import { ApiError, SERVER_BUSY_MESSAGE, createClient, normalizeBaseUrl, parseDetail } from './client'
import { buyerEndpoints } from './endpoints'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('normalizeBaseUrl', () => {
  it('strips trailing slashes and a trailing /api', () => {
    expect(normalizeBaseUrl('https://api.example.com/')).toBe('https://api.example.com')
    expect(normalizeBaseUrl('https://api.example.com/api')).toBe('https://api.example.com')
    expect(normalizeBaseUrl('  https://api.example.com/api/ ')).toBe('https://api.example.com')
  })
})

describe('parseDetail', () => {
  it('reads string and validation-list details, with a fallback', () => {
    expect(parseDetail({ detail: 'Email sudah terdaftar' }, 'x')).toBe('Email sudah terdaftar')
    expect(parseDetail({ detail: [{ msg: 'a' }, { msg: 'b' }] }, 'x')).toBe('a, b')
    expect(parseDetail({}, 'fallback')).toBe('fallback')
    expect(parseDetail(null, 'fallback')).toBe('fallback')
  })
})

describe('createClient', () => {
  it('sends credentials, JSON body and query params to the prefixed URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
    const client = createClient({ baseUrl: 'https://api.test/api', prefix: '/api/store/buyer', fetch: fetchMock })

    await client.post('/keranjang', { produk_id: 'p1', qty: 2 }, { query: { a: 1, empty: '', none: undefined } })

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.test/api/store/buyer/keranjang?a=1')
    expect(init.method).toBe('POST')
    expect(init.credentials).toBe('include')
    expect(init.body).toBe(JSON.stringify({ produk_id: 'p1', qty: 2 }))
    expect(new Headers(init.headers).get('Content-Type')).toBe('application/json')
  })

  it('does not force a JSON content type for FormData uploads', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 'p1' }))
    const client = createClient({ baseUrl: 'https://api.test', prefix: '/api/store/admin', fetch: fetchMock })
    const form = new FormData()
    form.append('file', new Blob(['x']), 'a.png')

    await client.post('/produk/p1/foto', form)

    const init = fetchMock.mock.calls[0]![1] as RequestInit
    expect(init.body).toBe(form)
    expect(new Headers(init.headers).has('Content-Type')).toBe(false)
  })

  it('turns an error response into ApiError carrying the backend detail', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ detail: 'Pembayaran belum aktif' }, 503))
    const client = createClient({ baseUrl: 'https://api.test', prefix: '/api/store/buyer', fetch: fetchMock })

    const error = await client.post('/pesanan/x/bayar').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(503)
    expect((error as ApiError).isNotReady).toBe(true)
    expect((error as ApiError).message).toBe('Pembayaran belum aktif')
  })

  it('flags 401 and tolerates an empty or non-JSON error body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('<html>not found</html>', { status: 404 }))
    const client = createClient({ baseUrl: 'https://api.test', prefix: '/p', fetch: fetchMock })

    const error = (await client.get('/x').catch((e: unknown) => e)) as ApiError
    expect(error.status).toBe(404)
    expect(error.message).toContain('404')

    fetchMock.mockResolvedValue(jsonResponse({ detail: 'Sesi tidak valid' }, 401))
    expect(((await client.get('/x').catch((e: unknown) => e)) as ApiError).isUnauthorized).toBe(true)
  })

  it('shows a plain message (not "HTTP 504") when a gateway answers with an HTML error page', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('<html>gateway timeout</html>', { status: 504 }))
    const client = createClient({ baseUrl: 'https://api.test', prefix: '/p', fetch: fetchMock })

    const error = (await client.post('/pesanan/x/bayar').catch((e: unknown) => e)) as ApiError

    expect(error.status).toBe(504)
    expect(error.message).toBe(SERVER_BUSY_MESSAGE)
    expect(error.isServerError).toBe(true)
    expect(error.isNotReady).toBe(false)
  })

  it('treats 501 and 503 as "not active yet", and keeps our JSON message', async () => {
    for (const status of [501, 503]) {
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ detail: 'Pembayaran belum aktif' }, status))
      const client = createClient({ baseUrl: 'https://api.test', prefix: '/p', fetch: fetchMock })
      const error = (await client.post('/x').catch((e: unknown) => e)) as ApiError
      expect(error.isNotReady).toBe(true)
      expect(error.message).toBe('Pembayaran belum aktif')
    }
  })

  it('maps a network failure to ApiError status 0 with a friendly message', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('fetch failed'))
    const client = createClient({ baseUrl: 'https://api.test', prefix: '/p', fetch: fetchMock })

    const error = (await client.get('/x').catch((e: unknown) => e)) as ApiError

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(0)
    expect(error.isServerError).toBe(true)
  })

  it('rethrows when the caller aborted the request', async () => {
    const controller = new AbortController()
    controller.abort()
    const fetchMock = vi.fn().mockRejectedValue(new DOMException('aborted', 'AbortError'))
    const client = createClient({ baseUrl: 'https://api.test', prefix: '/p', fetch: fetchMock })

    const error = await client.get('/x', { signal: controller.signal }).catch((e: unknown) => e)

    expect(error).not.toBeInstanceOf(ApiError)
  })

  it('passes Next.js style init (revalidate) through to fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]))
    const buyer = buyerEndpoints(createClient({ baseUrl: 'https://api.test', prefix: '/api/store/buyer', fetch: fetchMock }))

    await buyer.listProduk({ next: { revalidate: 60 } } as RequestInit)

    expect((fetchMock.mock.calls[0]![1] as { next?: unknown }).next).toEqual({ revalidate: 60 })
  })
})
