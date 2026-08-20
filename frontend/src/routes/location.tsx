import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LocationModal } from "@/components/omeetso/LocationModal";

export const Route = createFileRoute("/location")({
  component: LocationScreen,
  head: () => ({
    meta: [
      { title: "Set Your Location — Omeetso" },
      {
        name: "description",
        content: "Choose your area or pincode to see nearby deals, verified sellers and stores on Omeetso.",
      },
    ],
  }),
});

function LocationScreen() {
  const nav = useNavigate();
  return (
    <LocationModal
      open={true}
      onClose={() => nav({ to: "/home" })}
      onSelect={() => nav({ to: "/home" })}
    />
  );
}
