import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { KeyRound, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function TwoFactorPage() {
  const { verify2FA, intendedRoute, setIntendedRoute, admin, status } = useAdminAuth();
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") navigate("/admin/login", { replace: true });
  }, [status, navigate]);
  useEffect(() => {
    const timer = window.setInterval(() => setTimeLeft(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 6);
    const next = [...digits];
    if (clean.length > 1) clean.split("").forEach((digit, i) => { next[i] = digit; });
    else next[index] = clean;
    setDigits(next);
    inputRefs.current[clean.length > 1 ? Math.min(clean.length, 5) : Math.min(index + 1, 5)]?.focus();
  };
  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading || timeLeft === 0) return;
    const code = digits.join("");
    if (code.length !== 6) { setErrorMessage("Please enter all 6 digits."); return; }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await verify2FA({ code });
      if (!result.success) { setErrorMessage(result.error || "Invalid authenticator code."); return; }
      const destination = intendedRoute || "/admin/dashboard";
      setIntendedRoute(null);
      navigate(destination, { replace: true });
    } catch {
      setErrorMessage("Could not verify your authenticator code. Please try again.");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-50 text-[#3547D4] mb-2"><KeyRound className="w-6 h-6" /></div>
        <h2 className="text-base font-bold text-[#111827]">Two-Factor Authentication</h2>
        <p className="text-xs text-[#64748B] leading-relaxed">Enter the current code from your authenticator app for <span className="font-semibold text-[#111827]">{admin?.email || "your admin account"}</span>.</p>
      </div>
      {errorMessage && <div role="alert" className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-[#DC3545] text-xs flex items-start gap-2.5"><AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMessage}</span></div>}
      <form onSubmit={handleVerify} className="space-y-5">
        <label className="block text-center text-xs font-bold text-[#111827]">Enter 6-Digit Authenticator Code</label>
        <div className="flex items-center justify-center gap-2">
          {digits.map((digit, index) => <input key={index} ref={element => { inputRefs.current[index] = element; }} type="text" inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} maxLength={6} value={digit} onChange={event => handleDigitChange(index, event.target.value)} onKeyDown={event => { if (event.key === "Backspace" && !digits[index]) inputRefs.current[Math.max(0, index - 1)]?.focus(); }} aria-label={`Digit ${index + 1}`} className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#3547D4] focus:outline-none bg-white text-[#111827]" />)}
        </div>
        <p className="text-xs text-[#64748B] text-center">{timeLeft > 0 ? `Sign-in window: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}. Authenticator codes refresh automatically.` : "Sign-in window expired. Return to login and enter your password again."}</p>
        <button type="submit" disabled={isLoading || timeLeft === 0} className="w-full py-3 rounded-xl font-bold text-xs bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}Verify &amp; Continue</button>
      </form>
      <button type="button" onClick={() => navigate("/admin/login")} className="text-xs text-[#64748B] hover:text-[#111827] flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" />Back to Login</button>
    </div>
  );
}