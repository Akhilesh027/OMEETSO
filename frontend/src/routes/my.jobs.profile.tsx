import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/my/jobs/profile")({
  component: () => <Navigate to="/my/profile/jobs" replace />,
});
