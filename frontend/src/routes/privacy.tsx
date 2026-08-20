import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/omeetso/InfoPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [
    { title: "Privacy Policy — Omeetso" },
    { name: "description", content: "How Omeetso collects, uses and protects your personal information." },
    { property: "og:title", content: "Privacy Policy — Omeetso" },
    { property: "og:description", content: "How we handle your data." },
  ] }),
  component: () => (
    <InfoPage title="Privacy Policy" subtitle="Last updated: 2026">
      <h2>Information we collect</h2>
      <ul>
        <li>Account details (name, mobile, email)</li>
        <li>Location information you provide (pincode, area)</li>
        <li>Listings, chats and offers you post on Omeetso</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>Show relevant local listings and stores</li>
        <li>Connect buyers with sellers</li>
        <li>Prevent fraud and keep the marketplace safe</li>
      </ul>
      <h2>Your controls</h2>
      <p>Manage your visibility, notifications, ad preferences and account deletion in Settings.</p>
    </InfoPage>
  ),
});
