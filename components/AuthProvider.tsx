"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, isConfigured } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getUserProfile, UserProfile } from '@/lib/userProfile';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true,
  refreshProfile: async () => {} 
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = async (uid: string) => {
    try {
      const p = await getUserProfile(uid);
      setProfile(p);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  useEffect(() => {
    if (!isConfigured || !auth) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = pathname === '/login' || pathname === '/reset-password';
    const isOnboarding = pathname === '/onboarding';
    
    const profileCompleted = profile?.profileCompleted === true;

    if (!user && !isPublicRoute) {
      router.replace('/login');
    } else if (user) {
      if (profileCompleted) {
        if (isPublicRoute || isOnboarding) {
          router.replace('/');
        }
      } else {
        if (!isOnboarding) {
          router.replace('/onboarding');
        }
      }
    }
  }, [user, profile, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F6F2EB]">
        <Loader2 className="w-8 h-8 animate-spin text-[#8A8077] mb-4" />
        <p className="text-sm font-medium text-[#8A8077]">Verifying authentication...</p>
      </div>
    );
  }

  // Prevent rendering protected routes while redirect is pending
  const isPublicRoute = pathname === '/login' || pathname === '/reset-password';
  const isOnboarding = pathname === '/onboarding';
  const profileCompleted = profile?.profileCompleted === true;

  if (!user && !isPublicRoute) return null;
  if (user && !profileCompleted && !isOnboarding) return null;
  if (user && profileCompleted && (isPublicRoute || isOnboarding)) return null;

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
