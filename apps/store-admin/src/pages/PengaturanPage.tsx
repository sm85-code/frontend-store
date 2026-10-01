import type { MetodeProsesPesanan } from '@store/shared'
import { Card, CardContent, CardHeader, CardTitle, ErrorNotice, PageSpinner } from '@store/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { GantiPasswordCard } from '../components/GantiPasswordCard'
import { PageHeader } from '../components/PageHeader'
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
    <div className="flex flex-col gap-6">
      <PageHeader title="Pengaturan" />
      {pengaturan.isPending ? (
        <PageSpinner />
      ) : pengaturan.error ? (
        <ErrorNotice message={errorMessage(pengaturan.error)} />
      ) : (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Metode proses pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <fieldset className="flex flex-col gap-3" disabled={simpan.isPending}>
              <legend className="sr-only">Metode proses pesanan</legend>
              {OPTIONS.map((o) => (
                <label key={o.value} className="flex cursor-pointer items-start gap-3 rounded-md border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/10">
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
      <GantiPasswordCard />
    </div>
  )
}
