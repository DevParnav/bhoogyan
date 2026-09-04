"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('bhoogyan_sidebar_locked');
    if (saved === 'true') {
      setIsLocked(true);
    }
  }, []);

  if (pathname === '/login' || pathname === '/signup' || pathname === '/reset-password') {
    return null;
  }

  const handleMouseEnter = () => {
    if (isLocked) return;
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isLocked) return;
    closeTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 100); 
  };

  const toggleLock = () => {
    const newState = !isLocked;
    setIsLocked(newState);
    if (!newState) {
      setIsHovered(true);
    }
    localStorage.setItem('bhoogyan_sidebar_locked', newState.toString());
  };

  // Open if locked, hovered, or before mount (prevent initial layout jump if user wants it default, but we default to false)
  const isOpen = mounted ? (isLocked || isHovered) : false;

  const isActive = (path: string) => pathname === path || (pathname?.startsWith(path) && path !== '/');

  const getSemanticColors = (path: string) => {
    if (path.startsWith('/bhooneeti')) return 'bg-ai-light text-ai-dark';
    if (path.startsWith('/gis')) return 'bg-gis-light text-gis-dark';
    if (path.startsWith('/policy')) return 'bg-policy-light text-policy-dark';
    if (path.startsWith('/evidence')) return 'bg-evidence-light text-evidence-dark';
    return 'bg-brand-light text-brand';
  };

  const linkClass = (path: string) => 
    `block px-3 py-2.5 text-[14px] rounded-[10px] transition-colors font-medium ${
      isActive(path) 
        ? `${getSemanticColors(path)} font-semibold` 
        : 'text-foreground hover:bg-muted hover:text-brand'
    }`;

  return (
    <>
      {/* Spacer to seamlessly push main content on desktop without affecting mobile */}
      <div 
        className="hidden lg:block shrink-0 transition-[width] ease-[cubic-bezier(0.22,1,0.36,1)] duration-[450ms]"
        style={{ width: isOpen ? '280px' : '0px' }}
      />

      {/* Invisible hover activation zone */}
      {!isLocked && (
        <div 
          className="fixed top-0 left-0 w-[40px] h-full z-40 bg-transparent hidden lg:block" 
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className="w-[256px] bg-surface border border-border flex flex-col fixed z-50 shadow-[0_12px_40px_rgba(23,50,77,0.08)] rounded-[20px] overflow-hidden"
        style={{
          top: '12px',
          bottom: '12px',
          left: '12px',
          height: 'calc(100vh - 24px)',
          transform: isOpen ? 'translateX(0)' : 'translateX(calc(-100% - 24px))',
          transition: 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          onClick={toggleLock}
          className={`p-7 pb-6 border-b border-border shrink-0 cursor-pointer flex items-center justify-between transition-all duration-300 group ${isLocked ? 'bg-muted/30' : 'hover:bg-muted'}`}
          title={isLocked ? "Sidebar locked" : "Sidebar auto-hide"}
        >
          <h1 className="text-[22px] font-bold text-brand group-hover:scale-[1.02] transition-transform origin-left duration-300">
            BhooGyan
          </h1>
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isLocked ? 'bg-brand opacity-100' : 'opacity-0 bg-transparent'}`} />
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
