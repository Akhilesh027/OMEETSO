import { Component, type ReactNode } from "react";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, errorId: null };

  static getDerivedStateFromError(error: Error): State {
    return {
      error,
      errorId: `ERR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    };
  }

  componentDidCatch(err: Error, errorInfo: any) {
    console.error("Admin Console ErrorBoundary caught an error:", err, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/admin/dashboard";
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen grid place-items-center bg-[#F5F7FC] p-6 text-[#111827]">
        <div className="max-w-lg w-full rounded-2xl bg-white border border-red-100 p-6 shadow-xl text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 text-[#DC3545]">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#111827]">Application Unexpected Error</h1>
            <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
              An unhandled exception occurred in the admin interface.
            </p>
            {this.state.errorId && (
              <p className="mt-2 text-[10px] font-mono text-slate-400 bg-slate-50 py-1 px-2 rounded inline-block">
                Error Reference: {this.state.errorId}
              </p>
            )}
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left overflow-auto max-h-32">
            <code className="text-xs text-red-600 font-mono">{this.state.error.message}</code>
          </div>
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={this.handleGoHome}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-[#E2E8F0] bg-white text-[#111827] hover:bg-slate-50 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Dashboard</span>
            </button>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
