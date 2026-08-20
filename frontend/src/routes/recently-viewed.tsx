import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/recently-viewed")({
  beforeLoad: () => { throw redirect({ to: "/saved" }); },
});
