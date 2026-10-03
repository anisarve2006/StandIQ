import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Check, 
  Copy, 
  ShieldCheck, 
  Building2, 
  Zap,
  CheckCircle2,
  FileCheck2,
  Layers
} from 'lucide-react';
import { useAuth } from '../../stores/auth.store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);
  const [autofilledNotice, setAutofilledNotice] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Pre-configured official demo credentials
  const DEMO_EMAIL = 'officer@bisense.gov.in';
  const DEMO_PASSWORD = 'BISense@2025';

  const handleAutofill = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError('');
    setAutofilledNotice(true);
    setTimeout(() => setAutofilledNotice(false), 3000);
  };

  const handleQuickDemoLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setLoading(true);

    try {
      await login({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, field: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please use the demo credentials above.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAF9]">
      {/* LEFT: AUTH FORM & DEMO CALLOUT */}
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
              to="/" 
              className="text-xs font-semibold text-slate-500 hover:text-orange-600 transition-colors"
            >
              ← Overview
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign In to Your Workspace
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Access the neuro-symbolic standard verification and tender compliance dashboard.
            </p>
          </div>

          {/* DEMO CREDENTIALS BOX - Prominent Card */}
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50/50 to-orange-100/40 border border-orange-200/80 p-4 sm:p-5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-orange-400/15 to-transparent blur-xl pointer-events-none" />

            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-orange-950 flex items-center gap-1.5">
                    Demo Credentials
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/90 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      SIH Evaluator Ready
                    </span>
                  </h3>
                  <p className="text-[11px] text-orange-900/80 font-medium">
                    Pre-authorized Procurement Officer account with full system access.
                  </p>
                </div>
              </div>
            </div>

            {/* Credential rows */}
            <div className="bg-white/85 backdrop-blur-xs rounded-xl border border-orange-200/60 p-3 space-y-2 mb-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 font-medium w-16">Email:</span>
                <span className="font-mono font-semibold text-slate-900 select-all truncate flex-1">
                  {DEMO_EMAIL}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(DEMO_EMAIL, 'email')}
                  className="p-1 rounded text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                  title="Copy email"
                >
                  {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="border-t border-slate-100 pt-2 flex items-center justify-between gap-2">
                <span className="text-slate-500 font-medium w-16">Password:</span>
                <span className="font-mono font-semibold text-slate-900 select-all truncate flex-1">
                  {DEMO_PASSWORD}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(DEMO_PASSWORD, 'password')}
                  className="p-1 rounded text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                  title="Copy password"
                >
                  {copiedField === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-medium">Assigned Role:</span>
                <span className="font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/50">
                  Senior Procurement Officer (MoHUA / GeM)
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutofill}
                className="flex-1 py-2 px-3 rounded-lg bg-white hover:bg-orange-50/80 text-orange-800 text-xs font-semibold border border-orange-300/80 shadow-2xs hover:border-orange-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Zap className="w-3.5 h-3.5 text-orange-600" />
                {autofilledNotice ? 'Filled!' : 'Auto-Fill Fields'}
              </button>

              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={loading}
                className="flex-1 py-2 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-xs hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 disabled:opacity-70"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {loading ? 'Entering...' : '1-Click Demo Login'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="officer@bisense.gov.in"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); handleAutofill(); }} className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                  Use demo password
                </a>
              </div>
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
                  autoComplete="current-password"
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

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  defaultChecked 
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 h-4 w-4" 
                />
                <span className="text-xs font-medium text-slate-600">Remember credentials</span>
              </label>

              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                256-bit TLS Encrypted
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 active:scale-99 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating Officer...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Don't have an account?{' '}
              <Link to="/register" className="text-orange-600 hover:text-orange-700 font-bold hover:underline">
                Create Account
              </Link>
            </div>
            <Link to="/" className="text-slate-500 hover:text-slate-800 font-medium">
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT: HERO VISUAL WITH WATERMARK & METRICS */}
      <div className="hidden md:flex flex-1 bg-slate-950 relative overflow-hidden border-l border-slate-800 flex-col justify-between p-12 lg:p-16">
        {/* Background Delhi Watermark */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-luminosity scale-105 pointer-events-none"
          style={{ backgroundImage: `url('/delhi_watermark.jpg')` }}
        />

        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
              SIH 2024–2025 • PS-108 Prototype
            </span>
          </div>

          <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-400 backdrop-blur-md">
            Govt. of India Standards Network
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-xl mx-auto my-auto text-center py-10">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 flex items-center justify-center p-3 mb-8 shadow-2xl backdrop-blur-md">
            <img src="/logo.png" alt="BISense Logo" className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(255,145,0,0.4)]" />
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Deterministic Standards Intelligence for Public Procurement
          </h2>

          <p className="text-slate-300 text-sm lg:text-base leading-relaxed mb-8">
            Empowering procurement officers with neuro-symbolic clause verification, automated tender health auditing, and live BIS/ISO standard harmonization.
          </p>

          {/* 3 Metric Pills */}
          <div className="grid grid-cols-3 gap-3 text-left">
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 backdrop-blur-md">
              <div className="text-orange-400 font-extrabold text-lg sm:text-xl">7,400+</div>
              <div className="text-[11px] text-slate-400 font-medium">Standards Indexed</div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 backdrop-blur-md">
              <div className="text-amber-400 font-extrabold text-lg sm:text-xl">100%</div>
              <div className="text-[11px] text-slate-400 font-medium">Deterministic Rule Engine</div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 backdrop-blur-md">
              <div className="text-emerald-400 font-extrabold text-lg sm:text-xl">Zero</div>
              <div className="text-[11px] text-slate-400 font-medium">Non-Compliant Tenders</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
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
