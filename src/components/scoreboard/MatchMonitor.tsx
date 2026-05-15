'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, AlertCircle, Loader2, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_KEY = 'f2de01d9-cdf4-4bea-96c5-552dbcf3af95';
const BASE = 'https://api.cricapi.com/v1';

export function MatchMonitor() {
  const [matches, setMatches] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIn, setRefreshIn] = useState(300);

  const fetchScore = useCallback(async (manual = false) => {
    if (manual) setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE}/currentMatches?apikey=${API_KEY}&offset=0`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.status !== 'success') {
        throw new Error(data.reason || 'API error');
      }

      const allMatches = data.data || [];
      // Filter for live IPL or T20 matches
      const iplMatches = allMatches.filter((m: any) => {
        const name = (m.name || '').toLowerCase();
        return m.matchType === 't20' && (
          name.includes('ipl') ||
          name.includes('indian premier') ||
          name.match(/\bvs\b/)
        ) && m.score && m.score.length > 0;
      });

      const live = iplMatches.length ? iplMatches : allMatches.filter((m: any) => m.score && m.score.length > 0);
      
      setMatches(live);
      setLoading(false);
      setRefreshIn(300);
    } catch (err: any) {
      console.error('Score fetch error:', err);
      setError(err.message || 'Failed to connect');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScore();
    const interval = setInterval(() => fetchScore(), 300000); // 5 mins
    return () => clearInterval(interval);
  }, [fetchScore]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading && matches.length === 0) {
    return (
      <Card className="glass-panel border-white/10 p-6 w-full max-w-sm flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-barlow">Fetching Live Scores</p>
      </Card>
    );
  }

  if (error && matches.length === 0) {
    return (
      <Card className="glass-panel border-red-500/20 p-6 w-full max-w-sm flex flex-col items-center justify-center gap-3">
        <AlertCircle className="w-6 h-6 text-red-500" />
        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center font-barlow">{error}</p>
        <Button size="sm" variant="outline" onClick={() => fetchScore(true)} className="text-[10px] h-7 border-white/10 font-barlow">Retry</Button>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card className="glass-panel border-white/10 p-6 w-full max-w-sm text-center">
        <Trophy className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-barlow">No Live T20 Matches Found</p>
      </Card>
    );
  }

  const match = matches[currentIdx];
  const scoreData = match.score?.[match.score.length - 1];
  const innNum = match.score?.length || 0;
  
  const inningStr = scoreData?.inning || '';
  const teamBatting = inningStr.replace(/\s+inning\s+\d+/i, '').trim() || 'Live Score';
  const runs = scoreData?.r ?? '—';
  const wickets = scoreData?.w ?? '—';
  const overs = scoreData?.o ?? '—';

  const calcCRR = () => {
    if (!overs || overs === '0') return '0.00';
    const parts = String(overs).split('.');
    const balls = (parseInt(parts[0]) || 0) * 6 + (parseInt(parts[1] || '0'));
    if (!balls) return '0.00';
    return ((runs / balls) * 6).toFixed(2);
  };

  const calcProjected = () => {
    const parts = String(overs).split('.');
    const balls = (parseInt(parts[0]) || 0) * 6 + (parseInt(parts[1] || '0'));
    if (!balls) return '—';
    return Math.round((runs / balls) * 120);
  };

  return (
    <Card className="glass-panel border-white/10 p-6 w-full max-w-lg space-y-6 relative overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start">
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-barlow">Current Match Feed</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-base font-black text-white font-barlow truncate max-w-[200px] uppercase italic tracking-tight">
              {match.name || 'IPL Live'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <Badge className="bg-primary/20 text-primary border-primary/30 font-black text-xs h-6 uppercase italic tracking-wider font-barlow px-3">
            Innings {innNum}
          </Badge>
        </div>
      </div>

      {matches.length > 1 && (
        <div className="pb-2">
          <select 
            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-xs font-bold text-muted-foreground uppercase outline-none focus:border-primary/50 focus:text-white transition-all appearance-none cursor-pointer font-barlow"
            value={currentIdx}
            onChange={(e) => setCurrentIdx(parseInt(e.target.value))}
          >
            {matches.map((m, i) => (
              <option key={m.id} value={i} className="bg-[#141920] text-white">{m.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex justify-between items-end gap-6">
        <div className="space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-barlow">{teamBatting}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-7xl font-barlow-cond font-black text-white italic tracking-tighter leading-none">{runs}</span>
            <span className="text-4xl font-barlow-cond font-bold text-muted-foreground">/ {wickets}</span>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-barlow">Overs</p>
          <p className="text-7xl font-barlow-cond font-black text-white italic tracking-tighter leading-none">{overs}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-10">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 font-barlow">CRR</p>
              <p className="text-3xl font-barlow-cond font-black text-white italic leading-none">{calcCRR()}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 font-barlow">Projected</p>
              <p className="text-3xl font-barlow-cond font-black text-white italic leading-none">{calcProjected()}</p>
            </div>
          </div>
          <div className="bg-[#1e2d4a] border border-[#2a3f62] rounded-lg px-4 py-2 text-[11px] font-black text-[#a8c4ff] uppercase italic tracking-widest font-barlow">
            {match.currentBatsman || 'LIVE TRACKING ●'}
          </div>
        </div>

        <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 pt-2 font-barlow">
          <span>Auto-refresh in {Math.floor(refreshIn / 60)}:{String(refreshIn % 60).padStart(2, '0')}</span>
          <button 
            onClick={() => fetchScore(true)} 
            className="flex items-center gap-1.5 hover:text-primary transition-colors uppercase group/btn"
          >
            <RefreshCcw className={cn("w-3 h-3 group-hover/btn:rotate-180 transition-transform duration-500", loading && "animate-spin")} />
            Sync Feed
          </button>
        </div>
      </div>
    </Card>
  );
}
