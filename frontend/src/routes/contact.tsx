import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/omeetso/InfoPage";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact Omeetso" },
    { name: "description", content: "Get in touch with the Omeetso team for support, business or press enquiries." },
    { property: "og:title", content: "Contact Omeetso" },
    { property: "og:description", content: "Reach the Omeetso team." },
  ] }),
  component: () => (
    <InfoPage title="Contact Us" subtitle="We usually respond within one business day.">
      <h2>Support</h2>
      <p>For account, listing or safety help, visit the Help Centre or raise a support ticket from your account.</p>
      <h2>Business enquiries</h2>
      <ul>
        <li>Business partnerships: partners@omeetso.example</li>
        <li>Advertising: ads@omeetso.example</li>
        <li>Press: press@omeetso.example</li>
      </ul>
      <h2>Office</h2>
      <p>Hyderabad, Telangana, India</p>
    </InfoPage>
  ),
});
