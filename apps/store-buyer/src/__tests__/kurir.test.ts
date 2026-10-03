import { describe, expect, it } from 'vitest'
import { KURIR, cariKurir } from '@/lib/kurir'

describe('cariKurir', () => {
  it('matches codes and common spellings', () => {
    expect(cariKurir('JNE')?.kode).toBe('jne')
    expect(cariKurir('jne')?.kode).toBe('jne')
    expect(cariKurir('J&T Express')?.kode).toBe('jnt')
    expect(cariKurir('jnt')?.kode).toBe('jnt')
    expect(cariKurir('J&T Cargo')?.kode).toBe('jntcargo')
    expect(cariKurir('Si Cepat')?.kode).toBe('sicepat')
    expect(cariKurir('ID Express')?.kode).toBe('idexpress')
    expect(cariKurir('gosend')?.kode).toBe('gojek')
  })
  it('returns null for empty or unknown text', () => {
    expect(cariKurir('')).toBeNull()
    expect(cariKurir(null)).toBeNull()
    expect(cariKurir('kurir-lokal')).toBeNull()
  })
  it('only references logo files that exist', async () => {
    const { existsSync } = await import('node:fs')
    for (const k of KURIR) if (k.logo) expect(existsSync(`public/kurir/${k.logo}`), k.logo).toBe(true)
  })
})
