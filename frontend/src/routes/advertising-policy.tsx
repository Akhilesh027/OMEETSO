import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/omeetso/InfoPage";

export const Route = createFileRoute("/advertising-policy")({
  head: () => ({ meta: [
    { title: "Advertising Policy — Omeetso" },
    { name: "description", content: "The standards every advertisement on Omeetso must follow." },
    { property: "og:title", content: "Advertising Policy — Omeetso" },
    { property: "og:description", content: "Standards for advertisements." },
  ] }),
  component: () => (
    <InfoPage title="Advertising Policy" subtitle="Standards every campaign on Omeetso must meet.">
      <h2>Every advertisement must</h2>
      <ul>
        <li>Display a "Sponsored" or "Ad" label</li>
        <li>Identify the advertiser</li>
        <li>Have a clear, working call-to-action</li>
        <li>Never mimic organic content deceptively</li>
      </ul>
      <h2>Prohibited</h2>
      <ul>
        <li>Illegal or restricted goods and services</li>
        <li>Misleading claims or false urgency</li>
        <li>Autoplaying audio or flashing effects</li>
        <li>Overlapping essential navigation</li>
      </ul>
      <h2>Where ads never appear</h2>
      <ul>
        <li>Login, OTP, verification, payment forms</li>
        <li>Chat conversations and offer details</li>
        <li>Safety reporting and support tickets</li>
      </ul>
    </InfoPage>
  ),
});
