"use client";

import dynamic from 'next/dynamic';

const DashboardMap = dynamic(() => import('./DashboardMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#F6F2EB] animate-pulse rounded-lg flex items-center justify-center text-[#8A8077] text-sm">
      Loading map...
    </div>
  ),
});

export default function DashboardMapWrapper() {
  return <DashboardMap />;
}
