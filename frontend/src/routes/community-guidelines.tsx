import { createFileRoute } from "@tanstack/react-router";
import { LegalDocumentViewer } from "@/components/omeetso/LegalDocumentViewer";

export const Route = createFileRoute("/community-guidelines")({
  head: () => ({
    meta: [
      { title: "Community Standards & Safety — Omeetso Legal" },
      {
        name: "description",
        content:
          "Official Community Standards and Prohibited Content rules that keep Omeetso safe, respectful, and legally compliant.",
      },
      { property: "og:title", content: "Community Standards — Omeetso Legal" },
      {
        property: "og:description",
        content: "Community guidelines, safe trading practices, and enforcement framework on Omeetso.",
      },
    ],
  }),
  component: () => (
    <LegalDocumentViewer
      defaultSectionId="community-standards"
      pageTitle="Community Standards & Enforcement"
    />
  ),
});
