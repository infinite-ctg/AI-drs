"use client";

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
      }, 9000);
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
              Neural Frame Calibration
            </p>
          </div>
        )}

        {(stage === 'REVEALING' || stage === 'DONE') && (verdict) && (
          <div className="space-y-8 relative animate-in zoom-in-75 duration-500 flex flex-col items-center">
             <div className="bg-black/60 backdrop-blur-2xl border-y-[12px] border-white/10 p-16 md:p-32 w-full relative group shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                <div className={cn("absolute inset-0 opacity-10", accentBg)} />
                
                <p className="text-white/60 font-headline uppercase tracking-[1.5em] text-2xl mb-12 italic font-bold">
                   {subText}
                </p>

                <h1 className={cn(
                  "text-[10rem] md:text-[22rem] font-headline font-black tracking-tighter italic uppercase leading-none transform scale-110",
                  accentColor,
                  glowClass
                )}>
                  {mainText}
                </h1>

                <div className="mt-16 flex justify-center gap-6">
                   <div className={cn("w-48 h-2 rounded-full opacity-30", accentBg)} />
                   <div className={cn("w-48 h-2 rounded-full", accentBg)} />
                   <div className={cn("w-48 h-2 rounded-full opacity-30", accentBg)} />
                </div>
             </div>

             <div className="mt-16 animate-in fade-in slide-in-from-bottom-12 delay-500 duration-1000">
                <Badge variant="outline" className="text-2xl px-12 py-3 border-white/20 text-white font-headline uppercase italic tracking-[0.3em] bg-white/10">
                   Official AI Signal Transmitted
                </Badge>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
