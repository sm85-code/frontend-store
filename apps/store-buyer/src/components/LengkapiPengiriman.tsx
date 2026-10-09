'use client'

import { ApiError, fmtRp } from '@store/shared'
import { Button, ErrorNotice } from '@store/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Link from 'next/link'
import { api, errorMessage } from '@/lib/api'

export function LengkapiPengiriman({ pesananId, cod }: { pesananId: string; cod: boolean }) {
  const qc = useQueryClient()
  const addresses = useQuery({ queryKey: ['alamat'], queryFn: api.listAlamat })
  const [addressId, setAddressId] = useState('')
  const [courier, setCourier] = useState('')
  const address = addresses.data?.find((a) => a.id === addressId) ?? addresses.data?.[0]
  const rates = useQuery({ queryKey: ['ongkir-pemulihan', pesananId, address?.kode_pos],
    queryFn: () => api.cekOngkir(address!.kode_pos, cod, pesananId), enabled: !!address, retry: false })
  const inactive = rates.error instanceof ApiError && rates.error.isNotReady
  const option = rates.data?.find((o) => `${o.kurir}:${o.layanan}` === courier)
  const save = useMutation({ mutationFn: () => api.isiPengiriman(pesananId, {
    kurir: option?.kurir ?? 'Menunggu konfirmasi', layanan: option?.layanan ?? '-',
    nama_penerima: address!.nama_penerima, telepon_penerima: address!.telepon_penerima,
    alamat_tujuan: address!.alamat_lengkap, kota_tujuan: address!.kota, provinsi_tujuan: address!.provinsi,
    kode_pos_tujuan: address!.kode_pos, kecamatan_tujuan: address!.kecamatan,
    kelurahan_tujuan: address!.kelurahan, kode_wilayah_tujuan: address!.kode_wilayah,
  }), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['pengiriman', pesananId] }); void qc.invalidateQueries({ queryKey: ['pesanan', pesananId] }) } })
  return <section className="flex min-w-0 flex-col gap-3 rounded-lg border bg-card p-4">
    <h2 className="font-semibold">Lengkapi pengiriman</h2>
    <Link href="/akun/alamat" className="text-sm text-primary">Kelola alamat</Link>
    <select aria-label="Alamat pengiriman" className="rounded-lg border bg-background p-3" value={address?.id ?? ''} onChange={(e) => { setAddressId(e.target.value); setCourier('') }}>
      <option value="" disabled>Pilih alamat</option>{addresses.data?.map((a) => <option key={a.id} value={a.id}>{a.label} · {a.nama_penerima}</option>)}
    </select>
    {!inactive ? <select aria-label="Kurir pengiriman" className="rounded-lg border bg-background p-3" value={courier} onChange={(e) => setCourier(e.target.value)}>
      <option value="">Pilih kurir</option>{rates.data?.map((o) => <option key={`${o.kurir}:${o.layanan}`} value={`${o.kurir}:${o.layanan}`}>{o.kurir_nama} · {o.layanan_nama} · {fmtRp(o.ongkir)}</option>)}
    </select> : null}
    {addresses.error || save.error || (rates.error && !inactive) ? <ErrorNotice message={errorMessage(addresses.error ?? save.error ?? rates.error)} /> : null}
    <Button loading={save.isPending} disabled={!address || (!inactive && !option)} onClick={() => save.mutate()}>Simpan pengiriman</Button>
  </section>
}
