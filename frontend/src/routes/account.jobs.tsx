import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/account/jobs")({
  component: () => <Navigate to="/my/jobs" replace />,
});
