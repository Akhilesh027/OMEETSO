import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { login, intendedRoute, setIntendedRoute } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("22446688");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isLoading) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const result = await login({ email, password, rememberDevice });

      if (!result.success) {
        setErrorMessage(result.error || "Invalid credentials. Please check your details.");
        return;
      }

      if (result.requires2FA) {
        navigate("/admin/two-factor");
      } else {
        const destination = intendedRoute || "/admin/dashboard";
        setIntendedRoute(null);
        navigate(destination, { replace: true });
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected login error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-[#DC3545] text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-[#DC3545] shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">{errorMessage}</span>
        </div>
      )}

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
              placeholder="admin@gmail.com"
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#3547D4] focus:outline-none bg-white text-[#111827]"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-[#111827]">Password</label>
            <Link
              to="/admin/forgot-password"
              className="text-xs font-semibold text-[#3547D4] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
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
              className="absolute right-3.5 top-3 text-[#64748B] hover:text-[#111827]"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-4 h-4 rounded text-[#3547D4] focus:ring-[#3547D4] border-slate-300"
            />
            <span className="text-[#64748B] font-medium">Remember this browser</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl font-bold text-xs bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-lg shadow-indigo-950/20 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Sign In to Admin Console</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
