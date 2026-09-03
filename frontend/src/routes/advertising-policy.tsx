import { createFileRoute } from "@tanstack/react-router";
import { LegalDocumentViewer } from "@/components/omeetso/LegalDocumentViewer";

export const Route = createFileRoute("/advertising-policy")({
  head: () => ({
    meta: [
      { title: "Advertising, Payment & Refund Policy — Omeetso Legal" },
      {
        name: "description",
        content:
          "Official policy governing advertising purchases, visibility boosts, payment processing, chargebacks, and refund eligibility on Omeetso.",
      },
      {
        property: "og:title",
        content: "Advertising & Refund Policy — Omeetso Legal",
      },
      {
        property: "og:description",
        content: "Rules for advertising services, refunds, and zero-escrow disclaimers on Omeetso.",
      },
    ],
  }),
  component: () => (
    <LegalDocumentViewer
      defaultSectionId="advertising-refund"
      pageTitle="Advertising, Payment & Refund Policy"
    />
  ),
});
