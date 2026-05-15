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
      }, 7000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [verdict]);

  if (stage === 'IDLE') return null;

  const isNegative = ['OUT', 'NO BALL', 'CATCH VALIDITY: INVALID'].includes(verdict || '');
  const isPositive = ['NOT OUT', 'FAIR DELIVERY', 'VALID BALL', 'CATCH VALIDITY: VALID'].includes(verdict || '');
  
  const accentColor = isNegative ? 'text-red-500' : isPositive ? 'text-emerald-500' : 'text-primary';
  const glowClass = isNegative ? 'neon-glow-destructive' : isPositive ? 'neon-glow-success' : 'neon-glow-primary';
  const accentBg = isNegative ? 'bg-red-500' : isPositive ? 'bg-emerald-500' : 'bg-primary';

  // Clean up display text to be LOUD
  let mainText = verdict || '';
  let subText = 'Vantage Point AI Verdict';

  if (mainText.startsWith('CATCH VALIDITY: ')) {
    subText = 'Catch Validity Analysis';
    mainText = mainText.replace('CATCH VALIDITY: ', '');
  } else if (mainText === 'FAIR DELIVERY' || mainText === 'NO BALL') {
    subText = 'Delivery Integrity Check';
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-8 backdrop-blur-3xl transition-all duration-500 animate-in fade-in">
      <div className="max-w-6xl w-full text-center relative">
        {/* Extreme Glow Background */}
        <div className={cn(
          "absolute inset-0 blur-[200px] opacity-30 transition-all duration-1000 scale-150",
          stage === 'REVEALING' || stage === 'DONE' ? accentBg : 'bg-primary'
        )} />

        {stage === 'CHECKING' && (
          <div className="space-y-12 relative animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-5xl md:text-8xl font-headline font-black text-white tracking-[0.2em] italic uppercase animate-pulse">
              Processing <span className="text-primary">Decision...</span>
            </h2>
            <div className="w-full max-w-xl mx-auto h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-white/40 animate-progress-indefinite" />
              </div>
            </div>
            <p className="text-primary font-headline text-lg tracking-[0.5em] uppercase italic animate-pulse font-bold">
              Calibrating Vision Grid
            </p>
          </div>
        )}

        {(stage === 'REVEALING' || stage === 'DONE') && (verdict) && (
          <div className="space-y-8 relative animate-in zoom-in-75 duration-500 flex flex-col items-center">
             <div className="bg-black/60 backdrop-blur-xl border-y-8 border-white/10 p-12 md:p-24 w-full relative group shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                <div className={cn("absolute inset-0 opacity-5", accentBg)} />
                
                <p className="text-white/60 font-headline uppercase tracking-[1em] text-xl mb-8 italic font-bold">
                   {subText}
                </p>

                <h1 className={cn(
                  "text-8xl md:text-[18rem] font-headline font-black tracking-tighter italic uppercase leading-none transform scale-110",
                  accentColor,
                  glowClass
                )}>
                  {mainText}
                </h1>

                <div className="mt-12 flex justify-center gap-4">
                   <div className={cn("w-32 h-1 rounded-full opacity-50", accentBg)} />
                   <div className={cn("w-32 h-1 rounded-full", accentBg)} />
                   <div className={cn("w-32 h-1 rounded-full opacity-50", accentBg)} />
                </div>
             </div>

             <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 delay-300 duration-1000">
                <Badge variant="outline" className="text-xl px-8 py-2 border-white/20 text-white font-headline uppercase italic tracking-widest bg-white/5">
                   Final Signal Transmitted
                </Badge>
             </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes progress-indefinite {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
