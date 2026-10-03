import { KURIR_PILIHAN, type Pengaturan } from '@store/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/erp'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { api, errorMessage } from '../lib/api'

/** Which couriers checkout offers, and where the courier picks the parcel up. Empty values use the server defaults. */
export function PengaturanPengirimanCard({ pengaturan }: { pengaturan: Pengaturan }) {
  const qc = useQueryClient()
  const [kurir, setKurir] = useState<string[]>(pengaturan.kurir_aktif)
  const [nama, setNama] = useState(pengaturan.asal_nama)
  const [telepon, setTelepon] = useState(pengaturan.asal_telepon)
  const [alamat, setAlamat] = useState(pengaturan.asal_alamat)
  const [kodePos, setKodePos] = useState(pengaturan.asal_kode_pos)

  const simpan = useMutation({
    mutationFn: () =>
      api.patchPengaturanPengiriman({
        kurir_aktif: kurir,
        asal_nama: nama,
        asal_telepon: telepon,
        asal_alamat: alamat,
        asal_kode_pos: kodePos,
      }),
    onSuccess: (data) => {
      qc.setQueryData(['pengaturan'], data)
      toast.success('Pengaturan pengiriman disimpan')
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  function toggle(kode: string) {
    setKurir((cur) => (cur.includes(kode) ? cur.filter((k) => k !== kode) : [...cur, kode]))
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Kurir &amp; Alamat Asal</CardTitle>
        <CardDescription>
          Pilih kurir yang muncul di checkout. Pilih hanya yang bisa menjemput di tempat Anda atau punya gerai tempat Anda mengantar paket.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-2" disabled={simpan.isPending}>
          <legend className="mb-1 text-sm font-medium">Kurir aktif</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {KURIR_PILIHAN.map((k) => (
              <label key={k.kode} className="flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                <input type="checkbox" checked={kurir.includes(k.kode)} onChange={() => toggle(k.kode)} />
                {k.nama}
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {kurir.length === 0 ? 'Belum ada yang dipilih: toko memakai daftar bawaan server.' : `${kurir.length} kurir dipilih.`}
          </p>
        </fieldset>

        <div className="flex flex-col gap-3 rounded-lg border p-3">
          <p className="text-sm font-medium">Alamat penjemputan</p>
          <Field label="Nama pengirim" htmlFor="asal-nama">
            <Input id="asal-nama" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="AmpelKuning" />
          </Field>
          <Field label="Nomor HP" htmlFor="asal-telp">
            <Input id="asal-telp" inputMode="tel" value={telepon} onChange={(e) => setTelepon(e.target.value)} placeholder="081234567890" />
          </Field>
          <Field label="Alamat lengkap" htmlFor="asal-alamat">
            <Textarea id="asal-alamat" value={alamat} onChange={(e) => setAlamat(e.target.value)} />
          </Field>
          <Field label="Kode pos" htmlFor="asal-pos">
            <Input id="asal-pos" inputMode="numeric" maxLength={5} className="max-w-32" value={kodePos} onChange={(e) => setKodePos(e.target.value)} placeholder="46396" />
          </Field>
          <p className="text-xs text-muted-foreground">Kolom yang dikosongkan memakai nilai bawaan toko.</p>
        </div>

        <Button className="self-start" disabled={simpan.isPending} onClick={() => simpan.mutate()}>
          {simpan.isPending ? 'Menyimpan…' : 'Simpan pengaturan pengiriman'}
        </Button>
      </CardContent>
    </Card>
  )
}
