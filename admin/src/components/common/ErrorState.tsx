import React from "react";
import { AlertOctagon, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  errorId?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
  errorId,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white rounded-2xl border border-red-100 shadow-sm my-4">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 text-[#DC3545] mb-4">
        <AlertOctagon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-[#111827]">{title}</h3>
      <p className="text-xs text-[#64748B] max-w-md mt-1 mb-2 leading-relaxed">{message}</p>
      {errorId && (
        <code className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded mb-6">
          Ref ID: {errorId}
        </code>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#E2E8F0] bg-white text-[#111827] hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#DC3545] text-white hover:bg-red-700 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
};
