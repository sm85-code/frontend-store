import { NextResponse, type NextRequest } from 'next/server'
import { canonicalRedirect } from '@/lib/catalog'

/** Status codes for product pages. A page that streams always answers 200 (even for notFound()/redirect()), which
 *  search engines read as a "soft 404" and a temporary move. So the product is looked up here, before streaming:
 *   - old /produk/<id> links (or any other spelling) get a real HTTP 308 to the canonical /produk/<slug>;
 *   - an unknown or inactive product gets a real HTTP 404 (rendering the usual not-found page);
 *   - anything else, and any lookup failure, passes through to the page (which then does its own check).
 *  The lookup shares Next's fetch cache with the page (same URL, same revalidate window). */
export async function proxy(request: NextRequest) {
  const ref = decodeURIComponent(request.nextUrl.pathname.split('/')[2] ?? '')
  if (!ref) return NextResponse.next()

  const backend = (process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000')
    .replace(/\/+$/, '')
    .replace(/\/api$/i, '')
  try {
    const res = await fetch(`${backend}/api/store/buyer/produk/${encodeURIComponent(ref)}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(3000),
    })
    if (res.status === 404) {
      const gone = request.nextUrl.clone()
      gone.pathname = '/produk-tidak-ditemukan'
      return NextResponse.rewrite(gone, { status: 404 })
    }
    if (!res.ok) return NextResponse.next()
    const to = canonicalRedirect(ref, (await res.json()) as { slug?: string | null })
    if (!to) return NextResponse.next()
    const target = request.nextUrl.clone()
    target.pathname = to
    return NextResponse.redirect(target, 308)
  } catch (error) {
    console.error('proxy: product lookup failed', error)
    return NextResponse.next()
  }
}

export const config = { matcher: '/produk/:ref' }
