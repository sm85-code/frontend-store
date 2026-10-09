import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BulkActions, useBulkSelection } from '../components/BulkActions'
const confirm = vi.hoisted(() => vi.fn())
vi.mock('../components/ConfirmProvider', () => ({ useConfirm: () => confirm }))

function Fixture({ scope = 'page1', run, complete }: { scope?: string; run: (id: string) => Promise<unknown>; complete: () => void }) {
  const bulk = useBulkSelection(scope, ['a', 'b'])
  return <BulkActions ids={['a', 'b']} selected={bulk.selected} setSelected={bulk.setSelected} actions={[{ label: 'Hapus', destructive: true, run }]} onComplete={complete} />
}

describe('bulk actions', () => {
  it('keeps failed selections and reports partial errors', async () => {
    confirm.mockResolvedValue(true)
    const run = vi.fn(async (id: string) => { if (id === 'b') throw new Error('Produk pernah dipesan') })
    const complete = vi.fn()
    render(<Fixture run={run} complete={complete} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Hapus' }))
    await waitFor(() => expect(complete).toHaveBeenCalledOnce())
    expect(run.mock.calls.map(([id]) => id)).toEqual(['a', 'b'])
    expect(screen.getByText('1 dipilih')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Produk pernah dipesan')
  })
  it('does not delete when confirmation is rejected and clears selection on a new page', async () => {
    confirm.mockResolvedValue(false)
    const run = vi.fn(), complete = vi.fn()
    const { rerender } = render(<Fixture run={run} complete={complete} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Hapus' }))
    expect(run).not.toHaveBeenCalled()
    rerender(<Fixture scope="page2" run={run} complete={complete} />)
    expect(screen.queryByRole('button', { name: 'Hapus' })).not.toBeInTheDocument()
  })
})
