import type { ToastMessage } from '../lib/useToast';

interface ToastContainerProps {
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
}

export function ToastContainer({ toasts, dismissToast }: ToastContainerProps) {
  if (!toasts.length) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-lg"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-900">{toast.message}</p>
            <button
              type="button"
              className="text-xs text-slate-500 hover:text-slate-900"
              onClick={() => dismissToast(toast.id)}
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
