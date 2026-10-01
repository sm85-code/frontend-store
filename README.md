# frontend-store

Frontends for the **store** tenant of [sm85-arch](https://github.com/sm85-code/sm85-arch)
(`/api/store/admin` and `/api/store/buyer`). One pnpm monorepo, two deployable apps:

| App | Stack | Audience | Address |
|---|---|---|---|
| `apps/store-buyer` (`@store/buyer`) | Next.js 16 (App Router, SSR/ISR), React 19 | Shoppers: catalog, cart, checkout, orders, chat, Google login | `ampelkuning.com` |
| `apps/store-admin` (`@store/admin`) | Vite 8 SPA, React 19, React Router 7 | Store staff: products, orders, shipping, reports, chat, staff | `admin.ampelkuning.com` |

Shared code:

| Package | Purpose |
|---|---|
| `packages/shared` (`@store/shared`) | Typed API client (`fetch`, works in browser and Next server), endpoint functions, response types, formatters, order-status rules mirrored from the backend |
| `packages/ui` (`@store/ui`) | Tailwind v4 design tokens (light/dark) and small accessible components |

Both apps use the same stack otherwise: TypeScript (strict), Tailwind CSS v4, TanStack Query, react-hook-form + zod, Vitest, oxlint.

The admin and buyer sides are **separate sessions on the backend** (own account tables, own cookies
`store_admin_token` / `store_buyer_token`, own JWT audience). A buyer token is rejected by the admin API and vice versa.

## Develop

```bash
corepack enable           # or: npm i -g pnpm@10
pnpm install
cp apps/store-admin/.env.example apps/store-admin/.env
cp apps/store-buyer/.env.example apps/store-buyer/.env.local

pnpm dev:buyer            # http://localhost:3000
pnpm dev:admin            # http://localhost:3001
```

Run the backend (sm85-arch) on `http://localhost:8000` with `COOKIE_SECURE=false COOKIE_SAMESITE=lax` and
`CORS_ORIGINS=http://localhost:3000,http://localhost:3001`. Leave the `*_BACKEND_URL` variables empty in dev:
each app then calls its own origin and forwards `/api` to the backend (Vite proxy / Next rewrite), so cookies stay first-party.

First owner account: call `GET /api/store/admin/seed-now` once with header `X-Store-Seed-Secret`
(see the backend `.env.example`: `STORE_SEED_SECRET`, `STORE_SEED_OWNER_PASSWORD`).

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

## Environment

| App | Variable | When | Meaning |
|---|---|---|---|
| admin | `VITE_BACKEND_URL` | build | Backend origin without `/api`, e.g. `https://api.ampelkuning.com`. Empty = same origin |
| buyer | `BACKEND_URL` | **build and run** | Backend origin. The `/api` rewrite is baked in at build time and server-side rendering reads it at run time, so it must be available to both (on DigitalOcean: scope *Build and Run time*) |
| buyer | `NEXT_PUBLIC_BACKEND_URL` | build | Backend origin used by the browser. Empty = same origin (`/api` proxied to `BACKEND_URL`) |
| buyer | `NEXT_PUBLIC_SITE_URL` | build | Public origin (canonical URLs, sitemap, robots) |
| buyer | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | build | Google OAuth Web client id. Empty hides "Masuk dengan Google" |

`NEXT_PUBLIC_*` and `VITE_*` are baked in at build time: changing them needs a rebuild.

## Deploy (DigitalOcean App Platform)

Two components from this one repo (the working directory is the repo root for both, because pnpm needs the workspace lockfile).
This section has not been exercised on App Platform yet; check names against the current DO docs.

| | `store-buyer` | `store-admin` |
|---|---|---|
| Component type | Web service | Static site |
| Build command | `pnpm install --frozen-lockfile && pnpm --filter @store/buyer build` | `pnpm install --frozen-lockfile && pnpm --filter @store/admin build` |
| Run command / output | `pnpm --filter @store/buyer start` | output dir `apps/store-admin/dist`, catch-all document `index.html` |
| Domain | `ampelkuning.com` | `admin.ampelkuning.com` |

Because every address is under `ampelkuning.com` (same site), backend cookies work with `COOKIE_SAMESITE=lax` and
`COOKIE_SECURE=true`, as long as the backend does **not** set a cookie `Domain` (host-only cookies keep admin and buyer sessions apart).
Add both origins to the backend `CORS_ORIGINS`.

## Notes

- Money values are decimal strings from the backend; format with `fmtRp`.
- `TRANSISI_PESANAN` / `TRANSISI_PENGIRIMAN` in `packages/shared/src/status.ts` mirror the backend order flow. Keep them in sync.
- Payment (iPaymu) and shipping (Biteship) are not wired in the backend yet; until then those calls answer HTTP 501 and the UI shows a plain "not active yet" message. The backend never answers 503 for this: DigitalOcean's edge replaces an application 503 with its own HTML 504 page.
