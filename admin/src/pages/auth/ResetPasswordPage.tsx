import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Key } from "lucide-react";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Strength calculations
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isMatch = password === confirmPassword && confirmPassword.length > 0;

  const strengthScore = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (strengthScore < 4) {
      setError("Password does not meet minimum strength requirements.");
      return;
    }

    if (!isMatch) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-base font-bold text-[#111827]">Create New Password</h2>
        <p className="text-xs text-[#64748B]">Set a strong password for your admin account.</p>
      </div>

      {isSuccess ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs space-y-3 text-center">
          <CheckCircle2 className="w-8 h-8 text-[#16A36A] mx-auto" />
          <div>
            <p className="font-bold">Password Successfully Reset</p>
            <p className="text-[11px] text-emerald-800 mt-1">
              You can now log in with your new password.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/login")}
            className="w-full py-2.5 rounded-xl font-bold bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors"
          >
            Return to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[#DC3545] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1.5">New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#3547D4] focus:outline-none bg-white text-[#111827]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-[#64748B]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Strength meter */}
          <div className="space-y-1.5 bg-[#F5F7FC] p-3 rounded-xl border border-[#E2E8F0] text-[11px]">
            <div className="flex justify-between font-semibold text-[#111827]">
              <span>Password Strength:</span>
              <span className={strengthScore >= 4 ? "text-[#16A36A]" : "text-[#F59E0B]"}>
                {strengthScore <= 2 ? "Weak" : strengthScore <= 4 ? "Medium" : "Strong"}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-300 ${
                  strengthScore <= 2
                    ? "w-1/3 bg-[#DC3545]"
                    : strengthScore <= 4
                    ? "w-2/3 bg-[#F59E0B]"
                    : "w-full bg-[#16A36A]"
                }`}
              />
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px] text-[#64748B] pt-1">
              <span className={hasMinLength ? "text-[#16A36A] font-semibold" : ""}>✓ 8+ chars</span>
              <span className={hasUpper ? "text-[#16A36A] font-semibold" : ""}>✓ Uppercase</span>
              <span className={hasLower ? "text-[#16A36A] font-semibold" : ""}>✓ Lowercase</span>
              <span className={hasNumber ? "text-[#16A36A] font-semibold" : ""}>✓ Number</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#3547D4] focus:outline-none bg-white text-[#111827]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || strengthScore < 4 || !isMatch}
            className="w-full py-3 rounded-xl font-bold text-xs bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-lg shadow-indigo-950/20 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                <span>Update Admin Password</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
