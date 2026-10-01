// Builds the static region lists behind the checkout address dropdowns.
//
//   node scripts/build-wilayah.mjs [wilayah.sql] [wilayah_kodepos.sql]
//
// Sources (both MIT, by Cahya DSN; codes follow Kepmendagri No 300.2.2-2138 of 2025):
//   https://github.com/cahyadsn/wilayah          db/wilayah.sql           (code -> name)
//   https://github.com/cahyadsn/wilayah_kodepos  db/wilayah_kodepos.sql   (village code -> postal code)
// Without arguments the two dumps are downloaded. Output goes to public/wilayah/:
//   index.json      [[provinceCode, name, [[regencyCode, name], ...]], ...]       (the provinces we ship to)
//   <regency>.json  [[districtCode, name, [[villageCode, name, postalCode], ...]], ...]
// The store ships within Java, Bali and Lampung; the API refuses other provinces too (PROVINSI_DILAYANI).
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const SOURCES = [
  'https://raw.githubusercontent.com/cahyadsn/wilayah/master/db/wilayah.sql',
  'https://raw.githubusercontent.com/cahyadsn/wilayah_kodepos/main/db/wilayah_kodepos.sql',
]
// Banten, DKI Jakarta, Jawa Barat, Jawa Tengah, DI Yogyakarta, Jawa Timur, Bali, Lampung.
const PROVINSI = new Set(['36', '31', '32', '33', '34', '35', '51', '18'])
// The official names are long for a dropdown (and "Daerah ..." files them under D): use the names people know.
const NAMA_PENDEK = { 31: 'DKI Jakarta', 34: 'DI Yogyakarta' }

async function load(arg, url) {
  if (arg) return readFileSync(arg, 'utf8')
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`)
  return res.text()
}

const [namesSql, posSql] = await Promise.all([load(process.argv[2], SOURCES[0]), load(process.argv[3], SOURCES[1])])

const names = new Map()
for (const m of namesSql.matchAll(/\('([\d.]+)',\s*'((?:[^']|'')*)'\)/g)) names.set(m[1], m[2].replaceAll("''", "'"))
const postal = new Map()
for (const m of posSql.matchAll(/\('([\d.]+)',\s*'(\d*)'\)/g)) postal.set(m[1], m[2])

const byLevel = (len, prefix) => [...names].filter(([k]) => k.length === len && k.startsWith(prefix))
const sortName = (a, b) => a[1].localeCompare(b[1], 'id')

const out = path.join(import.meta.dirname, '..', 'public', 'wilayah')
rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

const index = []
let villages = 0
for (const kode of PROVINSI) {
  const nama = NAMA_PENDEK[kode] ?? names.get(kode)
  if (!nama) throw new Error(`province ${kode} missing from the source`)
  const kota = byLevel(5, `${kode}.`).sort((a, b) => a[0].localeCompare(b[0]))
  index.push([kode, nama, kota.map(([k, n]) => [k, n])])
  for (const [kk] of kota) {
    const kec = byLevel(8, `${kk}.`).sort(sortName)
    const data = kec.map(([ck, cn]) => {
      const desa = byLevel(13, `${ck}.`)
        .sort(sortName)
        .map(([dk, dn]) => {
          const pos = postal.get(dk)
          if (!pos) throw new Error(`no postal code for ${dk} ${dn}`)
          villages++
          return [dk, dn, pos]
        })
      return [ck, cn, desa]
    })
    writeFileSync(path.join(out, `${kk}.json`), JSON.stringify(data))
  }
}
index.sort((a, b) => a[1].localeCompare(b[1], 'id'))
writeFileSync(path.join(out, 'index.json'), JSON.stringify(index))
console.log(`${index.length} provinces, ${index.reduce((n, p) => n + p[2].length, 0)} regencies, ${villages} villages`)
