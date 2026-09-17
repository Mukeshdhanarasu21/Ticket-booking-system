'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

function CallbackContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    async function completeSignIn() {
      const code = searchParams.get('code');
      if (!code) {
        setError(searchParams.get('error_description') || 'Google did not return an authorization code.');
        return;
      }

      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;
        if (!data.session?.access_token) throw new Error('No access token was returned.');

        localStorage.setItem('auth_token', data.session.access_token);

        const requestedNext = searchParams.get('next') || '/events';
        const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//')
          ? requestedNext
          : '/events';
        window.location.replace(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not complete Google sign-in.');
      }
    }

    void completeSignIn();
  }, [searchParams]);

  return (
    <div className="mx-auto my-20 max-w-md rounded-3xl border border-white/[0.08] bg-slate-900/80 p-10 text-center shadow-2xl">
      {error ? (
        <>
          <h1 className="text-xl font-black text-white">Google sign-in failed</h1>
          <p className="mt-3 text-sm text-rose-300">{error}</p>
          <Link href="/login" className="mt-6 inline-block text-sm font-bold text-sky-400 hover:underline">
            Return to sign in
          </Link>
        </>
      ) : (
        <>
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-sky-400" />
          <h1 className="mt-5 text-xl font-black text-white">Completing sign-in…</h1>
          <p className="mt-2 text-sm text-slate-400">You will be redirected automatically.</p>
        </>
      )}
    </div>
  );
}

function CallbackLoading() {
  return (
    <div className="mx-auto my-20 max-w-md rounded-3xl border border-white/[0.08] bg-slate-900/80 p-10 text-center shadow-2xl">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-sky-400" />
      <h1 className="mt-5 text-xl font-black text-white">Completing sign-in…</h1>
      <p className="mt-2 text-sm text-slate-400">You will be redirected automatically.</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <CallbackContent />
    </Suspense>
  );
}
