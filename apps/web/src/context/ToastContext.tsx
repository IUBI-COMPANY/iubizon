"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastVariant = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Config per variant ───────────────────────────────────────────────────────

const CONFIG: Record<
  ToastVariant,
  { wrapper: string; icon: React.ReactNode; titleColor: string }
> = {
  success: {
    wrapper: "bg-green-50 border border-green-200",
    icon: <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />,
    titleColor: "text-green-700",
  },
  error: {
    wrapper: "bg-red-50 border border-red-200",
    icon: <XCircle className="w-5 h-5 text-red-500 shrink-0" />,
    titleColor: "text-red-600",
  },
  info: {
    wrapper: "bg-blue-50 border border-blue-200",
    icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
    titleColor: "text-blue-700",
  },
  warning: {
    wrapper: "bg-yellow-50 border border-yellow-200",
    icon: <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />,
    titleColor: "text-yellow-700",
  },
};

// ─── Single Toast Item ────────────────────────────────────────────────────────

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const [exiting, setExiting] = React.useState(false);
  const { wrapper, icon, titleColor } = CONFIG[toast.variant];

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  }, [onDismiss, toast.id]);

  React.useEffect(() => {
    const t = setTimeout(dismiss, toast.duration ?? 5000);
    return () => clearTimeout(t);
  }, [dismiss, toast.duration]);

  return (
    <div
      role="alert"
      style={{
        transition: "opacity 300ms, transform 300ms",
        opacity: exiting ? 0 : 1,
        transform: exiting ? "translateX(24px)" : "translateX(0)",
      }}
      className={`flex items-start gap-3 w-full max-w-sm rounded-2xl px-4 py-3.5 shadow-lg ${wrapper}`}
    >
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`text-sm font-bold leading-snug ${titleColor}`}>
            {toast.title}
          </p>
        )}
        <p className="text-sm text-[#475569] leading-snug mt-0.5">
          {toast.message}
        </p>
      </div>
      <button
        onClick={dismiss}
        className="shrink-0 text-[#94a3b8] hover:text-[#475569] transition-colors mt-0.5"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((opts: Omit<Toast, "id">) => {
    const id = `toast-${++counterRef.current}`;
    setToasts((prev) => [...prev, { ...opts, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ctx: ToastContextValue = {
    toast: addToast,
    success: (message, title) =>
      addToast({ variant: "success", message, title }),
    error: (message, title) => addToast({ variant: "error", message, title }),
    info: (message, title) => addToast({ variant: "info", message, title }),
    warning: (message, title) =>
      addToast({ variant: "warning", message, title }),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {/* Toast Container — fixed top-right */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
