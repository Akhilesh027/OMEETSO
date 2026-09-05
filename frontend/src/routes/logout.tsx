import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { logout } from "@/lib/account";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/logout")({
  head: () => ({ meta: [{ title: "Log out — Omeetso" }] }),
  component: Logout,
});

function Logout() {
  const nav = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Logged out successfully");
      nav({ to: "/login" });
    } catch {
      toast.success("Logged out");
      nav({ to: "/login" });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background p-6 pt-24 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-primary">
          <LogOut className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-lg font-extrabold">Log out of Omeetso?</h1>
        <p className="mt-1 text-xs text-muted-foreground">You’ll return to the welcome screen. Language and appearance preferences will stay.</p>
        <div className="mt-6 space-y-2">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-rose-600 py-3 text-sm font-bold text-white hover:bg-rose-700 transition disabled:opacity-60"
          >
            {isLoggingOut && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </button>
          <button
            onClick={() => nav({ to: "/account" })}
            disabled={isLoggingOut}
            className="w-full rounded-full border border-border py-3 text-sm font-semibold hover:bg-secondary transition disabled:opacity-60"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}

