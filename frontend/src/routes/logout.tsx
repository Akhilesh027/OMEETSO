import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { logout } from "@/lib/account";
import { LogOut, Loader2, PowerOff, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { PermanentLogoutModal } from "@/components/omeetso/account/PermanentLogoutModal";

export const Route = createFileRoute("/logout")({
  head: () => ({ meta: [{ title: "Log out — Omeetso" }] }),
  component: Logout,
});

function Logout() {
  const nav = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showPermanentModal, setShowPermanentModal] = useState(false);

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
      <div className="min-h-dvh bg-background p-6 pt-20 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-primary">
          <LogOut className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-lg font-extrabold text-foreground">Log out of Omeetso?</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          You’ll return to the sign-in screen. Your account, listings, and messages will remain active.
        </p>

        <div className="mt-6 space-y-2">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-rose-600 py-3 text-sm font-bold text-white hover:bg-rose-700 transition active:scale-98 disabled:opacity-60 cursor-pointer"
          >
            {isLoggingOut && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </button>
          <button
            onClick={() => nav({ to: "/account" })}
            disabled={isLoggingOut}
            className="w-full rounded-full border border-border py-3 text-sm font-semibold hover:bg-secondary transition active:scale-98 disabled:opacity-60 cursor-pointer"
          >
            Stay Logged In
          </button>
        </div>

        {/* Distinct Permanent Departure / Deactivation Section */}
        <div className="mt-8 rounded-3xl border border-amber-500/25 bg-amber-500/5 p-4 text-left space-y-2.5">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
            <ShieldAlert className="h-4 w-4" />
            <span>Leaving permanently?</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            If you wish to deactivate your profile, pause your listings, or permanently delete your account, you can submit an exit survey.
          </p>
          <button
            type="button"
            onClick={() => setShowPermanentModal(true)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 py-2.5 px-3 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 transition active:scale-98 cursor-pointer"
          >
            <PowerOff className="h-3.5 w-3.5" />
            <span>Permanent Logout / Deactivate Account</span>
          </button>
        </div>

        <PermanentLogoutModal
          open={showPermanentModal}
          onClose={() => setShowPermanentModal(false)}
        />
      </div>
    </MobileFrame>
  );
}

