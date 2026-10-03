import type { MetodeProsesPesanan } from '@store/shared'
import Spinner from '@/components/Spinner'
import { ErrorLine, PageTitle } from '@/components/erp'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { GantiPasswordCard } from '../components/GantiPasswordCard'
import { PengaturanPengirimanCard } from '../components/PengaturanPengirimanCard'
import { api, errorMessage } from '../lib/api'

const OPTIONS: { value: MetodeProsesPesanan; label: string; hint: string }[] = [
  { value: 'drop_off', label: 'Drop-off', hint: 'Anda mengantar paket ke gerai kurir.' },
  { value: 'pickup', label: 'Pickup', hint: 'Kurir menjemput paket di lokasi toko.' },
]

export default function PengaturanPage() {
  const qc = useQueryClient()
  const pengaturan = useQuery({ queryKey: ['pengaturan'], queryFn: api.getPengaturan })
  const simpan = useMutation({
    mutationFn: (m: MetodeProsesPesanan) => api.patchPengaturan(m),
    onSuccess: (data) => {
      qc.setQueryData(['pengaturan'], data)
      toast.success('Pengaturan disimpan')
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  return (
    <div className="space-y-4">
      <PageTitle title="Pengaturan" />
      {pengaturan.isPending ? (
        <Spinner column label="Memuat pengaturan…" />
      ) : pengaturan.error ? (
        <ErrorLine message={errorMessage(pengaturan.error)} />
      ) : (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Metode Proses Pesanan</CardTitle>
            <CardDescription>Cara paket Anda sampai ke kurir.</CardDescription>
          </CardHeader>
          <CardContent>
            <fieldset className="flex flex-col gap-3" disabled={simpan.isPending}>
              <legend className="sr-only">Metode proses pesanan</legend>
              {OPTIONS.map((o) => (
                <label key={o.value} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                  <input
                    type="radio"
                    name="metode"
                    className="mt-1"
                    value={o.value}
                    checked={pengaturan.data.metode_proses_pesanan === o.value}
                    onChange={() => simpan.mutate(o.value)}
                  />
                  <span>
                    <span className="block font-medium">{o.label}</span>
                    <span className="text-sm text-muted-foreground">{o.hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>
          </CardContent>
        </Card>
      )}
      {pengaturan.data ? <PengaturanPengirimanCard key={pengaturan.data.updated_at} pengaturan={pengaturan.data} /> : null}
      <GantiPasswordCard />
    </div>
  )
}
