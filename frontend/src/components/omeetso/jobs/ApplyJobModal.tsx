import React, { useState } from "react";
import { X, CheckCircle2, ArrowRight, ArrowLeft, Upload, FileText, ShieldAlert } from "lucide-react";
import { JobItem, submitJobApplicationLocal } from "@/lib/jobs";

interface ApplyJobModalProps {
  job: JobItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApplyJobModal({ job, isOpen, onClose, onSuccess }: ApplyJobModalProps) {
  const [step, setStep] = useState<"form" | "screening" | "review" | "success">("form");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "User",
    phone: "+91 9876543210",
    email: "user@example.com",
    city: "Hyderabad",
    experience: job.candidateCriteria.experience || "2 Years",
    currentRole: "Software Developer",
    currentCompany: "Tech Corp",
    currentSalary: 35000,
    expectedSalary: 45000,
    noticePeriod: "15 Days",
    resumeUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  });

  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleScreeningAnswerChange = (q: string, val: string) => {
    setScreeningAnswers((prev) => ({ ...prev, [q]: val }));
  };

  const handleNextStep = () => {
    if (step === "form") {
      if (job.screeningQuestions && job.screeningQuestions.length > 0) {
        setStep("screening");
      } else {
        setStep("review");
      }
    } else if (step === "screening") {
      setStep("review");
    }
  };

  const handleSubmitFinal = async () => {
    setLoading(true);
    try {
      submitJobApplicationLocal({
        jobId: job.id,
        employerId: job.employerId,
        job: { title: job.title, companyName: job.companyName, location: job.location, salary: job.salary },
        applicantProfileSnapshot: formData,
        screeningAnswers: Object.entries(screeningAnswers).map(([question, answer]) => ({ question, answer }))
      });
      setLoading(false);
      setStep("success");
      onSuccess();
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm safe-t">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-lg font-black text-foreground">Apply for {job.title}</h2>
            <p className="text-xs text-muted-foreground font-semibold">{job.companyName} • {job.location.city}</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Safety Warning */}
        <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl text-[11px] font-bold text-amber-800">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <span>Never pay money for job applications or interview fees. Omeetso employers never ask for registration fees.</span>
        </div>

        {/* STEP 1: APPLICANT FORM */}
        {step === "form" && (
          <div className="space-y-4 text-xs font-semibold">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-indigo-brand">1. Candidate Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">Mobile Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">Current City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1">Total Experience</label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                >
                  <option value="Fresher">Fresher / No Experience</option>
                  <option value="1-2 Years">1-2 Years</option>
                  <option value="3-5 Years">3-5 Years</option>
                  <option value="5+ Years">5+ Years</option>
                </select>
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">Notice Period</label>
                <select
                  value={formData.noticePeriod}
                  onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                >
                  <option value="Immediate">Immediate</option>
                  <option value="15 Days">15 Days</option>
                  <option value="30 Days">30 Days</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1">Current Salary (₹/Mo)</label>
                <input
                  type="number"
                  value={formData.currentSalary}
                  onChange={(e) => setFormData({ ...formData, currentSalary: Number(e.target.value) })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">Expected Salary (₹/Mo)</label>
                <input
                  type="number"
                  value={formData.expectedSalary}
                  onChange={(e) => setFormData({ ...formData, expectedSalary: Number(e.target.value) })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                />
              </div>
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">Attached Resume</label>
              <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-secondary/40">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-brand" />
                  <span className="font-bold text-foreground truncate max-w-[200px]">Candidate_Resume.pdf</span>
                </div>
                <button type="button" className="text-xs font-extrabold text-indigo-brand hover:underline flex items-center gap-1">
                  <Upload className="h-3.5 w-3.5" /> Replace
                </button>
              </div>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all mt-4"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* STEP 2: SCREENING QUESTIONS */}
        {step === "screening" && (
          <div className="space-y-4 text-xs font-semibold">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-indigo-brand">2. Employer Questions</h3>
            {job.screeningQuestions?.map((q, idx) => (
              <div key={idx} className="space-y-1">
                <label className="block text-foreground font-bold">{q}</label>
                <input
                  type="text"
                  placeholder="Your answer..."
                  value={screeningAnswers[q] || ""}
                  onChange={(e) => handleScreeningAnswerChange(q, e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                />
              </div>
            ))}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setStep("form")}
                className="w-1/3 h-11 rounded-2xl border border-border text-xs font-bold text-muted-foreground flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={handleNextStep}
                className="w-2/3 h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95"
              >
                Review Application <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW APPLICATION */}
        {step === "review" && (
          <div className="space-y-4 text-xs font-semibold">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-indigo-brand">3. Review Your Application</h3>
            <div className="p-4 rounded-2xl border border-border bg-secondary/30 space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Name:</span> <span className="font-extrabold text-foreground">{formData.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone:</span> <span className="font-bold text-foreground">{formData.phone}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Experience:</span> <span className="font-bold text-foreground">{formData.experience}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Expected Salary:</span> <span className="font-bold text-emerald-600">₹{formData.expectedSalary?.toLocaleString("en-IN")} / Mo</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Notice Period:</span> <span className="font-bold text-foreground">{formData.noticePeriod}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Resume:</span> <span className="font-bold text-indigo-brand">Attached (PDF)</span></div>
            </div>

            {Object.keys(screeningAnswers).length > 0 && (
              <div className="p-3 rounded-2xl border border-border bg-card space-y-1">
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Answers Overview</p>
                {Object.entries(screeningAnswers).map(([q, a]) => (
                  <div key={q} className="text-xs">
                    <span className="font-bold text-foreground">{q}:</span> <span className="text-muted-foreground">{a}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setStep(job.screeningQuestions && job.screeningQuestions.length > 0 ? "screening" : "form")}
                className="w-1/3 h-11 rounded-2xl border border-border text-xs font-bold text-muted-foreground flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" /> Edit
              </button>
              <button
                onClick={handleSubmitFinal}
                disabled={loading}
                className="w-2/3 h-11 rounded-2xl bg-indigo-brand text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-brand/90"
              >
                {loading ? "Submitting..." : "Submit Application ✓"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION */}
        {step === "success" && (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground">Application Submitted Successfully! ✓</h3>
              <p className="text-xs text-muted-foreground mt-1 font-semibold">
                Your application has been delivered to <span className="font-extrabold text-foreground">{job.companyName}</span>.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-xs"
            >
              Done & View My Applications
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
