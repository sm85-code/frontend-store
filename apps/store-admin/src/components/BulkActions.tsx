import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ConfirmProvider'
import { errorMessage } from '@/lib/api'

export function useBulkSelection(scope: string, ids: string[]) {
  const [state, setState] = useState<{ scope: string; ids: string[] }>({ scope, ids: [] })
  const selected = state.scope === scope ? state.ids.filter((id) => ids.includes(id)) : []
  const setSelected = (next: string[]) => setState({ scope, ids: next })
  return { selected, setSelected, toggle: (id: string) => setSelected(selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id]) }
}

type Action = { label: string; destructive?: boolean; run: (id: string) => Promise<unknown> }
export function BulkActions({ ids, selected, setSelected, actions, onComplete }: {
  ids: string[]; selected: string[]; setSelected: (ids: string[]) => void; actions: Action[]; onComplete: () => void
}) {
  const confirm = useConfirm()
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  async function run(action: Action) {
    if (busy) return
    if (!await confirm({ title: `${action.label} ${selected.length} data?`, description: 'Tindakan berlaku pada data yang dipilih.', destructive: action.destructive })) return
    setBusy(true)
    const failed: string[] = [], messages: string[] = []
    for (const id of selected) {
      try { await action.run(id) } catch (error) { failed.push(id); messages.push(`${id.slice(0, 8)}: ${errorMessage(error)}`) }
    }
    setSelected(failed)
    setErrors(messages)
    setBusy(false)
    onComplete()
  }
  if (!ids.length && !errors.length) return null
  return <div className="space-y-2">
    {!!ids.length && <label className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={busy} checked={ids.length > 0 && selected.length === ids.length} onChange={(e) => setSelected(e.target.checked ? ids : [])} />Pilih semua di halaman ini</label>}
    {!!selected.length && <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3"><span className="text-sm">{selected.length} dipilih</span>{actions.map((action) => <Button key={action.label} size="sm" variant={action.destructive ? 'destructive' : 'outline'} disabled={busy} onClick={() => void run(action)}>{busy ? 'Memproses…' : action.label}</Button>)}<Button size="sm" variant="ghost" disabled={busy} onClick={() => setSelected([])}>Batal</Button></div>}
    {!!errors.length && <div role="alert" className="rounded-lg border p-3 text-sm"><p className="font-medium">{errors.length} data gagal diproses</p><ul>{errors.map((message) => <li key={message}>{message}</li>)}</ul></div>}
  </div>
}
