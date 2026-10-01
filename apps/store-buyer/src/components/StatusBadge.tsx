import { LABEL_PENGIRIMAN, LABEL_PESANAN, TONE_PESANAN, type StatusPengiriman, type StatusPesanan } from '@store/shared'
import { Badge } from '@store/ui'

export function StatusBadge({ status }: { status: StatusPesanan }) {
  return <Badge tone={TONE_PESANAN[status]}>{LABEL_PESANAN[status]}</Badge>
}

export function PengirimanBadge({ status }: { status: StatusPengiriman }) {
  return <Badge tone={status === 'diterima' ? 'success' : status === 'bermasalah' ? 'danger' : 'info'}>{LABEL_PENGIRIMAN[status]}</Badge>
}
