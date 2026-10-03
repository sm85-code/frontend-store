import type { Metadata } from 'next'
import Link from 'next/link'
import { KONTAK } from '@/lib/kontak'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Data apa yang dikumpulkan Ampelkuning, untuk apa dipakai, dan hak Anda atas data tersebut.',
  alternates: { canonical: '/kebijakan-privasi' },
}

const UPDATED = '1 Oktober 2026'
const CONTACT_EMAIL: string = KONTAK.email

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed">{children}</div>
    </section>
  )
}

export default function KebijakanPrivasiPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Kebijakan Privasi</h1>
      <p className="mt-1 text-sm text-muted-foreground">Terakhir diperbarui: {UPDATED}</p>
      <p className="mt-4 text-sm leading-relaxed">
        Ampelkuning (&ldquo;kami&rdquo;) mengelola toko online di ampelkuning.com. Halaman ini menjelaskan data apa yang
        kami kumpulkan saat Anda berbelanja, untuk apa data itu dipakai, dan pilihan Anda.
      </p>

      <Section title="Data yang kami kumpulkan">
        <ul className="list-disc pl-5">
          <li>
            <strong>Akun:</strong> nama dan email. Jika Anda mendaftar dengan email, kami menyimpan password dalam bentuk
            hash (tidak bisa dibaca kembali).
          </li>
          <li>
            <strong>Masuk dengan Google:</strong> nama, alamat email, dan ID akun Google Anda. Kami tidak pernah menerima
            atau menyimpan password Google Anda.
          </li>
          <li>
            <strong>Pengiriman:</strong> nama penerima, nomor telepon, dan alamat tujuan yang Anda isi.
          </li>
          <li>
            <strong>Pesanan:</strong> produk yang dipesan, jumlah, total, dan status pembayaran serta pengiriman.
          </li>
          <li>
            <strong>Pesan chat</strong> yang Anda kirim kepada toko.
          </li>
        </ul>
      </Section>

      <Section title="Untuk apa data dipakai">
        <p>
          Untuk memproses dan mengirim pesanan, menghubungi Anda terkait pesanan, menjaga keamanan akun, dan memperbaiki
          layanan. Kami tidak menjual data pribadi Anda.
        </p>
      </Section>

      <Section title="Dengan siapa data dibagikan">
        <ul className="list-disc pl-5">
          <li>Jasa pengiriman, sebatas nama, telepon, dan alamat yang diperlukan untuk mengantar paket.</li>
          <li>Penyedia pembayaran, sebatas data yang diperlukan untuk menyelesaikan pembayaran Anda.</li>
          <li>
            Penyedia infrastruktur yang menyimpan dan menjalankan layanan kami (hosting, basis data, dan penyimpanan
            gambar), yang hanya memproses data atas nama kami.
          </li>
          <li>Pihak berwenang, bila diwajibkan oleh hukum.</li>
        </ul>
      </Section>

      <Section title="Penggunaan data akun Google">
        <p>
          Jika Anda memilih Masuk dengan Google, data dari Google (nama, email, dan ID akun) hanya dipakai untuk membuat dan
          mengenali akun Anda di toko ini. Data itu tidak dijual dan tidak dipakai untuk iklan. Penggunaan informasi yang
          kami terima dari Google mematuhi Kebijakan Data Pengguna Layanan Google API, termasuk persyaratan Penggunaan
          Terbatas.
        </p>
      </Section>

      <Section title="Cookie dan penyimpanan di perangkat">
        <p>
          Kami memakai satu cookie untuk menjaga Anda tetap masuk (tidak dapat dibaca oleh skrip di halaman). Pilihan tema
          terang atau gelap disimpan di perangkat Anda. Kami tidak memasang cookie iklan.
        </p>
      </Section>

      <Section title="Penyimpanan dan keamanan">
        <p>
          Seluruh akses ke toko memakai koneksi terenkripsi (HTTPS). Data pesanan disimpan selama diperlukan untuk
          transaksi, layanan purna jual, dan kewajiban hukum.
        </p>
      </Section>

      <Section title="Hak Anda">
        <p>
          Anda dapat meminta akses, koreksi, atau penghapusan akun dan data Anda.{' '}
          {CONTACT_EMAIL ? (
            <>
              Hubungi kami di <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> atau melalui
            </>
          ) : (
            <>Hubungi kami melalui</>
          )}{' '}
          <Link className="underline" href="/chat">
            halaman Chat
          </Link>
          .
        </p>
      </Section>

      <Section title="Perubahan kebijakan">
        <p>
          Kebijakan ini dapat diperbarui. Tanggal perubahan terakhir tertera di bagian atas halaman ini.
        </p>
      </Section>
    </article>
  )
}
