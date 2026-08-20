import React, { useState, useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export const OfflineState: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#DC3545] text-white px-4 py-2 text-center text-xs font-semibold flex items-center justify-center space-x-2 shadow-md">
      <WifiOff className="w-4 h-4 animate-bounce" />
      <span>You are currently offline. Local changes will be synced once connection is restored.</span>
      <button
        onClick={() => window.location.reload()}
        className="ml-2 underline hover:text-slate-200 inline-flex items-center space-x-1"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Check connection</span>
      </button>
    </div>
  );
};
