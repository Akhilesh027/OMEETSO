import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Loader2, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info" | "loading";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  onUndo?: () => void;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => string;
  removeToast: (id: string) => void;
  showSuccess: (title: string, description?: string) => string;
  showError: (title: string, description?: string) => string;
  showWarning: (title: string, description?: string) => string;
  showInfo: (title: string, description?: string) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastMessage, "id">) => {
      const id = `TOAST-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastMessage = { ...toast, id };

      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Stack up to 5

      if (toast.type !== "loading" && toast.duration !== 0) {
        const timeout = toast.duration || 4000;
        setTimeout(() => {
          removeToast(id);
        }, timeout);
      }

      return id;
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (title: string, description?: string) => addToast({ type: "success", title, description }),
    [addToast]
  );

  const showError = useCallback(
    (title: string, description?: string) => addToast({ type: "error", title, description }),
    [addToast]
  );

  const showWarning = useCallback(
    (title: string, description?: string) => addToast({ type: "warning", title, description }),
    [addToast]
  );

  const showInfo = useCallback(
    (title: string, description?: string) => addToast({ type: "info", title, description }),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-4"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: ToastMessage;
  onDismiss: () => void;
}> = ({ toast, onDismiss }) => {
  const [isPaused, setIsPaused] = useState(false);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-[#16A36A] shrink-0" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-[#DC3545] shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0" />;
      case "info":
        return <Info className="w-5 h-5 text-[#2563EB] shrink-0" />;
      case "loading":
        return <Loader2 className="w-5 h-5 text-[#3547D4] animate-spin shrink-0" />;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="pointer-events-auto flex items-start space-x-3 p-3.5 bg-white rounded-xl shadow-lg border border-[#E2E8F0] transition-all duration-200 animate-in slide-in-from-bottom-3"
    >
      {getIcon()}
      <div className="flex-1 min-w-0 pr-2">
        <h4 className="text-xs font-semibold text-[#111827]">{toast.title}</h4>
        {toast.description && (
          <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{toast.description}</p>
        )}
        {toast.onUndo && (
          <button
            onClick={() => {
              toast.onUndo?.();
              onDismiss();
            }}
            className="mt-1.5 text-xs font-semibold text-[#3547D4] hover:underline focus:outline-none"
          >
            Undo action
          </button>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="text-[#64748B] hover:text-[#111827] p-1 rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
