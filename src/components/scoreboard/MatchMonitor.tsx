'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
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
      const live = allMatches.filter((m: any) => {
        const name = (m.name || '').toLowerCase();
        return m.matchType === 't20' && (
          name.includes('ipl') ||
          name.includes('indian premier') ||
          name.match(/\bvs\b/)
        ) && m.score && m.score.length > 0;
      });

      setMatches(live.length ? live : allMatches.filter(m => m.score && m.score.length));
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
      <Card className="bg-[#141920] border-[#1e2530] p-6 w-full max-w-sm flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-6 h-6 text-[#4c6ef5] animate-spin" />
        <p className="text-[10px] font-bold text-[#5a6a80] uppercase tracking-widest font-barlow">Fetching Live Scores</p>
      </Card>
    );
  }

  if (error && matches.length === 0) {
    return (
      <Card className="bg-[#141920] border-red-500/20 p-6 w-full max-w-sm flex flex-col items-center justify-center gap-3">
        <AlertCircle className="w-6 h-6 text-red-500" />
        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center font-barlow">{error}</p>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card className="bg-[#141920] border-[#1e2530] p-6 w-full max-w-sm text-center">
        <Trophy className="w-8 h-8 text-[#3a4a5a] mx-auto mb-2" />
        <p className="text-[10px] font-bold text-[#5a6a80] uppercase tracking-widest font-barlow">No Live T20 Matches</p>
      </Card>
    );
  }

  const match = matches[currentIdx];
  const scoreData = match.score?.[match.score.length - 1];
  const innNum = match.score?.length || 0;
  
  const teamBatting = (scoreData?.inning || 'Live Score').replace(/\s+inning\s+\d+/i, '').trim().toUpperCase();
  const runs = scoreData?.r ?? '—';
  const wickets = scoreData?.w ?? '—';
  const overs = scoreData?.o ?? '—';

  const calcCRR = () => {
    if (!overs || overs === '0') return '0.00';
    const parts = String(overs).split('.');
    const balls = (parseInt(parts[0]) || 0) * 6 + (parseInt(parts[1] || '0'));
    return balls ? ((runs / balls) * 6).toFixed(2) : '0.00';
  };

  const calcProjected = () => {
    const parts = String(overs).split('.');
    const balls = (parseInt(parts[0]) || 0) * 6 + (parseInt(parts[1] || '0'));
    return balls ? Math.round((runs / balls) * 120) : '—';
  };

  return (
    <Card className="bg-[#141920] border-[#1e2530] rounded-2xl p-7 w-full max-w-xl relative overflow-hidden group stadium-light">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#4c6ef5] to-transparent opacity-100" />
      
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-[#5a6a80] uppercase tracking-[1.8px] font-barlow">Current Match</p>
          <div className="flex items-center gap-2">
            <div className="w-[9px] h-[9px] rounded-full bg-[#e63946] animate-pulse" />
            <span className="text-base font-bold text-[#e8edf5] font-barlow uppercase tracking-[0.3px]">
              {match.name || 'Live Match'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[13px] font-black text-[#4c6ef5] uppercase tracking-[1px] font-barlow">
            Innings {innNum}
          </span>
        </div>
      </div>

      {matches.length > 1 && (
        <div className="mb-4">
          <select 
            className="w-full bg-[#1a2030] border border-[#1e2a38] rounded-md px-3 py-1.5 text-[11px] font-bold text-[#7a8fa8] uppercase outline-none font-barlow cursor-pointer"
            value={currentIdx}
            onChange={(e) => setCurrentIdx(parseInt(e.target.value))}
          >
            {matches.map((m, i) => (
              <option key={m.id} value={i}>{m.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex justify-between items-end mb-5">
        <div className="space-y-1">
          <p className="text-[13px] font-bold text-[#7a8fa8] uppercase tracking-[1.2px] font-barlow">{teamBatting}</p>
          <div className="flex items-baseline">
            <span className="text-[64px] font-barlow-cond font-black text-[#f0f4ff] tracking-[-1px] leading-none">{runs}</span>
            <span className="text-[40px] font-barlow-cond font-bold text-[#7a8fa8] ml-2">/ {wickets}</span>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[11px] font-bold text-[#5a6a80] uppercase tracking-[1.5px] font-barlow">Overs</p>
          <p className="text-[64px] font-barlow-cond font-black text-[#f0f4ff] tracking-[-1px] leading-none">{overs}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-[#1e2a38] space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-7">
            <div>
              <p className="text-[11px] font-bold text-[#5a6a80] uppercase tracking-[1.5px] mb-1 font-barlow">CRR</p>
              <p className="text-[26px] font-barlow-cond font-black text-[#e8edf5] leading-none">{calcCRR()}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#5a6a80] uppercase tracking-[1.5px] mb-1 font-barlow">Projected</p>
              <p className="text-[26px] font-barlow-cond font-black text-[#e8edf5] leading-none">{calcProjected()}</p>
            </div>
          </div>
          <div className="bg-[#1e2d4a] border border-[#2a3f62] rounded-lg px-4 py-2.5 text-[13px] font-black text-[#a8c4ff] uppercase tracking-[0.5px] font-barlow">
            {match.currentBatsman || 'LIVE TRACKING ●'}
          </div>
        </div>

        <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-[1px] text-[#3a4a5a] pt-2 font-barlow">
          <span>Refresh in {Math.floor(refreshIn / 60)}:{String(refreshIn % 60).padStart(2, '0')}</span>
          <button 
            onClick={() => fetchScore(true)} 
            className="border border-[#1e2a38] rounded-md px-3 py-1 hover:border-[#4c6ef5] hover:text-[#4c6ef5] transition-all flex items-center gap-2"
          >
            <RefreshCcw className={cn("w-3 h-3", loading && "animate-spin")} />
            Sync
          </button>
        </div>
      </div>
    </Card>
  );
}