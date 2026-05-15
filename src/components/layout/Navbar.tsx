import Link from 'next/link';
import { Radar, Database, Sparkles, Activity } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/30 group-hover:border-primary transition-colors">
            <Radar className="w-6 h-6 text-primary" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight text-white uppercase italic">
            Vantage<span className="text-primary not-italic">Point</span> AI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/drs" icon={<Radar className="w-4 h-4" />} label="AI Review" />
          <NavLink href="/vault" icon={<Database className="w-4 h-4" />} label="Vault" />
          <NavLink href="/scriptwriter" icon={<Sparkles className="w-4 h-4" />} label="Scriptwriter" />
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-muted px-3 py-1 rounded-full flex items-center gap-2 border border-white/5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live System</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors group"
    >
      <span className="text-muted-foreground group-hover:text-primary transition-colors">{icon}</span>
      <span className="font-headline uppercase tracking-wide text-xs">{label}</span>
    </Link>
  );
}
