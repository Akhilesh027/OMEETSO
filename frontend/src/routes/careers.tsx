import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/omeetso/InfoPage";

export const Route = createFileRoute("/careers")({
  head: () => ({ meta: [
    { title: "Careers at Omeetso" },
    { name: "description", content: "Join Omeetso and help build India's hyperlocal marketplace." },
    { property: "og:title", content: "Careers at Omeetso" },
    { property: "og:description", content: "Build with us." },
  ] }),
  component: () => (
    <InfoPage title="Careers" subtitle="Help us build the trusted hyperlocal marketplace for India.">
      <p>We're a small, focused team based in Hyderabad. We hire across engineering, design, product, operations and trust & safety.</p>
      <h2>Open roles</h2>
      <ul>
        <li>Full-stack Engineer (Web)</li>
        <li>Mobile Engineer (React Native)</li>
        <li>Trust & Safety Analyst</li>
        <li>Product Designer</li>
      </ul>
      <p>Send your resume and a note about what you'd like to build to careers@omeetso.example.</p>
    </InfoPage>
  ),
});
