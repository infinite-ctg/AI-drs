import { Card } from '@/components/ui/card';
import { Database, Search, Filter, PlayCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function VaultPage() {
  return (
    <div className="container mx-auto px-4 py-12 flex-1 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
               <Database className="w-6 h-6 text-primary" />
             </div>
             <h1 className="text-4xl font-headline font-black text-white italic uppercase tracking-tighter leading-none">
               Decision <span className="text-primary neon-glow-primary">Vault</span>
             </h1>
          </div>
          <p className="text-muted-foreground font-medium max-w-xl">
            Archival storage of historical AI-assisted umpire reviews and trajectory telemetry.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search Match ID..." className="pl-10 bg-white/5 border-white/10" />
          </div>
          <Button variant="outline" className="border-white/10 gap-2 font-headline uppercase text-xs italic">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ReviewHistoryCard 
          match="IPL FINALS: CSK VS MI" 
          date="24 MAY 2024" 
          decision="OUT" 
          type="WICKET / LBW" 
          confidence={98} 
          img="https://picsum.photos/seed/vault1/400/225"
        />
        <ReviewHistoryCard 
          match="WTC: IND VS AUS" 
          date="18 MAY 2024" 
          decision="NOT OUT" 
          type="CATCH VALIDITY" 
          confidence={84} 
          img="https://picsum.photos/seed/vault2/400/225"
        />
        <ReviewHistoryCard 
          match="BBL: PS VS MS" 
          date="12 MAY 2024" 
          decision="NO BALL" 
          type="DELIVERY / CREASE" 
          confidence={99} 
          img="https://picsum.photos/seed/vault3/400/225"
        />
        <ReviewHistoryCard 
          match="IPL: RR VS GT" 
          date="05 MAY 2024" 
          decision="WIDE" 
          type="DELIVERY / WIDE" 
          confidence={92} 
          img="https://picsum.photos/seed/vault4/400/225"
        />
      </div>
    </div>
  );
}

function ReviewHistoryCard({ match, date, decision, type, confidence, img }: any) {
  const isOut = decision === 'OUT' || decision === 'NO BALL';
  return (
    <Card className="glass-panel border-white/5 overflow-hidden group hover:border-primary/50 transition-all cursor-pointer">
      <div className="aspect-video relative">
        <img src={img} alt={match} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute top-4 left-4">
           <Badge className={isOut ? "bg-red-500/20 text-red-500 border-red-500/30 font-headline uppercase italic" : "bg-emerald-500/20 text-emerald-500 border-emerald-500/30 font-headline uppercase italic"}>
             {decision}
           </Badge>
        </div>
        <div className="absolute bottom-4 left-4">
           <p className="text-[8px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Match Review</p>
           <h4 className="text-white font-headline font-bold text-sm uppercase italic">{match}</h4>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           <PlayCircle className="w-12 h-12 text-primary" />
        </div>
      </div>
      <div className="p-4 flex justify-between items-center border-t border-white/5">
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase font-bold">{type}</p>
          <p className="text-[10px] text-white/50">{date}</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] text-muted-foreground uppercase font-bold mb-1">AI Confidence</p>
          <p className="text-sm font-headline font-bold text-primary italic">{confidence}%</p>
        </div>
      </div>
    </Card>
  );
}
