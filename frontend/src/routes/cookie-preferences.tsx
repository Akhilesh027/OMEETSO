import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/omeetso/InfoPage";

export const Route = createFileRoute("/cookie-preferences")({
  head: () => ({ meta: [
    { title: "Cookie Preferences — Omeetso" },
    { name: "description", content: "Control how Omeetso uses cookies and similar technologies." },
    { property: "og:title", content: "Cookie Preferences — Omeetso" },
    { property: "og:description", content: "Manage cookies on Omeetso." },
  ] }),
  component: () => (
    <InfoPage title="Cookie Preferences" subtitle="Control how Omeetso uses cookies.">
      <p>Omeetso uses cookies and local storage to keep you signed in, remember your location, and improve recommendations. You can manage most preferences directly in your browser.</p>
      <h2>Categories</h2>
      <ul>
        <li><strong>Essential</strong> — required for login, sessions and security. Always on.</li>
        <li><strong>Preferences</strong> — remember language, theme and saved locations.</li>
        <li><strong>Analytics</strong> — help us understand which features work best.</li>
        <li><strong>Advertising</strong> — personalise ads. Manage in Settings → Ad Preferences.</li>
      </ul>
    </InfoPage>
  ),
});
