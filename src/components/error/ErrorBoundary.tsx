import * as React from 'react';
import { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught boundary error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      // Clear potentially corrupt localized storage keys or active session to reset to sanity
      sessionStorage.removeItem('nsn_active_streams');
      localStorage.removeItem('nsn969_live_statuses_cache');
    } catch (e) {
      console.error(e);
    }
    // Reload page
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070708] text-zinc-100 flex items-center justify-center p-6 font-sans select-none relative overflow-hidden">
          {/* Decorative ambient background blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/[0.04] filter blur-[150px] rounded-full pointer-events-none" />
          
          <div className="max-w-md w-full bg-[#0d0d11]/90 border border-red-550/20 rounded-2xl p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md relative z-10 space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center animate-pulse">
              <AlertOctagon className="w-8 h-8 text-red-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white tracking-wide uppercase">Sistem Mengalami Kendala</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Ada kesalahan runtime yang terdeteksi di portal. Tampilan portal telah diamankan agar tidak terjadi crash total pada web.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-black/55 border border-zinc-900 rounded-xl p-3.5 text-left font-mono text-[10px] text-zinc-550 overflow-x-auto max-h-36 scrollbar-thin">
                <span className="text-red-400 font-bold uppercase tracking-wider block mb-1">Error Logan:</span>
                {this.state.error.toString()}
                {this.state.errorInfo && (
                  <pre className="mt-2 text-[9px] text-zinc-600 opacity-80 whitespace-pre-wrap leading-normal">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="btn-error-reset"
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#e5a93c] hover:bg-[#d5992c] text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer font-bold"
              >
                <RotateCcw className="w-4 h-4" />
                Reset & Muat Ulang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
