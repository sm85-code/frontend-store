import { fmtRp, formatAlamat, namaKurir, type LabelPengiriman } from '@store/shared'
import JsBarcode from 'jsbarcode'

/** Courier artwork under public/kurir (same files as the buyer shop). `gelap`: the artwork is white, so it sits on black. */
const LOGO_KURIR: Record<string, { file: string; gelap?: boolean }> = {
  jne: { file: 'jne.svg' },
  jnt: { file: 'jnt.png', gelap: true },
  jntcargo: { file: 'jnt.png', gelap: true },
  sicepat: { file: 'sicepat.svg' },
  anteraja: { file: 'anteraja.png' },
  idexpress: { file: 'idexpress.svg' },
  ninja: { file: 'ninja.png', gelap: true },
  lion: { file: 'lion.svg' },
  tiki: { file: 'tiki.png' },
  pos: { file: 'pos.png' },
  wahana: { file: 'wahana.png' },
  rpx: { file: 'rpx.png' },
}

/** Escape text before it goes into the label HTML: names and addresses are typed by buyers. */
function esc(teks: string | number | null | undefined): string {
  return String(teks ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Code 128 barcode of the waybill, as inline SVG. */
function barcodeSvg(resi: string): string {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  JsBarcode(svg, resi, { format: 'CODE128', displayValue: false, height: 60, margin: 0, width: 2 })
  return svg.outerHTML
}

/** The courier logo as a data URL, so the print window never has to fetch it. Empty when there is none or it fails. */
export async function logoKurirDataUrl(kode: string): Promise<string> {
  const logo = LOGO_KURIR[kode.trim().toLowerCase()]
  if (!logo) return ''
  try {
    const resp = await fetch(`/kurir/${logo.file}`)
    if (!resp.ok) return ''
    const blob = await resp.blob()
    return await new Promise<string>((selesai) => {
      const baca = new FileReader()
      baca.onload = () => selesai(String(baca.result))
      baca.onerror = () => selesai('')
      baca.readAsDataURL(blob)
    })
  } catch {
    return ''
  }
}

/** The label (10 x 15 cm, thermal / A6) as a complete HTML page. `logoUrl` is the courier logo data URL, if any. */
export function htmlLabelResi(d: LabelPengiriman, logoUrl = ''): string {
  const alamat = formatAlamat({
    alamat: d.penerima.alamat,
    kelurahan: d.penerima.kelurahan,
    kecamatan: d.penerima.kecamatan,
    kota: d.penerima.kota,
    provinsi: d.penerima.provinsi,
    kodePos: d.penerima.kode_pos,
  })
  const barang = d.barang.map((b) => `${b.qty}x ${esc(b.nama)}`).join('<br>')
  const logo = LOGO_KURIR[d.kurir.trim().toLowerCase()]
  const logoHtml = logo && logoUrl ? `<span class="logo${logo.gelap ? ' gelap' : ''}"><img src="${esc(logoUrl)}" alt=""></span>` : ''
  const cod = d.cod > 0 ? `<div class="cod">COD: <strong>${esc(fmtRp(d.cod))}</strong><span>Tagih ke penerima</span></div>` : '<div class="cod lunas">NON-COD (sudah dibayar)</div>'
  return `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><title>Resi ${esc(d.resi)}</title>
<style>
@page { size: 100mm 150mm; margin: 0 }
* { box-sizing: border-box }
body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #000 }
.label { width: 100mm; height: 150mm; padding: 3mm; display: flex; flex-direction: column; border: 0.3mm solid #000 }
.box { border: 0.3mm solid #000; padding: 1.6mm 2mm; margin-bottom: 1.6mm }
.kepala { display: flex; justify-content: space-between; align-items: center; font-size: 5mm; font-weight: 700 }
.kepala small { font-size: 3mm; font-weight: 400 }
.nama { display: flex; align-items: center; gap: 2mm }
.logo { display: inline-flex; align-items: center; padding: 0.6mm 1.2mm } .logo img { height: 8mm; width: auto; max-width: 28mm; display: block }
.logo.gelap { background: #000; border-radius: 0.8mm }
.barcode { text-align: center } .barcode svg { width: 100%; height: 16mm }
.resi { text-align: center; font-size: 4.2mm; font-weight: 700; letter-spacing: 0.3mm }
.cod { font-size: 4.2mm; text-align: center } .cod span { display: block; font-size: 2.8mm } .cod.lunas { font-size: 3mm }
.dua { display: flex; gap: 1.6mm } .dua > .box { flex: 1; margin-bottom: 1.6mm }
.judul { font-size: 2.6mm; color: #333; margin-bottom: 0.6mm }
.isi { font-size: 3.2mm; line-height: 1.25 } .isi.kecil { font-size: 2.8mm }
.meta { font-size: 3mm } .catatan { font-size: 2.8mm }
</style></head><body><div class="label">
<div class="box kepala"><span class="nama">${logoHtml}${esc(namaKurir(d.kurir))}</span><small>${esc(d.layanan)}</small></div>
<div class="box"><div class="barcode">${barcodeSvg(d.resi)}</div><div class="resi">${esc(d.resi)}</div></div>
<div class="box">${cod}</div>
<div class="dua">
<div class="box"><div class="judul">PENERIMA</div><div class="isi"><strong>${esc(d.penerima.nama)}</strong><br>${esc(d.penerima.telepon)}<br>${esc(alamat)}</div></div>
</div>
<div class="box"><div class="judul">PENGIRIM</div><div class="isi kecil"><strong>${esc(d.pengirim.nama)}</strong> · ${esc(d.pengirim.telepon)}<br>${esc(d.pengirim.alamat)} ${esc(d.pengirim.kode_pos)}</div></div>
<div class="box"><div class="judul">ISI PAKET</div><div class="isi kecil">${barang}</div></div>
<div class="box meta">Berat: ${esc((d.berat_gram / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 }))} kg · <span class="catatan">${esc(d.catatan)}</span></div>
</div></body></html>`
}

/** Open the label in a new window and print it. Returns false when the browser blocked the window. */
export async function cetakResi(d: LabelPengiriman): Promise<boolean> {
  // The window is opened first (the browser only allows it right after the click); the logo is fetched meanwhile.
  const jendela = window.open('', '_blank', 'width=480,height=720')
  if (!jendela) return false
  const logoUrl = await logoKurirDataUrl(d.kurir)
  jendela.document.open()
  jendela.document.write(htmlLabelResi(d, logoUrl))
  jendela.document.close()
  jendela.focus()
  // Print once the courier logo has loaded (or after 2 seconds, so a missing logo never blocks printing).
  const gambar = Array.from(jendela.document.images)
  const siap = Promise.all(
    gambar.map((g) => (g.complete ? Promise.resolve() : new Promise<void>((selesai) => { g.onload = g.onerror = () => selesai() }))),
  )
  void Promise.race([siap, new Promise((selesai) => setTimeout(selesai, 2000))]).then(() => jendela.print())
  return true
}
