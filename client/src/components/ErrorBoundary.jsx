import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <div className="w-10 h-10 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] flex items-center justify-center mx-auto mb-4">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="#EF4444" strokeWidth="1.4"/>
                <path d="M8 5v3.5" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round"/>
                <circle cx="8" cy="11" r="0.75" fill="#EF4444"/>
              </svg>
            </div>
            <h2 className="text-[16px] font-semibold text-[#111111] mb-2">Something went wrong</h2>
            <p className="text-[13px] text-[#737373] mb-5 leading-relaxed">
              An unexpected error occurred. Please refresh the page to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="h-9 px-5 rounded-xl bg-[#111111] text-white text-[13px] font-medium hover:bg-[#333] transition-colors">
              Refresh page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;