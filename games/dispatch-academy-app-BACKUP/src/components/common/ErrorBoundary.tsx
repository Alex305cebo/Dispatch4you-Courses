import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  /** Custom fallback UI. If not provided, a default error screen is shown. */
  fallback?: ReactNode;
  /** Content to render when there's no error */
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component that catches rendering errors in its subtree.
 * Used both at the top-level (wrapping the whole app) and per-route for isolation.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
          role="alert"
        >
          <h1 className="text-2xl font-bold text-white mb-4">
            Что-то пошло не так
          </h1>
          <p className="text-[#e2e8f0] mb-2 max-w-md">
            Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу.
          </p>
          {this.state.error && (
            <p className="text-sm text-[#94a3b8] mb-6 max-w-md break-words">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleReset}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors min-w-[44px] min-h-[44px]"
          >
            Повторить
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
