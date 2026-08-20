import { createFileRoute } from "@tanstack/react-router";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { PostJobForm } from "@/components/omeetso/jobs/PostJobForm";

export const Route = createFileRoute("/jobs/new")({
  head: () => ({
    meta: [
      { title: "Post a Job · Omeetso Jobs" },
      { name: "description", content: "Post a job opening and reach thousands of local job seekers on Omeetso." },
    ],
  }),
  component: NewJobPage,
});

function NewJobPage() {
  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-20 md:pb-16 font-sans">
        <PostJobForm />
      </div>
    </MobileFrame>
  );
}
