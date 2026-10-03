import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';
import { useAuth } from '../../stores/auth.store';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setLoading(true);
    
    try {
      await register({ full_name: fullName, email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAF9]">
      {/* LEFT: AUTH FORM */}
      <div className="w-full md:w-1/2 lg:w-[48%] xl:w-[42%] flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-10 sm:py-14">
        <div className="max-w-md w-full mx-auto">
          {/* Brand Header */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center p-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                <img src="/logo.png" alt="BISense" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-1.5">
                  BISense
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-700 border border-orange-200">
                    Gov Portal
                  </span>
                </span>
                <p className="text-xs text-slate-500 font-medium">Standards Intelligence Platform</p>
              </div>
            </Link>

            <Link 
              to="/login" 
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              Sign In Instead →
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Officer Account
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Join the centralized intelligence graph for Indian Standards and public procurement.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-2xs"
                  placeholder="Dr. Rajesh Sharma"
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-2xs"
                  placeholder="officer@nic.in or @gov.in"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-2xs font-mono"
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-2xs font-mono"
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  required 
                  defaultChecked 
                  className="mt-0.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 h-4 w-4" 
                />
                <span className="text-xs text-slate-600">
                  I agree to the Government of India Terms of Service and official standards review protocol.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 active:scale-99 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registering Account...</span>
                </>
              ) : (
                <>
                  <span>Create Officer Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Already have an account?{' '}
              <Link to="/login" className="text-orange-600 hover:text-orange-700 font-bold hover:underline">
                Sign In
              </Link>
            </div>
            <Link to="/" className="text-slate-500 hover:text-slate-800 font-medium">
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT: HERO VISUAL WITH WATERMARK */}
      <div className="hidden md:flex flex-1 bg-slate-950 relative overflow-hidden border-l border-slate-800 flex-col justify-between p-12 lg:p-16">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-luminosity scale-105 pointer-events-none"
          style={{ backgroundImage: `url('/delhi_watermark.jpg')` }}
        />
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
            <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
              Official Officer Access
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-xl mx-auto my-auto text-center py-10">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 flex items-center justify-center p-3 mb-8 shadow-2xl backdrop-blur-md">
            <img src="/logo.png" alt="BISense Logo" className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(255,145,0,0.4)]" />
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Join the Public Procurement Intelligence Network
          </h2>

          <p className="text-slate-300 text-sm lg:text-base leading-relaxed mb-8">
            Access real-time clause extraction, cross-referencing against Indian Standards (IS), and automated tender verification.
          </p>
        </div>

        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-400" />
            <span>Bureau of Indian Standards (BIS) Compliant</span>
          </div>
          <div>Strict Legal Provenance</div>
        </div>
      </div>
    </div>
  );
}
