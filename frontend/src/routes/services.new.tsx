import { createFileRoute } from "@tanstack/react-router";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { PostServiceForm } from "@/components/omeetso/services/PostServiceForm";

export const Route = createFileRoute("/services/new")({
  head: () => ({
    meta: [
      { title: "List a Service · Omeetso Services" },
      { name: "description", content: "Publish your home or professional service offering to nearby customers on Omeetso." },
    ],
  }),
  component: NewServicePage,
});

function NewServicePage() {
  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-20 md:pb-16 font-sans">
        <PostServiceForm />
      </div>
    </MobileFrame>
  );
}
