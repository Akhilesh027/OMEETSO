import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/account/employer/jobs")({
  component: () => <Navigate to="/my/employer/jobs" replace />,
});
