import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../stores/auth.store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FDFBF7]">
      {/* LEFT: AUTH FORM */}
      <div className="w-full md:w-1/2 lg:w-[40%] xl:w-[35%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12">
        <div className="max-w-md w-full mx-auto">
          {/* Brand */}
          <div className="mb-12">
            <h1 className="text-3xl font-serif text-slate-900 font-bold tracking-tight mb-2">BISense</h1>
            <p className="text-slate-500 text-sm tracking-wide uppercase">Standards Intelligence Platform</p>
          </div>

          <h2 className="text-4xl font-light text-slate-900 mb-8">Sign in</h2>

          {error && (
            <div className="mb-6 p-4 border-l-4 border-red-500 bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-0 border-b border-slate-300 bg-transparent py-2 px-0 text-slate-900 focus:ring-0 focus:border-indigo-600 transition-colors"
                placeholder="officer@gov.in"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-0 border-b border-slate-300 bg-transparent py-2 px-0 text-slate-900 focus:ring-0 focus:border-indigo-600 transition-colors"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-2 text-slate-400 hover:text-slate-600 text-sm"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 h-4 w-4" />
                <span className="ml-2 text-sm text-slate-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 text-sm font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-12 text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-medium border-b border-transparent hover:border-indigo-800 transition-colors">
              Create one
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT: VISUAL */}
      <div className="hidden md:flex flex-1 bg-slate-900 relative overflow-hidden border-l border-slate-200/20">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#ffffff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotPattern)" />
          </svg>
        </div>
        
        {/* Placeholder for actual pixelated India artwork */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-2xl text-center z-10">
            <div className="w-48 h-48 mx-auto border border-white/10 rounded-full flex items-center justify-center mb-12 backdrop-blur-sm bg-white/5">
              {/* Emblem placeholder / abstract shape */}
              <div className="w-24 h-24 border-2 border-[#D4AF37] opacity-80 transform rotate-45"></div>
              <div className="w-24 h-24 border-2 border-[#D4AF37] opacity-80 transform -rotate-45 absolute"></div>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-6 font-light">Precision in Procurement</h2>
            <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed max-w-lg mx-auto">
              Empowering Government of India officers with neuro-symbolic intelligence for compliant, standard-driven public procurement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
