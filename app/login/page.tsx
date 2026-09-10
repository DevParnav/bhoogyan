"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Globe, Loader2 } from 'lucide-react';
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
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brand-dark relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[100px] pointer-events-none" />
      
      <div className="w-[410px] max-w-[calc(100%-32px)] mx-auto relative z-10">
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">
              {mode === 'SIGN_IN' && 'Sign In'}
              {mode === 'SIGN_UP' && 'Create Account'}
              {mode === 'FORGOT_PASSWORD' && 'Reset Password'}
            </h1>
            <p className="text-sm text-white/50 text-center">
              {mode === 'SIGN_IN' && 'Please enter your details to sign in.'}
              {mode === 'SIGN_UP' && 'Please enter your details to sign up.'}
              {mode === 'FORGOT_PASSWORD' && 'Enter your email to receive a reset link.'}
            </p>
          </div>

          <form onSubmit={handleAction} className="space-y-4">
            <div className="space-y-4">
              {mode === 'SIGN_UP' && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                  disabled={isLoading || isGoogleLoading}
                />
              )}

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                disabled={isLoading || isGoogleLoading}
              />
              
              {mode !== 'FORGOT_PASSWORD' && (
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                    disabled={isLoading || isGoogleLoading}
                  />
                  {mode === 'SIGN_IN' && (
                    <div className="flex justify-end">
                      <button 
                        type="button"
                        onClick={() => { setMode('FORGOT_PASSWORD'); resetForm(); }}
                        className="text-xs text-white/40 hover:text-white/70 transition-colors"
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
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                  disabled={isLoading || isGoogleLoading}
                />
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-200">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-xs text-green-200">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full bg-white text-black font-medium rounded-xl py-3.5 text-sm hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-70 mt-4"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                mode === 'SIGN_IN' ? 'Sign In' : 
                mode === 'SIGN_UP' ? 'Sign Up' : 'Send Reset Link'
              }
            </button>
          </form>

          {mode !== 'FORGOT_PASSWORD' && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-xs text-white/30 font-medium">OR</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-white/[0.04] border border-white/10 text-white rounded-xl py-3.5 text-sm font-medium hover:bg-white/[0.08] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
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

          <div className="mt-8 text-center text-sm text-white/50">
            {mode === 'SIGN_IN' ? (
              <>
                Don't have an account?{' '}
                <button type="button" onClick={() => { setMode('SIGN_UP'); resetForm(); }} className="text-white hover:underline">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => { setMode('SIGN_IN'); resetForm(); }} className="text-white hover:underline">
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
