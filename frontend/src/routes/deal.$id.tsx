import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/deal/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/product/$id",
      params: { id: params.id },
      replace: true,
    });
  },
  component: () => null,
});
