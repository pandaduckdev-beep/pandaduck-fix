import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] px-4">
          <div className="bg-white rounded-[28px] shadow-xl p-8 max-w-md w-full">
            <div className="flex flex-col items-center text-center">
              {/* Error Icon */}
              <div className="w-16 h-16 bg-[rgba(255,59,48,0.1)] rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-[#FF3B30]" />
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-[#1D1D1F] mb-2">
                오류가 발생했습니다
              </h1>

              {/* Message */}
              <p className="text-[#86868B] text-sm mb-6 leading-relaxed">
                죄송합니다. 예기치 않은 오류가 발생했습니다.
                <br />
                다시 시도해 주시기 바랍니다.
              </p>

              {/* Error Details (Development Only) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="w-full bg-[#F5F5F7] rounded-xl p-4 mb-6 text-left">
                  <p className="text-xs text-[#86868B] font-medium mb-1">Error Details:</p>
                  <p className="text-xs text-[#FF3B30] font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Retry Button */}
              <button
                onClick={this.handleReset}
                className="w-full bg-[#007AFF] hover:bg-[#0051D5] text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 btn-press"
              >
                <RefreshCw className="w-5 h-5" />
                다시 시도
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
