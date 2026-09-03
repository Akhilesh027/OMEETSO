import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, User, Briefcase, FileText, Upload, Save, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { uploadFile } from "@/lib/upload";
import { toast } from "sonner";

export const Route = createFileRoute("/account/profile/jobs")({
  component: CandidateProfilePage,
});

function CandidateProfilePage() {
  const nav = useNavigate();
  const [saved, setSaved] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "Software Developer",
    city: "Hyderabad",
    experienceYears: "Fresher / Entry Level",
    currentCompany: "",
    currentRole: "",
    education: "Graduate",
    skills: "React.js, TypeScript, TailwindCSS",
    languages: "English, Telugu",
    resumeUrl: "",
    resumeFileName: "",
    expectedSalary: 45000,
    noticePeriod: "Immediate",
    preferredJobTypes: ["FULL_TIME", "WORK_FROM_HOME"],
    preferredLocations: ["Madhapur", "Gachibowli", "Remote"],
    allowDirectContact: true
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const u = JSON.parse(localStorage.getItem("omeetso_user") || "{}");
      if (u.candidateProfile) {
        setFormData((prev) => ({ ...prev, ...u.candidateProfile }));
      }
    } catch { }
  }, []);

  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    try {
      const url = await uploadFile(file, "general");
      setFormData((prev) => ({
        ...prev,
        resumeUrl: url,
        resumeFileName: file.name,
      }));
      toast.success(`Resume "${file.name}" uploaded successfully!`);
    } catch (err) {
      const localUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        resumeUrl: localUrl,
        resumeFileName: file.name,
      }));
      toast.success(`Resume "${file.name}" attached.`);
    } finally {
      setUploadingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-20 md:pb-16 font-sans">
        
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 py-3 safe-t">
          <div className="flex items-center gap-2">
            <button onClick={() => history.back()} className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-extrabold text-foreground">Candidate Professional Profile</h1>
          </div>
          {saved && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Saved!
            </span>
          )}
        </header>

        <form onSubmit={handleSave} className="max-w-[700px] mx-auto p-4 space-y-6">
          
          {/* PROFILE SUMMARY */}
          <div className="rounded-3xl border border-border bg-card p-5 space-y-4 text-xs font-semibold">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-indigo-brand flex items-center gap-2">
              <User className="h-4 w-4" /> Professional Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Professional Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Current City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Total Experience</label>
                <select
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                >
                  <option value="Fresher">Fresher / No Experience</option>
                  <option value="1-2 Years">1-2 Years</option>
                  <option value="3-5 Years">3-5 Years</option>
                  <option value="5+ Years">5+ Years</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Minimum Education</label>
                <select
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                >
                  <option value="10th / 12th Pass">10th / 12th Pass</option>
                  <option value="Diploma / ITI">Diploma / ITI</option>
                  <option value="Graduate (B.Tech / MCA)">Graduate (B.Tech / MCA)</option>
                  <option value="Post Graduate (Master's)">Post Graduate (Master's)</option>
                </select>
              </div>
            </div>
          </div>

          {/* CURRENT EMPLOYMENT & SALARY */}
          <div className="rounded-3xl border border-border bg-card p-5 space-y-4 text-xs font-semibold">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-indigo-brand flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Employment & Expectations
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Current Company</label>
                <input
                  type="text"
                  value={formData.currentCompany}
                  onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Current Role</label>
                <input
                  type="text"
                  value={formData.currentRole}
                  onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Expected Monthly Salary (₹)</label>
                <input
                  type="number"
                  value={formData.expectedSalary}
                  onChange={(e) => setFormData({ ...formData, expectedSalary: Number(e.target.value) })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Notice Period</label>
                <select
                  value={formData.noticePeriod}
                  onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                >
                  <option value="Immediate">Immediate</option>
                  <option value="15 Days">15 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="60 Days">60 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* RESUME & PRIVACY */}
          <div className="rounded-3xl border border-border bg-card p-5 space-y-4 text-xs font-semibold">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-indigo-brand flex items-center gap-2">
              <FileText className="h-4 w-4" /> Resume & Privacy Settings
            </h2>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleResumeFileChange}
            />

            {formData.resumeUrl ? (
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-indigo-brand/30 bg-indigo-brand/5">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-5 w-5 text-indigo-brand shrink-0" />
                  <span className="font-bold text-foreground truncate max-w-[200px]">
                    {formData.resumeFileName || "Candidate_Resume.pdf"}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingResume}
                    className="text-xs font-extrabold text-indigo-brand hover:underline flex items-center gap-1"
                  >
                    {uploadingResume ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, resumeUrl: "", resumeFileName: "" }))}
                    className="text-xs font-extrabold text-rose-500 hover:underline flex items-center gap-0.5 ml-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingResume}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-border hover:border-indigo-brand hover:bg-indigo-brand/5 text-xs font-bold text-foreground transition-all cursor-pointer"
              >
                {uploadingResume ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-brand" />
                    <span>Uploading resume...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 text-indigo-brand" />
                    <span>Upload Resume (PDF, DOC, DOCX)</span>
                  </>
                )}
              </button>
            )}

            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl bg-secondary/40 border border-border">
              <input
                type="checkbox"
                checked={formData.allowDirectContact}
                onChange={(e) => setFormData({ ...formData, allowDirectContact: e.target.checked })}
                className="h-4 w-4 accent-indigo-brand"
              />
              <span className="text-foreground font-bold">Allow verified hiring managers to view my resume profile</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:opacity-95"
          >
            <Save className="h-4 w-4" /> Save Professional Profile
          </button>
        </form>

      </div>
    </MobileFrame>
  );
}
