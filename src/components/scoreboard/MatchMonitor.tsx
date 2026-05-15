'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCcw, Loader2, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_KEY = 'f2de01d9-cdf4-4bea-96c5-552dbcf3af95';
const BASE = 'https://api.cricapi.com/v1';

export function MatchMonitor() {
  const [matches, setMatches] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(300);

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
      const live = allMatches.filter((m: any) => {
        const name = (m.name || '').toLowerCase();
        return m.matchType === 't20' && (
          name.includes('ipl') ||
          name.includes('indian premier') ||
          name.match(/\bvs\b/)
        ) && m.score && m.score.length > 0;
      });

      const finalMatches = live.length ? live : allMatches.filter(m => m.score && m.score.length);
      setMatches(finalMatches);
      setLoading(false);
      setSecondsLeft(300);
    } catch (err: any) {
      console.error('Score fetch error:', err);
      setError('Connection failed');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScore();
    const interval = setInterval(() => fetchScore(), 300000);
    return () => clearInterval(interval);
  }, [fetchScore]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading && matches.length === 0) {
    return (
      <div className="bg-[#141920] border-[#1e2530] border rounded-2xl p-8 w-full max-w-xl flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-[#4c6ef5] animate-spin" />
        <p className="text-[13px] font-semibold text-[#5a6a80] uppercase tracking-[0.5px]">Fetching live scores...</p>
      </div>
    );
  }

  if (error && matches.length === 0) {
    return (
      <div className="bg-[#141920] border-red-500/20 border rounded-2xl p-8 w-full max-w-xl flex flex-col items-center justify-center gap-3">
        <div className="text-2xl">⚠️</div>
        <p className="text-[13px] font-semibold text-red-500 uppercase">{error}</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-[#141920] border-[#1e2530] border rounded-2xl p-8 w-full max-w-xl text-center flex flex-col items-center justify-center gap-3">
        <Trophy className="w-10 h-10 text-[#3a4a5a] mb-2" />
        <p className="text-[14px] font-semibold text-[#5a6a80]">No Live IPL Matches</p>
        <p className="text-[11px] text-[#3a4a5a]">Check back when a match is live</p>
      </div>
    );
  }

  const match = matches[currentIdx];
  const scoreArr = match.score || [];
  const currentScore = scoreArr[scoreArr.length - 1];
  const innNum = scoreArr.length;

  const teamBatting = (currentScore?.inning || 'Live Score').replace(/\s+inning\s+\d+/i, '').trim().toUpperCase();
  const runs = currentScore?.r ?? '—';
  const wickets = currentScore?.w ?? '—';
  const overs = currentScore?.o ?? '0';

  const calcCRR = () => {
    if (!overs || overs === '0' || overs === '—') return '0.00';
    const parts = String(overs).split('.');
    const balls = (parseInt(parts[0]) || 0) * 6 + (parseInt(parts[1] || '0'));
    return balls ? ((runs / balls) * 6).toFixed(2) : '0.00';
  };

  const calcProjected = () => {
    if (!overs || overs === '0' || overs === '—') return '—';
    const parts = String(overs).split('.');
    const balls = (parseInt(parts[0]) || 0) * 6 + (parseInt(parts[1] || '0'));
    return balls ? Math.round((runs / balls) * 120) : '—';
  };

  return (
    <div className="bg-[#141920] border-[#1e2530] border rounded-2xl p-8 w-full max-w-2xl relative overflow-hidden font-barlow">
      {/* Cinematic Highlight Bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#4c6ef5] to-transparent" />
      
      {/* Header section */}
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-[#5a6a80] uppercase tracking-[1.8px]">Current Match</p>
          <div className="flex items-center gap-2">
            <div className="w-[9px] h-[9px] rounded-full bg-[#e63946] animate-pulse shadow-[0_0_10px_#e63946]" />
            <span className="text-[15px] font-bold text-[#e8edf5] uppercase tracking-[0.3px]">
              {match.name || 'Live Match'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[13px] font-extrabold text-[#4c6ef5] uppercase tracking-[1px] italic">
            Innings {innNum}
          </span>
        </div>
      </div>

      {/* Match selector (shown if multiple matches) */}
      {matches.length > 1 && (
        <div className="mb-4">
          <select 
            className="w-full bg-[#1a2030] border border-[#1e2a38] rounded-md px-3 py-1.5 text-[11px] font-semibold text-[#7a8fa8] uppercase outline-none cursor-pointer"
            value={currentIdx}
            onChange={(e) => setCurrentIdx(parseInt(e.target.value))}
          >
            {matches.map((m, i) => (
              <option key={m.id} value={i}>{m.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Main Score section */}
      <div className="flex justify-between items-end mb-5">
        <div className="space-y-1">
          <p className="text-[13px] font-semibold text-[#7a8fa8] uppercase tracking-[1.2px]">{teamBatting}</p>
          <div className="flex items-baseline">
            <span className="text-[64px] font-barlow-cond font-extrabold text-[#f0f4ff] tracking-[-1px] leading-none">{runs}</span>
            <span className="text-[40px] font-barlow-cond font-semibold text-[#7a8fa8] ml-2">/ {wickets}</span>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[11px] font-bold text-[#5a6a80] uppercase tracking-[1.5px]">Overs</p>
          <p className="text-[64px] font-barlow-cond font-extrabold text-[#f0f4ff] tracking-[-1px] leading-none">{overs}</p>
        </div>
      </div>

      <div className="h-[1px] bg-[#1e2a38] mb-5"></div>

      {/* Bottom stats row */}
      <div className="flex justify-between items-center">
        <div className="flex gap-7">
          <div>
            <p className="text-[11px] font-bold text-[#5a6a80] uppercase tracking-[1.5px] mb-1">CRR</p>
            <p className="text-[26px] font-barlow-cond font-extrabold text-[#e8edf5] leading-none">{calcCRR()}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#5a6a80] uppercase tracking-[1.5px] mb-1">Projected</p>
            <p className="text-[26px] font-barlow-cond font-extrabold text-[#e8edf5] leading-none">{calcProjected()}</p>
          </div>
        </div>
        <div className="bg-[#1e2d4a] border border-[#2a3f62] rounded-lg px-4 py-2.5 text-[13px] font-extrabold text-[#a8c4ff] uppercase tracking-[0.5px]">
          {match.currentBatsman || 'LIVE TRACKING ●'}
        </div>
      </div>

      {/* Refresh info */}
      <div className="mt-4 flex justify-between items-center text-[11px] text-[#3a4a5a] font-semibold uppercase tracking-[0.5px]">
        <span>Next refresh in {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</span>
        <button 
          onClick={() => fetchScore(true)} 
          className="border border-[#1e2a38] rounded-md px-3 py-1 hover:border-[#4c6ef5] hover:text-[#4c6ef5] transition-all flex items-center gap-2"
        >
          <RefreshCcw className={cn("w-3 h-3", loading && "animate-spin")} />
          Refresh
        </button>
      </div>
    </div>
  );
}
