import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

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
      <div className="flex min-h-[240px] w-full items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Terjadi kesalahan tak terduga</CardTitle>
            <CardDescription>
              Halaman ini mengalami masalah dan tidak dapat ditampilkan sebagaimana mestinya. Silakan muat ulang halaman atau
              kembali ke dasbor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CardFooter className="flex gap-2 p-0">
              <Button onClick={() => window.location.reload()}>Muat Ulang</Button>
              <Button variant="outline" onClick={() => window.location.assign('/')}>
                Kembali ke Dashboard
              </Button>
            </CardFooter>
          </CardContent>
        </Card>
      </div>
    )
  }
}
