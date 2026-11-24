import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let readable = error.message;
    try {
      const parsed = JSON.parse(error.message) as {
        error?: string;
        operationType?: string;
        path?: string;
      };
      if (parsed?.error) {
        readable = `خطأ في قاعدة البيانات (${parsed.operationType ?? 'operation'}): ${parsed.error}`;
      }
    } catch {
      // استخدام رسالة الخطأ الأصلية
    }
    return { hasError: true, message: readable };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="flex min-h-screen items-center justify-center bg-[#0A0A0C] p-6 text-zinc-100"
        >
          <div className="max-w-md w-full rounded-2xl border border-rose-500/30 bg-[#121216] p-6 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-lg font-bold text-white">حدث خطأ غير متوقع</h1>
            <p className="text-xs leading-relaxed text-zinc-400 break-words">
              {this.state.message || 'يرجى إعادة تحميل الصفحة والمحاولة مجدداً.'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded-xl gold-gradient-bg px-5 py-2.5 text-sm font-bold text-[#0A0A0C]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>إعادة تحميل الصفحة</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
