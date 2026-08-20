import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function InfoPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl px-6 py-10 md:py-16">
      <nav className="mb-6 text-xs text-muted-foreground">
        <Link to="/home" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{title}</span>
      </nav>
      <h1 className="text-3xl font-black tracking-tight md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-3 text-base text-muted-foreground">{subtitle}</p>}
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul_li]:text-muted-foreground">
        {children}
      </div>
    </main>
  );
}
