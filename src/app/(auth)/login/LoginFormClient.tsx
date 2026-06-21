'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FormFlow Admin Portal</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Welcome Back</h2>
        <p className="text-slate-400 text-sm">Please sign in to manage your forms</p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Username</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <User className="w-5 h-5" />
            </span>
            <input
              type="text"
              required
              disabled={loading}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="enter username"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-800 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition duration-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <Lock className="w-5 h-5" />
            </span>
            <input
              type="password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-800 bg-slate-950/50 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition duration-200"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl text-base font-bold bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 hover:from-teal-400 hover:to-emerald-300 transition duration-200 shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.01]"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Signing In...</span>
            </span>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center border-t border-slate-800/60 pt-6">
        <p className="text-slate-500 text-sm">
          Don't have an account?{' '}
          <Link href={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-teal-400 hover:text-teal-300 font-semibold hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}
