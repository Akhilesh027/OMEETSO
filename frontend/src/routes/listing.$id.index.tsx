import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/listing/$id/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/product/$id",
      params: { id: params.id },
      replace: true,
    });
  },
  component: () => null,
});
