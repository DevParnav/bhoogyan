import Link from 'next/link';

interface HeaderProps {
  breadcrumbs: { label: string; href?: string }[];
  title: React.ReactNode;
  subtitle?: string;
}

export default function Header({ breadcrumbs, title, subtitle }: HeaderProps) {
  return (
    <header className="flex justify-between items-start mb-8 bg-surface p-6 rounded-xl border border-border shadow-sm">
      <div>
        <nav className="flex items-center space-x-2 text-xs text-text-secondary mb-3">
          <Link href="/" className="hover:text-brand transition-colors">BhooGyan</Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span>/</span>
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-brand transition-colors">{crumb.label}</Link>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>
        <h1 className="text-2xl font-bold text-brand mb-1">{title}</h1>
        {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-3 pr-10 py-1.5 border border-border rounded-full text-sm bg-muted focus:outline-none focus:border-brand text-foreground w-48"
          />
          <span className="absolute right-3 top-2 text-text-secondary text-xs">🔍</span>
        </div>
        <button className="w-8 h-8 rounded-full bg-border text-brand flex items-center justify-center font-bold text-xs hover:bg-brand-light transition-colors">
          🔔
        </button>
        <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs">
          DR
        </div>
      </div>
    </header>
  );
}
