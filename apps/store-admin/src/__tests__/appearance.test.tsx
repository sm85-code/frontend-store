import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import AppearancePopover from '../components/appearance/AppearancePopover'
import { ThemeProvider, useTheme } from '../lib/appearance'

function Probe() {
  const { colorTheme, font, wallpaper, mode } = useTheme()
  return <p data-testid="probe">{[colorTheme, font, wallpaper, mode].join('|')}</p>
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.classList.remove('dark')
})

describe('appearance', () => {
  it('starts like the ERP panel: Biru, Plus Jakarta Sans, plain background, light', () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('probe')).toHaveTextContent('blue|jakarta|none|light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('blue')
    expect(document.documentElement.getAttribute('data-font')).toBe('jakarta')
  })

  it('changing colour and mode applies to <html> and is remembered', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <AppearancePopover />
        <Probe />
      </ThemeProvider>,
    )
    await user.click(screen.getByTestId('appearance-trigger'))
    await act(async () => {
      await user.selectOptions(await screen.findByTestId('theme-switcher'), 'violet')
      await user.selectOptions(screen.getByTestId('mode-switcher'), 'dark')
    })
    expect(document.documentElement.getAttribute('data-theme')).toBe('violet')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('store-admin-color')).toBe('violet')
    // Same key as the blocking <head> script, so a reload paints dark right away.
    expect(localStorage.getItem('store-theme')).toBe('dark')
  })

  it('ignores a corrupted stored value and falls back to the default', () => {
    localStorage.setItem('store-admin-color', 'not-a-theme')
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('probe')).toHaveTextContent('blue|')
  })
})
