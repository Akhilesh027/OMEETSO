import { createFileRoute } from "@tanstack/react-router";
import Txns from "./transactions.wallet";

export const Route = createFileRoute("/wallet/transactions")({
  head: () => ({ meta: [{ title: "Wallet transactions — Omeetso" }] }),
  component: Txns,
});
