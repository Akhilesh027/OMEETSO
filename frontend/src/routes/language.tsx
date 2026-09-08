import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";

export const Route = createFileRoute("/language")({
  head: () => ({
    meta: [
      { title: "Omeetso — Local Marketplace" },
    ],
  }),
  component: LanguageRedirect,
});

function LanguageRedirect() {
  const nav = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("omeetso_language", "en");
    }
    const onboarded = typeof window !== "undefined" && localStorage.getItem("omeetso_onboarded");
    nav({ to: onboarded ? "/home" : "/onboarding", replace: true });
  }, [nav]);

  return (
    <MobileFrame>
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    </MobileFrame>
  );
}
