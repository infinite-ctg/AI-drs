import { Card } from '@/components/ui/card';

export function MatchMonitor() {
  return (
    <Card className="glass-panel border-white/10 p-4 w-full max-w-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Current Match</h4>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-white font-headline">IPL FINALS: CSK vs MI</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Innings 1</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Mumbai Indians</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-headline font-bold text-white">184</span>
            <span className="text-lg font-headline font-medium text-muted-foreground">/ 4</span>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Overs</p>
          <p className="text-2xl font-headline font-bold text-white">17.4</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
        <div className="flex gap-4">
          <div>
            <p className="text-[8px] text-muted-foreground uppercase">CRR</p>
            <p className="text-xs font-bold font-headline text-white">10.45</p>
          </div>
          <div>
            <p className="text-[8px] text-muted-foreground uppercase">Projected</p>
            <p className="text-xs font-bold font-headline text-white">215</p>
          </div>
        </div>
        <div className="bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
          <span className="text-[9px] font-bold text-primary uppercase">Hardik P: 42(18)*</span>
        </div>
      </div>
    </Card>
  );
}
