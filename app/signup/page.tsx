"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Globe, Loader2 } from 'lucide-react';
import { signUp, getFriendlyErrorMessage } from '@/lib/auth';
import { isConfigured } from '@/lib/firebase';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!isConfigured) {
      setError('Firebase configuration is missing. Authentication unavailable.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Firebase doesn't take display name directly in createUserWithEmailAndPassword
      // but we can update it later. We'll rely on the auth service.
      await signUp(email, password);
      // We could add an updateProfile call here to save the name, but for now just sign up.
      router.push('/');
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      {/* Subtle ambient lighting effect */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[100px] pointer-events-none" />
      
      <div className="w-[410px] max-w-[calc(100%-32px)] mx-auto relative z-10">
        
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">Create Account</h1>
            <p className="text-sm text-white/50 text-center">
              Please enter your details to sign up.
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                disabled={isLoading}
              />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                disabled={isLoading}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                disabled={isLoading}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-medium rounded-xl py-3.5 text-sm hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-70 mt-4"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign Up"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-white/50">
            Already have an account?{' '}
            <Link href="/login" className="text-white hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
