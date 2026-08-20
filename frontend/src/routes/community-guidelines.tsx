import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/omeetso/InfoPage";

export const Route = createFileRoute("/community-guidelines")({
  head: () => ({ meta: [
    { title: "Community Guidelines — Omeetso" },
    { name: "description", content: "The rules that keep Omeetso safe, respectful and trustworthy." },
    { property: "og:title", content: "Community Guidelines — Omeetso" },
    { property: "og:description", content: "Rules for the Omeetso community." },
  ] }),
  component: () => (
    <InfoPage title="Community Guidelines" subtitle="Keep Omeetso safe, respectful and trustworthy.">
      <h2>Be honest</h2>
      <ul>
        <li>Post accurate photos and descriptions</li>
        <li>Set fair, transparent prices</li>
        <li>Deliver what you promised</li>
      </ul>
      <h2>Be respectful</h2>
      <ul>
        <li>No harassment, hate speech or abuse</li>
        <li>No spam, scams or duplicate listings</li>
      </ul>
      <h2>Stay safe</h2>
      <ul>
        <li>Meet in public places</li>
        <li>Never share your OTP, UPI PIN or banking password</li>
        <li>Report suspicious activity from the Safety Centre</li>
      </ul>
    </InfoPage>
  ),
});
