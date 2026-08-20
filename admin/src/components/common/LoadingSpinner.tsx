import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingSpinner: React.FC<{
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}> = ({ size = "md", label, className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 space-y-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-[#3547D4] animate-spin`} />
      {label && <span className="text-xs text-[#64748B] font-medium">{label}</span>}
    </div>
  );
};
