import { createFileRoute } from "@tanstack/react-router";
import Credits from "./credits.wallet";

export const Route = createFileRoute("/wallet/credits")({
  head: () => ({ meta: [{ title: "Promotional credits — Omeetso" }] }),
  component: Credits,
});
