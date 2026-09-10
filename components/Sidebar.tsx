"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Pin, PinOff } from 'lucide-react';

const SIDEBAR_PINNED_KEY = 'bhoogyan-sidebar-pinned';

export default function Sidebar() {
  const pathname = usePathname();
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_PINNED_KEY);
    if (saved === 'true') {
      setIsPinned(true);
    }
  }, []);

  if (pathname === '/login' || pathname === '/signup' || pathname === '/reset-password') {
    return null;
  }

  const togglePinned = () => {
    const newState = !isPinned;
    setIsPinned(newState);
    localStorage.setItem(SIDEBAR_PINNED_KEY, newState.toString());
  };

  const isActive = (path: string) => pathname === path || (pathname?.startsWith(path) && path !== '/');

  const getSemanticColors = (path: string) => {
    if (path.startsWith('/bhooneeti')) return 'bg-ai-light text-ai-dark';
    if (path.startsWith('/gis')) return 'bg-gis-light text-gis-dark';
    if (path.startsWith('/policy')) return 'bg-policy-light text-policy-dark';
    if (path.startsWith('/evidence')) return 'bg-evidence-light text-evidence-dark';
    return 'bg-brand-light text-brand';
  };

  const linkClass = (path: string) =>
    `block px-3 py-2.5 text-[14px] rounded-[10px] transition-colors font-medium ${isActive(path)
      ? `${getSemanticColors(path)} font-semibold`
      : 'text-foreground hover:bg-muted hover:text-brand'
    }`;

  return (
    <>
      <div
        className="hidden lg:block shrink-0"
        style={{ width: isPinned ? '280px' : '0px' }}
      />

      {/* Sidebar Panel */}
      <aside
        className={`hidden lg:flex w-[256px] bg-surface border border-border flex-col shadow-[0_12px_40px_rgba(23,50,77,0.08)] rounded-[20px] overflow-hidden lg:m-3 ${isPinned ? 'lg:fixed lg:top-3 lg:bottom-3 lg:left-3 lg:z-50 lg:h-[calc(100vh-24px)]' : 'lg:relative lg:shrink-0'}`}
      >
        <div
          className="p-7 pb-6 border-b border-border shrink-0 flex items-center justify-between group"
        >
          <h1 className="text-[22px] font-bold text-brand">
            BhooGyan
          </h1>
          <button
            type="button"
            onClick={togglePinned}
            title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
            aria-label={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
            className="w-8 h-8 rounded-md text-text-secondary flex items-center justify-center hover:bg-muted hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand transition-colors"
          >
            {isPinned ? <PinOff size={16} aria-hidden="true" /> : <Pin size={16} aria-hidden="true" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-5 space-y-7 custom-scrollbar">

          {/* OVERVIEW */}
          <div>
            <h2 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3 px-2">Overview</h2>
            <ul className="space-y-1">
              <li><Link href="/" className={linkClass("/")}>Dashboard</Link></li>
            </ul>
          </div>

          {/* INTELLIGENCE */}
          <div>
            <h2 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3 px-2">Intelligence</h2>
            <ul className="space-y-1">
              <li><Link href="/gis" className={linkClass("/gis")}>Land Intelligence</Link></li>
            </ul>
          </div>

          {/* RESEARCH */}
          <div>
            <h2 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3 px-2">Research</h2>
            <ul className="space-y-1">
              <li><Link href="/bhooneeti" className={linkClass("/bhooneeti")}>BhooNeeti</Link></li>
              <li><Link href="/evidence" className={linkClass("/evidence")}>Evidence</Link></li>
            </ul>
          </div>

          {/* POLICY */}
          <div>
            <h2 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3 px-2">Policy</h2>
            <ul className="space-y-1">
              <li><Link href="/policy" className={linkClass("/policy")}>Policy Studio</Link></li>
            </ul>
          </div>

          {/* WORKSPACE */}
          <div>
            <h2 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3 px-2">Workspace</h2>
            <ul className="space-y-1">
              <li><Link href="/projects" className={linkClass("/projects")}>Projects</Link></li>
            </ul>
          </div>

          {/* MONITORING */}
          <div>
            <h2 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3 px-2">Monitoring</h2>
            <ul className="space-y-1">
              <li><Link href="/monitoring" className={linkClass("/monitoring")}>Monitoring</Link></li>
            </ul>
          </div>

        </nav>

        <div className="p-5 border-t border-border flex items-center justify-center shrink-0">
          <button
            onClick={async () => {
              const { logoutUser } = await import('@/lib/auth');
              try {
                await logoutUser();
              } catch (e) {
                console.error(e);
              }
            }}
            title="Log out"
            className="w-[42px] h-[42px] rounded-full bg-muted text-brand flex items-center justify-center font-bold text-[14px] border border-border hover:bg-brand-light hover:border-brand-light hover:text-red-600 transition-all shadow-sm"
          >
            PS
          </button>
        </div>
      </aside>
    </>
  );
}
