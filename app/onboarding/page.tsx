"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { createUserProfile } from '@/lib/userProfile';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  
  const [role, setRole] = useState('');
  const [purposes, setPurposes] = useState<string[]>([]);
  const [purposeOther, setPurposeOther] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestOther, setInterestOther] = useState('');
  const [organization, setOrganization] = useState('');
  const [goal, setGoal] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles = ['Researcher', 'Policy Maker', 'Academic Institution', 'Citizen'];
  const purposeOptions = [
    'Research & evidence discovery', 
    'Land-use analysis', 
    'Policy research', 
    'Academic work', 
    'Explore land & geospatial data', 
    'Other'
  ];
  const interestOptions = [
    'Land Governance', 
    'Agriculture', 
    'Urban Development', 
    'Rural Development', 
    'Environment & Climate', 
    'Land Records', 
    'Geospatial Analysis', 
    'Other'
  ];

  const handleToggle = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to complete onboarding.');
      return;
    }

    if (!role) {
      setError('Please select what best describes you.');
      return;
    }

    if (purposes.length === 0) {
      setError('Please select at least one reason for visiting.');
      return;
    }

    if (interests.length === 0) {
      setError('Please select at least one interest.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createUserProfile(user.uid, {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        role,
        purposes,
        purposeOther: purposes.includes('Other') ? purposeOther : null,
        interests,
        interestOther: interests.includes('Other') ? interestOther : null,
        organization,
        goal,
        profileCompleted: true
      });
      
      await refreshProfile();
      // AuthProvider will automatically redirect to dashboard once profile is refreshed
      router.push('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F6F2EB] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-[#D9E0E6]">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-[#17324D]">
            Welcome to BhooGyan
          </h2>
          <p className="mt-2 text-sm text-[#647586]">
            Tell us a little about yourself so we can tailor your research experience.
          </p>
        </div>

        <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
          
          {/* Field 1: Role */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#263746]">
              What best describes you? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roles.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-3 px-4 rounded-xl border text-sm text-left transition-all ${
                    role === r 
                      ? 'bg-[#17324D] border-[#17324D] text-white shadow-md' 
                      : 'bg-white border-[#D9E0E6] text-[#263746] hover:border-[#17324D]/30'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Field 2: Purposes */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#263746]">
              What brings you to BhooGyan? <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {purposeOptions.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => handleToggle(purposes, setPurposes, p)}
                  className={`py-2 px-4 rounded-full border text-sm transition-all ${
                    purposes.includes(p)
                      ? 'bg-[#E8F0F7] border-[#17324D] text-[#17324D] font-medium'
                      : 'bg-white border-[#D9E0E6] text-[#647586] hover:border-[#17324D]/30'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            {purposes.includes('Other') && (
              <input
                type="text"
                placeholder="Please specify"
                value={purposeOther}
                onChange={(e) => setPurposeOther(e.target.value)}
                className="mt-2 w-full bg-white border border-[#D9E0E6] rounded-xl px-4 py-3 text-sm text-[#263746] placeholder:text-[#647586] focus:outline-none focus:border-[#17324D] focus:ring-1 focus:ring-[#17324D] transition-all"
              />
            )}
          </div>

          {/* Field 3: Interests */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#263746]">
              What are you interested in? <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleToggle(interests, setInterests, i)}
                  className={`py-2 px-4 rounded-full border text-sm transition-all ${
                    interests.includes(i)
                      ? 'bg-[#E8F0F7] border-[#17324D] text-[#17324D] font-medium'
                      : 'bg-white border-[#D9E0E6] text-[#647586] hover:border-[#17324D]/30'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
            {interests.includes('Other') && (
              <input
                type="text"
                placeholder="Please specify"
                value={interestOther}
                onChange={(e) => setInterestOther(e.target.value)}
                className="mt-2 w-full bg-white border border-[#D9E0E6] rounded-xl px-4 py-3 text-sm text-[#263746] placeholder:text-[#647586] focus:outline-none focus:border-[#17324D] focus:ring-1 focus:ring-[#17324D] transition-all"
              />
            )}
          </div>

          {/* Field 4: Organization */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#263746]">
              Organization / Institution (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. University of Example"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full bg-white border border-[#D9E0E6] rounded-xl px-4 py-3 text-sm text-[#263746] placeholder:text-[#647586] focus:outline-none focus:border-[#17324D] focus:ring-1 focus:ring-[#17324D] transition-all"
            />
          </div>

          {/* Field 5: Goal */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#263746]">
              What do you want to achieve with BhooGyan? (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Find evidence for land policy research"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-white border border-[#D9E0E6] rounded-xl px-4 py-3 text-sm text-[#263746] placeholder:text-[#647586] focus:outline-none focus:border-[#17324D] focus:ring-1 focus:ring-[#17324D] transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#17324D] text-white font-medium rounded-xl py-4 text-sm hover:bg-[#0F2438] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-70 mt-4"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue to BhooGyan"}
          </button>
        </form>
      </div>
    </div>
  );
}
