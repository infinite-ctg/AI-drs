import { DrsReviewCenter } from '@/components/drs/DrsReviewCenter';
import { Radar, Info } from 'lucide-react';

export default function DrsPage() {
  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
               <Radar className="w-6 h-6 text-primary" />
             </div>
             <h1 className="text-4xl font-headline font-black text-white italic uppercase tracking-tighter leading-none">
               Analysis <span className="text-primary neon-glow-primary">Terminal</span>
             </h1>
          </div>
          <p className="text-muted-foreground font-medium max-w-xl">
            High-fidelity visual analysis engine for cricket officiating. Powered by Gemini Vision and Google Cloud infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-muted/30 px-6 py-4 rounded-xl border border-white/5">
          <div className="text-right">
             <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Operational Status</h4>
             <p className="text-emerald-500 font-headline font-bold text-sm italic uppercase">System Optimal</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>

      <DrsReviewCenter />

      {/* Technical Footer Info */}
      <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex gap-4 items-start">
          <Info className="w-5 h-5 text-primary shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed uppercase font-bold tracking-tight">
            Vantage Point AI predictions are intended as official assistance only. Final decisions should integrate on-field umpire context.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Processing Core</span>
          <span className="text-xs text-white font-headline italic">Gemini 1.5 Flash Vision Substrate</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Network Protocol</span>
          <span className="text-xs text-white font-headline italic">GCP Cloud Run Low-Latency Grid</span>
        </div>
      </div>
    </div>
  );
}
