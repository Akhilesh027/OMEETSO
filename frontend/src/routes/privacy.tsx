import { createFileRoute } from "@tanstack/react-router";
import { LegalDocumentViewer } from "@/components/omeetso/LegalDocumentViewer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Omeetso Legal" },
      {
        name: "description",
        content:
          "Official Privacy Policy of Omeetso under DPDP Act 2023. Explains data collection, lawful processing, retention schedules, and user rights.",
      },
      { property: "og:title", content: "Privacy Policy — Omeetso Legal" },
      {
        property: "og:description",
        content:
          "Learn how Omeetso protects your privacy, collects information, and enforces data rights under Indian data protection laws.",
      },
    ],
  }),
  component: () => <LegalDocumentViewer defaultSectionId="privacy" pageTitle="Privacy Policy" />,
});
