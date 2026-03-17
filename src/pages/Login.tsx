import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login, loading: appLoading } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success("Welcome back!");
      } else {
        toast.error("Invalid credentials or account inactive.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center p-5">
      <div className="w-full max-w-5xl">
        <div className="bg-white rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-white/50 overflow-hidden animate-[slideUp_0.5s_cubic-bezier(0.2,0.9,0.3,1)]">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Login Form */}
            <div className="lg:w-1/2 p-8 lg:p-12">
              {/* Logo and Tagline */}
              <div className="mb-8">
                <img 
                  src="/logo.png" 
                  alt="ExecFlow" 
                  className="h-10 mb-2 object-contain"
                />
              </div>

              {/* Welcome Text */}
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-base lg:text-lg text-gray-600 mb-8">
                Sign in to continue to ExecFlow Task Tracker
              </p>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label className="text-xs font-medium text-[#8E8E93] uppercase tracking-wider mb-2 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8E8E93]" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@execflow.app"
                      required
                      disabled={loading || appLoading}
                      className="w-full pl-12 pr-4 py-4 text-base bg-[#F9F9FB] border border-[rgba(60,60,67,0.08)] rounded-2xl focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="text-xs font-medium text-[#8E8E93] uppercase tracking-wider mb-2 block">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8E8E93]" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading || appLoading}
                      className="w-full pl-12 pr-12 py-4 text-base bg-[#F9F9FB] border border-[rgba(60,60,67,0.08)] rounded-2xl focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || appLoading}
                  className="w-full bg-[#007AFF] hover:bg-[#0051d5] text-white font-semibold py-4 px-6 rounded-2xl text-base transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_12px_rgba(0,122,255,0.3)] hover:shadow-[0_6px_16px_rgba(0,122,255,0.4)]"
                >
                  {loading ? (
                    "Signing in..."
                  ) : (
                    <>
                      <ArrowRight className="h-5 w-5 mr-2 inline" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Right Side - Illustration (Hidden on mobile) */}
            <div className="hidden lg:block lg:w-1/2 bg-transparent p-12 flex items-center justify-center">
              <img 
                src="/login-illustration.png" 
                alt="Login Illustration" 
                className="max-h-[500px] w-auto max-w-full object-contain"
              />
              {/* Fallback if image doesn't exist - you can create a simple SVG or use a placeholder */}
              {/* <div className="text-center text-gray-400">
                <svg className="w-64 h-64 mx-auto" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="100" r="80" stroke="#007AFF" strokeWidth="4" strokeDasharray="8 8" fill="none"/>
                  <path d="M100 40 L100 100 L140 120" stroke="#007AFF" strokeWidth="4" strokeLinecap="round"/>
                </svg>
                <p className="mt-4 text-sm">Task Management Illustration</p>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}