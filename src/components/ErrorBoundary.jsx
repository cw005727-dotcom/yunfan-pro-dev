import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">组件渲染崩溃</h2>
          <p className="text-slate-500 max-w-md mb-8">云帆引擎检测到界面异常，已自动隔离故障模块以保护核心系统。</p>
          <div className="bg-slate-900 rounded-2xl p-6 text-left w-full max-w-2xl overflow-auto mb-8">
            <code className="text-rose-400 text-[11px] whitespace-nowrap font-mono break-all">
              {this.state.error?.toString()}
            </code>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
          >
            重启工作空间
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
