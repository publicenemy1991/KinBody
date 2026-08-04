import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  declare props: Props;
  declare state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0D0E12] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-xs text-zinc-400 max-w-sm mb-6">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={this.handleReload}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
            <button
              onClick={this.handleResetStorage}
              className="bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-semibold px-5 py-3 rounded-xl transition-all"
            >
              Reset App Cache
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
