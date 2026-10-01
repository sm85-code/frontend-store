import { LABEL_PENGIRIMAN, LABEL_PESANAN, TONE_PESANAN, type StatusPengiriman, type StatusPesanan } from '@store/shared'
import { Badge } from '@store/ui'

export function StatusPesananBadge({ status }: { status: StatusPesanan }) {
  return <Badge tone={TONE_PESANAN[status]}>{LABEL_PESANAN[status]}</Badge>
}

export function StatusPengirimanBadge({ status }: { status: StatusPengiriman }) {
  const tone = status === 'diterima' ? 'success' : status === 'bermasalah' ? 'danger' : 'info'
  return <Badge tone={tone}>{LABEL_PENGIRIMAN[status]}</Badge>
}
