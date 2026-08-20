import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/omeetso/InfoPage";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About Omeetso — Buy Nearby. Sell Quickly." },
    { name: "description", content: "Omeetso is India's hyperlocal marketplace connecting buyers, sellers and local stores." },
    { property: "og:title", content: "About Omeetso" },
    { property: "og:description", content: "India's hyperlocal marketplace." },
  ] }),
  component: () => (
    <InfoPage title="About Omeetso" subtitle="Buy Nearby. Sell Quickly.">
      <p>Omeetso is a hyperlocal marketplace that connects Indian buyers with individual sellers, local businesses and verified stores across their neighbourhood — so trades happen fast, safely and close to home.</p>
      <h2>Our mission</h2>
      <p>Empower every neighbourhood in India with a trusted way to discover and trade — from cars and mobiles to furniture, appliances, jobs and services.</p>
      <h2>What we support</h2>
      <ul>
        <li>Individual sellers posting listings in minutes</li>
        <li>Local stores building a digital presence</li>
        <li>Buyers negotiating directly with verified sellers</li>
        <li>Safe, hyperlocal discovery</li>
      </ul>
    </InfoPage>
  ),
});
