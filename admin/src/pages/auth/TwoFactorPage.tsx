import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { KeyRound, Loader2, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

export default function TwoFactorPage() {
  const { verify2FA, intendedRoute, setIntendedRoute, session } = useAdminAuth();
  const navigate = useNavigate();

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [useBackup, setUseBackup] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Expiry timer (180 seconds)
  const [timeLeft, setTimeLeft] = useState(180);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedDigits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newDigits = [...digits];
      pastedDigits.forEach((d, i) => {
        newDigits[i] = d;
      });
      setDigits(newDigits);
      const nextIndex = Math.min(pastedDigits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, "");
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");

    if (!useBackup && code.length < 6) {
      setErrorMessage("Please enter all 6 digits.");
      return;
    }

    if (useBackup && !backupCode.trim()) {
      setErrorMessage("Please enter a valid backup code.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const result = await verify2FA({
        code,
        backupCode: useBackup ? backupCode.trim() : undefined,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Invalid 2FA verification code.");
        return;
      }

      const destination = intendedRoute || "/admin/dashboard";
      setIntendedRoute(null);
      navigate(destination, { replace: true });
    } catch (err: any) {
      setErrorMessage(err?.message || "2FA Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    setTimeLeft(180);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-50 text-[#3547D4] mb-2">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-[#111827]">Two-Factor Authentication</h2>
        <p className="text-xs text-[#64748B] leading-relaxed">
          Security code sent to admin device connected to{" "}
          <span className="font-semibold text-[#111827]">
            {session?.admin?.email || "your email"}
          </span>
        </p>
      </div>



      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-[#DC3545] text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-[#DC3545] shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-5">
        {!useBackup ? (
          <div>
            <label className="block text-center text-xs font-bold text-[#111827] mb-3">
              Enter 6-Digit Security Code
            </label>
            <div className="flex items-center justify-center gap-2">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  aria-label={`Digit ${i + 1}`}
                  className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#3547D4] focus:outline-none bg-white text-[#111827]"
                />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1.5">
              Enter Emergency Backup Code
            </label>
            <input
              type="text"
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value)}
              placeholder="e.g. BACKUP-999"
              className="w-full p-2.5 text-xs rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#3547D4] focus:outline-none bg-white font-mono text-[#111827]"
            />
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-[#64748B]">
          <span>
            Code expires in:{" "}
            <span className="font-mono font-bold text-[#111827]">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </span>
          </span>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendCooldown > 0}
            className="text-[#3547D4] font-semibold hover:underline disabled:opacity-50 inline-flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend code"}</span>
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl font-bold text-xs bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-lg shadow-indigo-950/20 flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying 2FA...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Continue</span>
            </>
          )}
        </button>
      </form>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E2E8F0]">
        <button
          onClick={() => setUseBackup(!useBackup)}
          className="text-[#3547D4] font-semibold hover:underline"
        >
          {useBackup ? "Use 6-Digit Authenticator" : "Use Emergency Backup Code"}
        </button>

        <button
          onClick={() => navigate("/admin/login")}
          className="text-[#64748B] hover:text-[#111827] flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </button>
      </div>
    </div>
  );
}
