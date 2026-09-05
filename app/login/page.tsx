"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, BarChart3, FileCheck2, Leaf, Loader2, LockKeyhole, Mail, Map, ShieldCheck } from 'lucide-react';
import {
  loginWithEmail,
  loginWithGoogle,
  signUp,
  resetPassword,
  getFriendlyErrorMessage
} from '@/lib/auth';
import { isConfigured } from '@/lib/firebase';
import { checkProfileCompletion } from '@/lib/userProfile';

type AuthMode = 'SIGN_IN' | 'SIGN_UP' | 'FORGOT_PASSWORD';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('SIGN_IN');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setError(null);
    setSuccess(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) {
      setError('Firebase configuration is missing. Authentication unavailable.');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (mode === 'SIGN_IN') {
        if (!email || !password) throw new Error('Please enter both email and password.');
        await loginWithEmail(email, password);
        // AuthProvider handles the routing, but let's assume it works.
      } else if (mode === 'SIGN_UP') {
        if (!name || !email || !password || !confirmPassword) throw new Error('Please fill in all fields.');
        if (password !== confirmPassword) throw new Error('Passwords do not match.');
        await signUp(email, password);
        // We'd ideally save the display name, but we can do that in onboarding.
      } else if (mode === 'FORGOT_PASSWORD') {
        if (!email) throw new Error('Please enter your email address.');
        await resetPassword(email);
        setSuccess('Password reset email sent. Please check your inbox.');
        setMode('SIGN_IN');
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err) || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isConfigured) {
      setError('Firebase configuration is missing.');
      return;
    }

    setIsGoogleLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      // AuthProvider handles routing.
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(getFriendlyErrorMessage(err));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  return (
    <div className="min-h-screen w-full bg-[#f4f7f8] text-[#17324d] lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(480px,0.92fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#102d45] px-10 py-9 text-white lg:flex lg:flex-col xl:px-16">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(111,194,183,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(111,194,183,0.12)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
        <div className="absolute -bottom-40 -left-24 h-[620px] w-[620px] rounded-full border border-[#4dbab2]/20" />
        <div className="absolute -bottom-32 -left-8 h-[450px] w-[450px] rounded-full border border-[#4dbab2]/15" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_at_30%_100%,rgba(47,173,163,0.24),transparent_62%)]" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#36b8af] shadow-lg shadow-[#36b8af]/20">
            <Map className="h-6 w-6 text-[#102d45]" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xl font-semibold tracking-tight">BhooGyan</p>
            <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#b9d3d2]">Land intelligence platform</p>
          </div>
        </div>

        <div className="relative z-10 mt-auto max-w-2xl pb-8 pt-20">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#57c8be]">Evidence for better decisions</p>
          <h2 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.03em] xl:text-6xl">
            Know the land.<br />Shape <span className="text-[#4ec5bb]">what comes next.</span>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#c0d0d8]">
            A national digital platform connecting land records, research, geospatial intelligence and policy innovation for resilient communities.
          </p>

          <div className="mt-12 grid max-w-2xl grid-cols-3 gap-5 border-t border-white/15 pt-6">
            <div className="flex gap-3">
              <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-[#5dc7be]" />
              <div><p className="text-sm font-medium">Trusted evidence</p><p className="mt-1 text-xs leading-5 text-[#9cb3bf]">Research and official data</p></div>
            </div>
            <div className="flex gap-3">
              <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-[#5dc7be]" />
              <div><p className="text-sm font-medium">Actionable insight</p><p className="mt-1 text-xs leading-5 text-[#9cb3bf]">Maps, trends and risk</p></div>
            </div>
            <div className="flex gap-3">
              <Leaf className="mt-0.5 h-5 w-5 shrink-0 text-[#5dc7be]" />
              <div><p className="text-sm font-medium">Sustainable futures</p><p className="mt-1 text-xs leading-5 text-[#9cb3bf]">Policy with purpose</p></div>
            </div>
          </div>
        </div>
        <p className="relative z-10 text-[10px] uppercase tracking-[0.25em] text-[#7693a0]">Data · evidence · insights · better governance</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-[430px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#17324d]"><Map className="h-5 w-5 text-[#4ec5bb]" /></div>
            <div><p className="font-semibold tracking-tight">BhooGyan</p><p className="text-[9px] uppercase tracking-[0.18em] text-[#68818e]">Land intelligence platform</p></div>
          </div>

          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#168b84]">Welcome back</p>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#17324d] sm:text-4xl">
              {mode === 'SIGN_IN' && 'Sign In'}
              {mode === 'SIGN_UP' && 'Create Account'}
              {mode === 'FORGOT_PASSWORD' && 'Reset Password'}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#68818e]">
              {mode === 'SIGN_IN' && 'Please enter your details to sign in.'}
              {mode === 'SIGN_UP' && 'Please enter your details to sign up.'}
              {mode === 'FORGOT_PASSWORD' && 'Enter your email to receive a reset link.'}
            </p>
          </div>

          <div className="rounded-2xl border border-[#dbe5e8] bg-white p-6 shadow-[0_18px_50px_rgba(23,50,77,0.08)] sm:p-8">
            <form onSubmit={handleAction} className="space-y-5">
              <div className="space-y-4">
                {mode === 'SIGN_UP' && (
                  <label className="block text-xs font-semibold text-[#365264]">Full name<input type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-lg border border-[#d5e0e4] bg-[#fbfcfc] px-4 py-3.5 text-sm text-[#17324d] outline-none transition focus:border-[#168b84] focus:ring-4 focus:ring-[#168b84]/10" disabled={isLoading || isGoogleLoading} /></label>
                )}

                <label className="block text-xs font-semibold text-[#365264]">Email address<div className="relative mt-2"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78909b]" /><input type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-[#d5e0e4] bg-[#fbfcfc] py-3.5 pl-11 pr-4 text-sm text-[#17324d] outline-none transition focus:border-[#168b84] focus:ring-4 focus:ring-[#168b84]/10" disabled={isLoading || isGoogleLoading} /></div></label>

                {mode !== 'FORGOT_PASSWORD' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#365264]">Password<div className="relative mt-2"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78909b]" /><input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-[#d5e0e4] bg-[#fbfcfc] py-3.5 pl-11 pr-4 text-sm text-[#17324d] outline-none transition focus:border-[#168b84] focus:ring-4 focus:ring-[#168b84]/10" disabled={isLoading || isGoogleLoading} /></div></label>
                    {mode === 'SIGN_IN' && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => { setMode('FORGOT_PASSWORD'); resetForm(); }}
                          className="text-xs font-medium text-[#168b84] transition-colors hover:text-[#0f625e]"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {mode === 'SIGN_UP' && (
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-[#d5e0e4] bg-[#fbfcfc] px-4 py-3.5 text-sm text-[#17324d] outline-none transition focus:border-[#168b84] focus:ring-4 focus:ring-[#168b84]/10"
                    disabled={isLoading || isGoogleLoading}
                  />
                )}
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#17324d] py-3.5 text-sm font-semibold text-white transition hover:bg-[#214963] active:scale-[0.99] disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                  mode === 'SIGN_IN' ? 'Sign In' :
                    mode === 'SIGN_UP' ? 'Sign Up' : 'Send Reset Link'
                }
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            {mode !== 'FORGOT_PASSWORD' && (
              <>
                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#e1e8ea]"></div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8aa0aa]">or</span>
                  <div className="h-px flex-1 bg-[#e1e8ea]"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || isGoogleLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#d5e0e4] bg-white py-3.5 text-sm font-semibold text-[#365264] transition hover:border-[#9db6bd] hover:bg-[#f8fbfb] active:scale-[0.99] disabled:opacity-70"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <GoogleIcon />
                      Continue with Google
                    </>
                  )}
                </button>
              </>
            )}

            <div className="mt-7 text-center text-sm text-[#68818e]">
              {mode === 'SIGN_IN' ? (
                <>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => { setMode('SIGN_UP'); resetForm(); }} className="font-semibold text-[#168b84] hover:underline">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setMode('SIGN_IN'); resetForm(); }} className="font-semibold text-[#168b84] hover:underline">
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[#78909b]"><ShieldCheck className="h-4 w-4 text-[#168b84]" /> Secure access for researchers and policymakers</div>
        </div>
      </section>
    </div >
  );
}
