
"use client";

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Verdict = 
  | 'OUT' 
  | 'NOT OUT' 
  | 'WIDE' 
  | 'FAIR DELIVERY' 
  | 'NO BALL' 
  | 'VALID BALL' 
  | 'CATCH VALIDITY: VALID' 
  | 'CATCH VALIDITY: INVALID' 
  | 'UNDEFINED_DECISION';

interface VerdictRevealProps {
  verdict: Verdict | null;
  onComplete?: () => void;
}

export function VerdictReveal({ verdict, onComplete }: VerdictRevealProps) {
  const [stage, setStage] = useState<'IDLE' | 'CHECKING' | 'REVEALING' | 'DONE'>('IDLE');

  useEffect(() => {
    if (verdict) {
      setStage('CHECKING');
      const timer1 = setTimeout(() => setStage('REVEALING'), 2500);
      const timer2 = setTimeout(() => {
        setStage('DONE');
        onComplete?.();
      }, 6000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [verdict]);

  if (stage === 'IDLE') return null;

  const isNegative = ['OUT', 'NO BALL', 'CATCH VALIDITY: INVALID'].includes(verdict || '');
  const accentColor = isNegative ? 'text-red-500' : 'text-emerald-500';
  const accentBg = isNegative ? 'bg-red-500' : 'bg-emerald-500';

  // Clean up display text
  const displayText = verdict?.replace('CATCH VALIDITY: ', '') || '';

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-8 backdrop-blur-2xl transition-all duration-500 animate-in fade-in">
      <div className="max-w-4xl w-full text-center relative">
        <div className={cn(
          "absolute inset-0 blur-[150px] opacity-20 transition-colors duration-1000",
          stage === 'REVEALING' || stage === 'DONE' ? accentBg : 'bg-primary'
        )} />

        {stage === 'CHECKING' && (
          <div className="space-y-8 relative">
            <h2 className="text-4xl md:text-7xl font-headline font-bold text-white tracking-[0.3em] italic uppercase animate-pulse">
              Final Check...
            </h2>
            <div className="w-full max-w-md mx-auto h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-progress-indefinite">
                <div className="w-full h-full animate-[progress_2.5s_ease-in-out_infinite] bg-primary" />
              </div>
            </div>
            <p className="text-muted-foreground font-headline text-sm tracking-[0.4em] uppercase italic animate-pulse">
              Verifying Trajectory Integrity
            </p>
          </div>
        )}

        {(stage === 'REVEALING' || stage === 'DONE') && (verdict) && (
          <div className="space-y-6 relative animate-in zoom-in-95 duration-700">
             <div className="flex flex-col items-center gap-4">
                <div className={cn("px-12 py-6 border-y-4 border-white/20 relative group overflow-hidden")}>
                   <div className={cn("absolute inset-0 opacity-10", accentBg)} />
                   <h1 className={cn(
                     "text-7xl md:text-[14rem] font-headline font-black tracking-tighter italic uppercase leading-none neon-glow-primary",
                     accentColor
                   )}>
                     {displayText}
                   </h1>
                </div>
                <div className="mt-8 flex flex-col items-center gap-2">
                  <span className="text-white font-headline uppercase tracking-[0.5em] text-sm italic">Vantage Point AI Verdict</span>
                  <div className={cn("h-1 w-24 rounded-full", accentBg)} />
                </div>
             </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
}
