import { createFileRoute } from "@tanstack/react-router";
import { LegalDocumentViewer } from "@/components/omeetso/LegalDocumentViewer";

export const Route = createFileRoute("/cookie-preferences")({
  head: () => ({
    meta: [
      { title: "Cookie & Tracking Policy — Omeetso Legal" },
      {
        name: "description",
        content:
          "Official Cookie and Tracking Technologies Policy of Omeetso. Learn how cookies, local storage, and analytics tokens are used.",
      },
      {
        property: "og:title",
        content: "Cookie & Tracking Policy — Omeetso Legal",
      },
      {
        property: "og:description",
        content: "Manage cookie choices and read the official tracking technologies policy on Omeetso.",
      },
    ],
  }),
  component: () => (
    <LegalDocumentViewer
      defaultSectionId="cookies"
      pageTitle="Cookie & Tracking Technologies Policy"
    />
  ),
});
