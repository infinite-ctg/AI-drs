import Link from 'next/link';
import { Radar, ShieldCheck, Zap, ArrowRight, PlayCircle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col justify-center py-20 overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Next-Gen Cricket Review</span>
              </div>
              
              <h1 className="text-5xl md:text-8xl font-headline font-black text-white leading-[0.9] italic uppercase tracking-tighter">
                Precision<br/>In Every<br/><span className="text-primary neon-glow-primary">Vantage Point</span>
              </h1>
              
              <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-lg">
                The world's most advanced AI-powered cricket decision review system. Processing visual data in real-time to provide elite-level umpire assistance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="h-14 px-10 bg-primary hover:bg-primary/90 text-white font-headline text-sm uppercase tracking-widest italic group">
                  <Link href="/drs" className="flex items-center gap-2">
                    Initiate Review <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/5">
                <div>
                  <h4 className="text-3xl font-headline font-bold text-white">99.2%</h4>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Trajectory Accuracy</p>
                </div>
                <div>
                  <h4 className="text-3xl font-headline font-bold text-white">0.4s</h4>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Latency Floor</p>
                </div>
                <div>
                  <h4 className="text-3xl font-headline font-bold text-white">8K</h4>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Visual Analysis</p>
                </div>
              </div>
            </div>

            <div className="relative group">
               {/* Dashboard Mockup Component */}
               <div className="glass-panel rounded-2xl p-4 border border-white/10 shadow-2xl relative z-10 stadium-light rotate-2 group-hover:rotate-0 transition-transform duration-700">
                  <div className="aspect-video bg-black/40 rounded-xl overflow-hidden relative">
                    <img 
                      src="https://picsum.photos/seed/cricket-hero/800/450" 
                      alt="DRS Visualization" 
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-primary/20 p-4 rounded-full border border-primary/40 backdrop-blur-md">
                        <PlayCircle className="w-12 h-12 text-primary" />
                      </div>
                    </div>
                    {/* HUD Overlays */}
                    <div className="absolute top-4 left-4 flex gap-2">
                       <div className="bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40 text-[8px] font-bold text-emerald-500 uppercase">Tracking Active</div>
                       <div className="bg-white/10 px-2 py-0.5 rounded border border-white/20 text-[8px] font-bold text-white uppercase">FPS: 120</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Radar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h5 className="text-white font-headline font-bold text-sm uppercase italic">Live Trajectory Engaged</h5>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">In-Match Protocol 772A</p>
                      </div>
                    </div>
                  </div>
               </div>

               {/* Decorative Accents */}
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/20 blur-3xl -z-10" />
               <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="bg-black/40 py-20 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-headline font-black text-white italic uppercase tracking-tighter">Powered By Vantage Logic</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
              We leverage Google Gemini 2.5 Flash Lite and Firebase Cloud Infrastructure to deliver sub-second cricket analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-primary" />} 
              title="Trajectory Engine" 
              description="Predictive ball pathing using multi-frame visual extrapolation with 99% confidence intervals."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-primary" />} 
              title="Integrity System" 
              description="Automated crease boundary detection and collision analysis to eliminate human oversight."
            />
            <FeatureCard 
              icon={<Trophy className="w-8 h-8 text-primary" />} 
              title="Broadcast Ready" 
              description="Cinematic UI overlays designed for premium OTT sports packages and live broadcasting."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="glass-panel border-white/5 p-8 group hover:border-primary/50 transition-all duration-300">
      <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit group-hover:bg-primary/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-headline font-bold text-white uppercase italic mb-4 tracking-tight">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </Card>
  );
}
