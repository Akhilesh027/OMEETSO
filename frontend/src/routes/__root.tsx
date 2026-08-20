import { QueryClient } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { reportLovableError } from "../lib/lovable-error-reporting";
import { WebsiteHeader } from "../components/omeetso/WebsiteHeader";
import { WebsiteFooter } from "../components/omeetso/WebsiteFooter";
import { ChatProvider } from "../contexts/ChatProvider";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-black text-navy">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist on Omeetso.</p>
        <Link to="/home" className="mt-6 inline-flex items-center justify-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white">Back to Home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try again or head home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white">Try again</button>
          <a href="/home" className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const v = (localStorage.getItem("omeetso_appearance") ?? "system").replace(/"/g, "") as "system" | "light" | "dark";
      const dark = v === "dark" || (v === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", !!dark);
    } catch { /* ignore */ }
  }, []);
  return (
    <ChatProvider>
      <WebsiteHeader />
      <Outlet />
      <WebsiteFooter />
    </ChatProvider>
  );
}

