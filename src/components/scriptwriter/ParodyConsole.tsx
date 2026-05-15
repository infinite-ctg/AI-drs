"use client";

import { useState } from 'react';
import { Sparkles, Terminal, Play, Share2, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

export function ParodyConsole() {
  const [prompt, setPrompt] = useState("");
  const [script, setScript] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateScript = () => {
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setScript(`
[SCENE: DUSTY UNDERGROUND HANGAR]
NARRATOR (Voiceover): 
"The year is 2024. The pitch is ready. But the outcome? It was decided in a secret laboratory in the Himalayas three weeks ago."

[CUT TO: CLOSE UP OF A CRICKET BALL GLOWING WITH EERIE PURPLE LIGHT]
COMMENTATOR: 
"Wait... the ball is defying physics! It's doing a triple loop-de-loop before hitting the stumps! And the umpire is... HE'S DANCING? It was all in the script!"

[TEXT OVERLAY: SCRIPT PROTOCOL 77B - THE FLYING WICKET]
UMPIRE: 
"Out! Not because of the rules, but because the plot requires a comeback!"
      `);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 text-center items-center">
        <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30 mb-2 font-headline uppercase italic">Parody Mode Enabled</Badge>
        <h2 className="text-4xl font-headline font-black text-white italic uppercase tracking-tighter">Scriptwriter's <span className="text-secondary neon-glow-secondary">Revenge</span></h2>
        <p className="text-muted-foreground max-w-xl">Generate fictional, dramatic conspiracy narratives based on live match context. Entertainment only.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-panel border-white/10 p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-5 h-5 text-secondary" />
            <h3 className="font-headline font-bold text-sm text-white uppercase tracking-widest">Narrative Engine</h3>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">What's the conspiracy theory?</p>
            <Textarea 
              placeholder="e.g., The ball was replaced by a remote-controlled drone in the 15th over..."
              className="bg-white/5 border-white/10 text-white min-h-[120px] focus:ring-secondary/50"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button 
              onClick={generateScript}
              disabled={isGenerating || !prompt}
              className="w-full bg-secondary hover:bg-secondary/80 text-white font-headline uppercase italic h-12"
            >
              {isGenerating ? "Manifesting Narrative..." : "Engage Protocol"}
            </Button>
          </div>

          <div className="pt-6 border-t border-white/5 flex gap-4">
            <div className="bg-white/5 p-4 rounded-xl flex-1 border border-white/5 hover:border-secondary/20 transition-colors cursor-pointer group">
              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Preset 01</p>
              <p className="text-xs text-white font-headline italic uppercase">The Magnetic Bails</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl flex-1 border border-white/5 hover:border-secondary/20 transition-colors cursor-pointer group">
              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Preset 02</p>
              <p className="text-xs text-white font-headline italic uppercase">Holographic Fielder</p>
            </div>
          </div>
        </Card>

        <Card className="glass-panel border-white/10 p-6 relative overflow-hidden flex flex-col min-h-[400px]">
           {/* Cinematic Glow */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-3xl pointer-events-none" />
           
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                <h3 className="font-headline font-bold text-sm text-white uppercase tracking-widest">Generated Script</h3>
              </div>
              {script && <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-white"><Share2 className="w-4 h-4" /></Button>}
           </div>

           {!script ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
                <Play className="w-12 h-12 text-white/10" />
                <p className="text-muted-foreground text-sm italic">Input conspiracy details to generate a cinematic parody narrative.</p>
             </div>
           ) : (
             <div className="flex-1 bg-black/40 p-6 rounded-xl border border-white/5 font-mono text-[11px] text-secondary leading-relaxed whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-4 duration-700">
                {script}
             </div>
           )}

           <div className="mt-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[9px] text-red-200 uppercase font-bold leading-tight">
                Disclaimer: Fictional entertainment only. These scripts do not reflect real-world events, individuals, or match outcomes.
              </p>
           </div>
        </Card>
      </div>
    </div>
  );
}
