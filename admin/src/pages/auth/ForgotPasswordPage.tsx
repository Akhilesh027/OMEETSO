import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-base font-bold text-[#111827]">Reset Admin Password</h2>
        <p className="text-xs text-[#64748B] leading-relaxed">
          Enter your registered admin email address to receive password recovery instructions.
        </p>
      </div>

      {isSubmitted ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs space-y-3 text-center">
          <CheckCircle2 className="w-8 h-8 text-[#16A36A] mx-auto" />
          <div>
            <p className="font-bold">Password Reset Link Sent</p>
            <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
              Development mode: Password reset request simulated for{" "}
              <span className="font-semibold">{email}</span>.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/admin/reset-password?token=MOCK_RESET_TOKEN_99"
              className="inline-block px-4 py-2 rounded-xl bg-[#3547D4] text-white font-bold hover:bg-[#111E4D] transition-colors"
            >
              Proceed to Reset Password Page
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@omeetso.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#3547D4] focus:outline-none bg-white text-[#111827]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-bold text-xs bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-lg shadow-indigo-950/20 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Simulating Reset Request...</span>
              </>
            ) : (
              <span>Send Recovery Instructions</span>
            )}
          </button>
        </form>
      )}

      <div className="text-center pt-2">
        <Link
          to="/admin/login"
          className="text-xs font-semibold text-[#64748B] hover:text-[#111827] inline-flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Login</span>
        </Link>
      </div>
    </div>
  );
}
