import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button'
import { Field, Input } from './form'

describe('Button', () => {
  it('is disabled and busy while loading, and does not fire clicks', async () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Simpan
      </Button>,
    )
    const button = screen.getByRole('button', { name: /simpan/i })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('defaults to type=button so it never submits a surrounding form by accident', () => {
    render(<Button>Batal</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })
})

describe('Field', () => {
  it('links the label to the control and announces the error', () => {
    render(
      <Field label="Email" htmlFor="email" error="Wajib diisi">
        <Input id="email" aria-invalid />
      </Field>,
    )
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Wajib diisi')
  })
})
