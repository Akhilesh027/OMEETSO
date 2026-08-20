import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/omeetso/InfoPage";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [
    { title: "Terms of Use — Omeetso" },
    { name: "description", content: "The terms of use that govern your access to and use of Omeetso." },
    { property: "og:title", content: "Terms of Use — Omeetso" },
    { property: "og:description", content: "Terms governing use of Omeetso." },
  ] }),
  component: () => (
    <InfoPage title="Terms of Use" subtitle="Last updated: 2026">
      <p>These placeholder terms describe the rules for using Omeetso. By accessing the service you agree to conduct trades honestly, follow local laws and respect other users.</p>
      <h2>Your account</h2>
      <ul>
        <li>Keep your login information private</li>
        <li>Provide accurate contact and location details</li>
        <li>Do not impersonate any other person or business</li>
      </ul>
      <h2>Listings</h2>
      <ul>
        <li>Post only items you legally own or are authorised to sell</li>
        <li>No prohibited or restricted items</li>
        <li>Accurate photos, descriptions and prices</li>
      </ul>
      <h2>Payments</h2>
      <p>Omeetso does not collect or hold payment between buyers and sellers. Meet in safe public places and inspect goods before transacting.</p>
    </InfoPage>
  ),
});
