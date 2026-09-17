'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { LogIn, AlertCircle, Sparkles, Shield, User, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      router.push('/events');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'USER' | 'ADMIN') => {
    setError('');
    setLoading(true);
    try {
      const demoEmail = role === 'ADMIN' ? 'admin@eventbooking.com' : 'user@eventbooking.com';
      await login({ email: demoEmail, password: 'password123' });
      router.push(role === 'ADMIN' ? '/admin' : '/events');
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 glass-panel border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Ambient card lighting */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="text-center space-y-2 mb-8 relative z-10">
        <div className="inline-flex p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-1">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Welcome to Bookie</h1>
        <p className="text-xs sm:text-sm text-slate-400">Sign in to book movies, sports derbies, and live concerts</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@bookie.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition shadow-inner"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition shadow-inner"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-600/30 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="relative my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-800" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">or</span>
        <div className="h-px flex-1 bg-slate-800" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="relative z-10 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-white px-4 py-3 text-xs font-bold text-slate-900 transition hover:bg-slate-100 disabled:opacity-50 sm:text-sm"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
          <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
          <path fill="#FBBC05" d="M6.39 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.55l3.35-2.62Z" />
          <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Quick Demo Login shortcuts */}
      <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3 relative z-10">
        <p className="text-[11px] text-center text-slate-400 font-semibold uppercase tracking-wider">
          Quick Demo Instant Sign-In
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => handleQuickDemo('USER')}
            disabled={loading}
            className="px-3 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs text-slate-200 font-bold border border-slate-700 transition flex items-center justify-center space-x-1.5"
          >
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span>User Demo</span>
          </button>
          <button
            onClick={() => handleQuickDemo('ADMIN')}
            disabled={loading}
            className="px-3 py-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 text-xs text-amber-300 font-bold border border-amber-800/60 transition flex items-center justify-center space-x-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Demo</span>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-400 relative z-10">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-sky-400 hover:underline font-bold">
          Register here
        </Link>
      </div>
    </div>
  );
}
