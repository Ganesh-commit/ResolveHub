import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
export class ErrorBoundary extends Component {
    state = {
        hasError: false,
        error: null,
    };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Uncaught React UI error:', error, errorInfo);
    }
    handleReload = () => {
        window.location.reload();
    };
    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };
    render() {
        if (this.state.hasError) {
            return (<div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-8 h-8"/>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-heading">
                Something went wrong
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                An unexpected UI rendering error occurred. The application recovered safely instead of displaying a blank screen.
              </p>
            </div>

            {this.state.error?.message && (<div className="bg-slate-950 p-3 rounded-lg text-left text-xs font-mono text-rose-300 border border-slate-800 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>)}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button onClick={this.handleReload} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-rose-600/20">
                <RefreshCw className="w-4 h-4"/>
                Reload Page
              </button>
              <button onClick={this.handleReset} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-xl text-sm transition-all cursor-pointer">
                <Home className="w-4 h-4"/>
                Go to Home
              </button>
            </div>
          </div>
        </div>);
        }
        return this.props.children;
    }
}
