import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { logoutMock } from "@/lib/account";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/logout")({
  head: () => ({ meta: [{ title: "Log out — Omeetso" }] }),
  component: Logout,
});

function Logout() {
  const nav = useNavigate();
  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background p-6 pt-24 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-primary">
          <LogOut className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-lg font-extrabold">Log out of Omeetso?</h1>
        <p className="mt-1 text-xs text-muted-foreground">You’ll return to the welcome screen. Language and appearance preferences will stay.</p>
        <div className="mt-6 space-y-2">
          <button onClick={() => { logoutMock(); toast.success("Logged out"); nav({ to: "/login" }); }}
            className="w-full rounded-full bg-rose-600 py-3 text-sm font-bold text-white">Log Out</button>
          <button onClick={() => nav({ to: "/account" })}
            className="w-full rounded-full border border-border py-3 text-sm font-semibold">Stay Logged In</button>
        </div>
      </div>
    </MobileFrame>
  );
}
