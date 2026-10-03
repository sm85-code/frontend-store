import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Bagian, Halaman } from '@/components/Halaman'
import { SITE_URL } from '@/lib/api'
import { ALAMAT_LENGKAP, KONTAK, MAPS_LINK, WA_LINK } from '@/lib/kontak'

export const metadata: Metadata = {
  title: 'Kontak',
  description: `Hubungi AmpelKuning lewat email, WhatsApp, atau alamat usaha di ${KONTAK.kabupaten}. Layanan ${KONTAK.jam}.`,
  alternates: { canonical: '/kontak' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: KONTAK.nama,
  url: SITE_URL,
  email: KONTAK.email,
  telephone: `+${KONTAK.whatsapp}`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${KONTAK.jalan}, ${KONTAK.desa}, ${KONTAK.kecamatan}`,
    addressLocality: KONTAK.kabupaten,
    addressRegion: KONTAK.provinsi,
    postalCode: KONTAK.kodePos,
    addressCountry: 'ID',
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '08:00', closes: '16:00' },
  ],
}

const KARTU = 'flex items-start gap-3.5 rounded-lg border bg-card p-4 text-left'
const IKON = 'mt-0.5 size-5 shrink-0 text-[var(--brand-orange)]'

export default function KontakPage() {
  return (
    <Halaman judul="Kontak" ringkas="Ada pertanyaan tentang produk, pesanan, atau pembayaran? Tim kami siap membantu pada jam layanan di bawah ini.">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <Bagian judul="Hubungi kami">
        <ul className="grid gap-3 sm:grid-cols-2">
          <li className={KARTU}>
            <Mail className={IKON} aria-hidden />
            <div>
              <p className="font-bold">Email</p>
              <a className="break-all underline underline-offset-2" href={`mailto:${KONTAK.email}`}>{KONTAK.email}</a>
            </div>
          </li>
          <li className={KARTU}>
            <Phone className={IKON} aria-hidden />
            <div>
              <p className="font-bold">Telepon / WhatsApp</p>
              <a className="underline underline-offset-2" href={WA_LINK} rel="noopener noreferrer" target="_blank">{KONTAK.telepon}</a>
            </div>
          </li>
          <li className={KARTU}>
            <Clock className={IKON} aria-hidden />
            <div>
              <p className="font-bold">Jam layanan</p>
              <p>{KONTAK.jam}</p>
            </div>
          </li>
          <li className={KARTU}>
            <MessageCircle className={IKON} aria-hidden />
            <div>
              <p className="font-bold">Chat di toko</p>
              <Link className="underline underline-offset-2" href="/chat">Kirim pesan ke penjual</Link>
            </div>
          </li>
        </ul>
        <p>Pesan di luar jam layanan akan kami balas pada hari kerja berikutnya.</p>
      </Bagian>

      <Bagian judul="Alamat usaha">
        <div className={KARTU}>
          <MapPin className={IKON} aria-hidden />
          <div>
            <p className="font-bold">{KONTAK.nama}</p>
            <address className="not-italic">
              {KONTAK.jalan}
              <br />
              {KONTAK.desa}, {KONTAK.kecamatan}
              <br />
              {KONTAK.kabupaten}, {KONTAK.provinsi} {KONTAK.kodePos}
            </address>
            <a className="mt-2 inline-block underline underline-offset-2" href={MAPS_LINK} rel="noopener noreferrer" target="_blank" aria-label={`Buka ${ALAMAT_LENGKAP} di Google Maps`}>
              Buka di Google Maps
            </a>
          </div>
        </div>
        <p>
          Alamat ini adalah alamat usaha. Pengembalian barang dilakukan sesuai petunjuk kami setelah pengajuan disetujui; mohon jangan mengirim barang sebelum
          menghubungi kami terlebih dahulu. Lihat <Link className="underline" href="/refund-policy">Refund Policy</Link>.
        </p>
      </Bagian>
    </Halaman>
  )
}
