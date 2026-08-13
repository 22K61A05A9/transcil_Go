import { Component, type ErrorInfo, type ReactNode } from 'react'

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
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#0a0f1d',
          color: '#f3f4f6',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '500px',
            backgroundColor: '#111827',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            border: '1px solid #1f2937'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>⚠️</div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '12px',
              color: '#f9fafb'
            }}>Something went wrong</h1>
            <p style={{
              fontSize: '15px',
              color: '#9ca3af',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              An unexpected error occurred in the application. Please try reloading the page or contact support if the issue persists.
            </p>
            {this.state.error && (
              <pre style={{
                textAlign: 'left',
                backgroundColor: '#1f2937',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#ef4444',
                overflowX: 'auto',
                marginBottom: '24px',
                maxWidth: '100%'
              }}>
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={this.handleRetry}
              style={{
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
