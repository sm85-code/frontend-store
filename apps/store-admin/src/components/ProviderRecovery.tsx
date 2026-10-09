import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api, errorMessage } from '../lib/api'

export function ProviderRecovery({ id, payment, shipping, uncertain }: { id: string; payment: boolean; shipping: boolean; uncertain: boolean }) {
  const [transaction, setTransaction] = useState('')
  const [booking, setBooking] = useState('')
  const qc = useQueryClient()
  const check = useMutation({ mutationFn: async () => { if (payment) await api.verifikasiPembayaran(id, transaction.trim()); else await api.rekonsiliasiKurir(id, booking.trim()) },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['pesanan'] }); void qc.invalidateQueries({ queryKey: ['laporan'] }); void qc.invalidateQueries({ queryKey: ['pengiriman', id] }); toast.success('Hasil verifikasi diperbarui') },
    onError: (error) => toast.error(errorMessage(error)) })
  if (!payment && !shipping) return null
  return <details open={uncertain} className="space-y-3 rounded-lg border border-amber-500 bg-card p-4">
    <summary className="cursor-pointer font-semibold">Verifikasi {payment ? 'pembayaran' : 'pemesanan kurir'}</summary>
    <p className="text-sm text-muted-foreground">Periksa dashboard {payment ? 'iPaymu' : 'Biteship'}, lalu verifikasi ID yang sudah ada. Verifikasi tidak membuat transaksi atau pemesanan baru.</p>
    <label className="block space-y-2 text-sm">{payment ? 'ID transaksi iPaymu' : 'ID pesanan Biteship'}
      <Input value={payment ? transaction : booking} onChange={(e) => payment ? setTransaction(e.target.value) : setBooking(e.target.value)} />
    </label>
    <Button disabled={check.isPending || !(payment ? transaction.trim() : booking.trim())} onClick={() => check.mutate()}>{check.isPending ? 'Memverifikasi…' : 'Verifikasi hasil'}</Button>
  </details>
}
