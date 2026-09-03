import { createFileRoute } from "@tanstack/react-router";
import { LegalDocumentViewer } from "@/components/omeetso/LegalDocumentViewer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Omeetso Legal" },
      {
        name: "description",
        content:
          "Official Platform Terms of Use for Omeetso, operated by Digitalness Industries LLP. Governs access, listings, intermediary status, and advertising services.",
      },
      { property: "og:title", content: "Terms of Use — Omeetso Legal" },
      {
        property: "og:description",
        content:
          "Official Platform Terms of Use governing access to Omeetso marketplace and advertising services.",
      },
    ],
  }),
  component: () => <LegalDocumentViewer defaultSectionId="terms" pageTitle="Platform Terms of Use" />,
});
