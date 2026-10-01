import { LABEL_PENGIRIMAN, LABEL_PESANAN, type StatusPengiriman, type StatusPesanan } from '@store/shared'
import { Badge } from '@/components/ui/badge'

/** Same mapping the ERP uses: finished = primary tint, cancelled/problem = red, everything else neutral. */
export function StatusPesananBadge({ status }: { status: StatusPesanan }) {
  const variant = status === 'selesai' ? 'default' : status === 'dibatalkan' ? 'destructive' : 'secondary'
  return <Badge variant={variant}>{LABEL_PESANAN[status]}</Badge>
}

export function StatusPengirimanBadge({ status }: { status: StatusPengiriman }) {
  const variant = status === 'diterima' ? 'default' : status === 'bermasalah' ? 'destructive' : 'secondary'
  return <Badge variant={variant}>{LABEL_PENGIRIMAN[status]}</Badge>
}
