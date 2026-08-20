import { createFileRoute } from "@tanstack/react-router";
import AddMoney from "./add.wallet";

export const Route = createFileRoute("/wallet/add")({
  head: () => ({ meta: [{ title: "Add money to Wallet — Omeetso" }] }),
  component: AddMoney,
});
