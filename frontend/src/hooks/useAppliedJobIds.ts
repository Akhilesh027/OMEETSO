import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserAccessToken, isUserLoggedInSync } from "@/api/auth.api";
import { API_BASE } from "@/config/api";
import { fetchWithTimeout } from "@/lib/jobs";

export function useAppliedJobIds(): Set<string> {
  const token = getUserAccessToken();
  const client = useQueryClient();
  const queryKey = ["candidate-applied-job-ids", token];
  const { data } = useQuery({
    queryKey,
    enabled: isUserLoggedInSync(),
    staleTime: 30_000,
    queryFn: async () => {
      const response = await fetchWithTimeout(`${API_BASE}/jobs/candidate/applications`, { headers: { Authorization: `Bearer ${token}` } }, 8000);
      if (!response.ok) throw new Error("Could not load applications");
      const json = await response.json();
      if (!json.success || !Array.isArray(json.data)) throw new Error("Could not load applications");
      return json.data.filter((app: any) => app.status !== "WITHDRAWN").map((app: any) => String(app.jobId?._id || app.jobId?.id || app.jobId || app.job?.id || ""));
    },
  });
  useEffect(() => {
    const refresh = () => { void client.invalidateQueries({ queryKey: ["candidate-applied-job-ids"] }); };
    window.addEventListener("omeetso_job_application_submitted", refresh);
    window.addEventListener("omeetso_job_applications_changed", refresh);
    window.addEventListener("omeetso_auth_changed", refresh);
    return () => {
      window.removeEventListener("omeetso_job_application_submitted", refresh);
      window.removeEventListener("omeetso_job_applications_changed", refresh);
      window.removeEventListener("omeetso_auth_changed", refresh);
    };
  }, [client]);
  return new Set(data || []);
}
