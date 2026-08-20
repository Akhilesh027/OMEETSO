import { createFileRoute } from "@tanstack/react-router";
import Invoices from "./invoices.wallet";

export const Route = createFileRoute("/invoices")({
  head: () => ({ meta: [{ title: "Invoices — Omeetso" }] }),
  component: Invoices,
});
