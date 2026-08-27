import { Component, type ErrorInfo, type ReactNode } from 'react'

import '@/shared/ui/error-boundary.css'
import '@/shared/styles/page-shell.css'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <main className="error-boundary">
          <div className="error-boundary__panel">
            <p className="error-boundary__eyebrow">PayLater</p>
            <h1 className="error-boundary__title">Something went wrong</h1>
            <p className="error-boundary__description">
              An unexpected error occurred in the application. Please try reloading the
              page or contact support if the issue persists.
            </p>
            {this.state.error ? (
              <pre className="error-boundary__details">{this.state.error.toString()}</pre>
            ) : null}
            <button
              type="button"
              className="user-dashboard__retry"
              onClick={this.handleRetry}
            >
              Try Again
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
