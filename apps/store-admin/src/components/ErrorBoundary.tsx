import { Button, ErrorNotice } from '@store/ui'
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI error', error, info.componentStack)
  }

  override render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="mx-auto mt-16 max-w-md p-4">
        <ErrorNotice
          message="Terjadi kesalahan pada tampilan. Muat ulang halaman untuk melanjutkan."
          action={<Button size="sm" onClick={() => window.location.reload()}>Muat ulang</Button>}
        />
      </div>
    )
  }
}
