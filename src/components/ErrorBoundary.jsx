import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative z-50">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl max-w-md w-full border border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>

                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                Something went wrong
                            </h2>

                            <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-lg w-full overflow-auto text-left max-h-40">
                                <p className="text-xs font-mono text-red-500 break-words">
                                    {this.state.error && this.state.error.toString()}
                                </p>
                            </div>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                The application encountered an unexpected error. Please try reloading the page.
                            </p>

                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors w-full justify-center"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
