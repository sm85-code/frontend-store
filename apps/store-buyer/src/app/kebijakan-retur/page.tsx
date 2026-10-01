import type { Metadata } from 'next'
import Link from 'next/link'
import { Bagian, Halaman } from '@/components/Halaman'

export const metadata: Metadata = {
  title: 'Kebijakan Retur',
  description: 'Syarat dan cara mengajukan retur atau penukaran barang di Ampelkuning.',
  alternates: { canonical: '/kebijakan-retur' },
}

export default function KebijakanReturPage() {
  return (
    <Halaman
      judul="Kebijakan Retur"
      ringkas="Kami ingin Anda puas. Jika barang yang diterima bermasalah, Anda dapat mengajukan retur atau penukaran sesuai ketentuan berikut."
      diperbarui="1 Oktober 2026"
    >
      <Bagian judul="Barang yang dapat diretur">
        <ul className="list-disc pl-5">
          <li>Barang rusak atau cacat saat diterima.</li>
          <li>Barang tidak sesuai pesanan (produk, varian, atau jumlah keliru).</li>
          <li>Barang kurang atau tidak lengkap dibanding yang tertera di pesanan.</li>
        </ul>
      </Bagian>

      <Bagian judul="Batas waktu">
        <p>
          Ajukan retur paling lambat <strong>2 hari</strong> setelah barang diterima, melalui{' '}
          <Link className="underline" href="/chat">halaman Chat</Link>. Pengajuan di luar batas waktu dapat ditolak.
        </p>
      </Bagian>

      <Bagian judul="Cara mengajukan">
        <ol className="list-decimal pl-5">
          <li>Buka Chat dan sebutkan nomor pesanan serta masalah yang terjadi.</li>
          <li>Lampirkan foto barang dan kemasan, sebaiknya juga video saat paket dibuka.</li>
          <li>Kami memeriksa pengajuan Anda dan memberi kabar tentang langkah berikutnya: penukaran barang atau pengembalian dana.</li>
          <li>Jika barang perlu dikirim kembali, kami akan memberi tahu alamat dan caranya.</li>
        </ol>
      </Bagian>

      <Bagian judul="Syarat barang">
        <ul className="list-disc pl-5">
          <li>Barang belum dipakai, belum dicuci, dan label atau kemasan asli masih ada.</li>
          <li>Barang dikembalikan lengkap bersama aksesorinya.</li>
        </ul>
      </Bagian>

      <Bagian judul="Yang tidak dapat diretur">
        <ul className="list-disc pl-5">
          <li>Perubahan pikiran setelah barang diterima dalam kondisi baik.</li>
          <li>Barang rusak karena pemakaian atau penanganan setelah diterima.</li>
          <li>Barang pre-order yang sudah diproses, kecuali ada cacat atau kesalahan dari kami.</li>
        </ul>
      </Bagian>

      <Bagian judul="Pengembalian dana">
        <p>
          Jika retur disetujui dan penukaran tidak memungkinkan, dana dikembalikan melalui metode pembayaran yang sama atau
          cara lain yang disepakati. Ongkos kirim retur ditanggung kami bila penyebabnya kesalahan atau cacat dari pihak kami.
        </p>
      </Bagian>
    </Halaman>
  )
}
