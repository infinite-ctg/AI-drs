"use client";

import { useState, useRef, useEffect } from 'react';
import { Upload, Radar, ShieldAlert, History, Maximize2, Play, Pause, Share2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { VerdictReveal } from './VerdictReveal';
import { aiDrsDecisionAnalysis, type AIDRSDecisionAnalysisOutput } from '@/ai/flows/ai-drs-decision-analysis-flow';
import { useToast } from '@/hooks/use-toast';
import { MatchMonitor } from '@/components/scoreboard/MatchMonitor';
import { cn } from '@/lib/utils';

export function DrsReviewCenter() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<AIDRSDecisionAnalysisOutput | null>(null);
  const [showVerdict, setShowVerdict] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Video Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cleanup object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) {
      const selectedFile = files[0];
      
      // Supported types: mp4, mov (quicktime), webm
      const validTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          variant: "destructive",
          title: "Unsupported Format",
          description: "Please upload a valid video file (MP4, MOV, or WEBM)."
        });
        return;
      }

      // Size limit: 50MB
      const maxSize = 50 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Video size must be under 50MB."
        });
        return;
      }

      setError(null);
      setFile(selectedFile);
      
      // Revoke old URL if exists before creating a new one
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setResult(null);
      setIsPlaying(false);
      setCurrentTime(0);

      toast({
        title: "Video Loaded",
        description: `${selectedFile.name} is ready for analysis.`
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const startAnalysis = async () => {
    if (!file || !previewUrl) return;

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        const response = await aiDrsDecisionAnalysis({
          mediaDataUri: base64String,
          clipDescription: "Cricket match review",
          clipType: "wicket"
        });

        setResult(response);
        setShowVerdict(true);
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "There was an error processing the media."
      });
      setIsAnalyzing(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Video Event Handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVideoError = () => {
    setError("Failed to load video. It might be corrupted or in an unsupported format.");
    toast({
      variant: "destructive",
      title: "Playback Error",
      description: "The video could not be played."
    });
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const centiseconds = Math.floor((time % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Media Player Viewport */}
      <div className="xl:col-span-3 space-y-4">
        <Card 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "glass-panel overflow-hidden relative aspect-video flex items-center justify-center bg-black/40 group stadium-light transition-all duration-300",
            isDragging && "border-primary bg-primary/5 scale-[0.99]"
          )}
        >
          {previewUrl && !error ? (
            <div className="w-full h-full relative group/controls">
              <video 
                ref={videoRef}
                src={previewUrl} 
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onError={handleVideoError}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={togglePlay}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none opacity-0 group-hover/controls:opacity-100 transition-opacity duration-300" />
              
              {/* Overlay HUD */}
              <div className="absolute top-6 left-6 flex flex-col gap-1">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-md">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest font-headline">Live Review 102A</span>
                </div>
              </div>

              <div className="absolute top-6 right-6">
                <Button size="icon" variant="ghost" className="bg-black/40 backdrop-blur-sm text-white hover:bg-white/10">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Scrubber HUD - Visible on hover */}
              <div className="absolute bottom-6 left-6 right-6 space-y-4 opacity-0 group-hover/controls:opacity-100 transition-opacity duration-300">
                <div className="flex justify-between items-end">
                  <div className="flex gap-4">
                    <Button size="icon" variant="secondary" className="rounded-full w-12 h-12" onClick={togglePlay}>
                      {isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current" />}
                    </Button>
                    <div>
                      <h3 className="text-white font-headline font-bold text-lg uppercase italic tracking-tight truncate max-w-[200px]">
                        {file?.name || "Main Cam Review"}
                      </h3>
                      <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-white/10 text-[10px] font-headline uppercase bg-white/5 h-8" onClick={() => { if(videoRef.current) videoRef.current.playbackRate = 0.5 }}>0.5x</Button>
                    <Button size="sm" variant="outline" className="border-white/10 text-[10px] font-headline uppercase bg-white/5 h-8" onClick={() => { if(videoRef.current) videoRef.current.playbackRate = 1.0 }}>1.0x</Button>
                  </div>
                </div>
                <div className="space-y-1">
                   <Slider 
                     value={[currentTime]} 
                     max={duration || 100} 
                     step={0.01} 
                     onValueChange={handleSeek}
                     className="[&>span:first-child]:bg-primary/20 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-white cursor-pointer" 
                   />
                   <div className="flex justify-between">
                      <span className="text-[8px] text-muted-foreground font-bold">00:00.00</span>
                      <span className="text-[8px] text-muted-foreground font-bold">{formatTime(duration)}</span>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 p-12 text-center pointer-events-none">
              <div className={cn(
                "w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center transition-all duration-300",
                isDragging ? "animate-bounce scale-110 bg-primary/20" : "animate-pulse"
              )}>
                {error ? <AlertCircle className="w-10 h-10 text-destructive" /> : <Upload className="w-10 h-10 text-primary" />}
              </div>
              <div className="space-y-2">
                <h2 className={cn(
                  "text-2xl font-headline font-bold uppercase tracking-tight italic",
                  error ? "text-destructive" : "text-white"
                )}>
                  {error ? "Video Error" : isDragging ? "Drop to Analyze" : "Awaiting Media Feed"}
                </h2>
                <p className="text-muted-foreground text-sm max-w-sm">
                  {error ? error : "Upload or drag delivery footage (MP4, MOV, WEBM) for AI-assisted third umpire review."}
                </p>
              </div>
              <div className="pointer-events-auto">
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange} 
                  accept="video/mp4,video/quicktime,video/webm" 
                />
                <Button 
                  size="lg" 
                  onClick={triggerFileUpload}
                  variant={error ? "destructive" : "default"}
                  className={cn(
                    "font-headline uppercase tracking-widest text-xs h-12 px-8",
                    !error && "bg-primary hover:bg-primary/80"
                  )}
                >
                  {error ? "Try Another" : "Connect Feed"}
                </Button>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-40 scanline">
              <Radar className="w-16 h-16 text-primary animate-spin" />
              <div className="text-center space-y-2">
                <h3 className="text-xl font-headline font-bold text-white uppercase italic tracking-wider">Analyzing Visual Integrity</h3>
                <p className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Running Gemini Vision Engine</p>
              </div>
            </div>
          )}
        </Card>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
           <div className="flex gap-2">
              <Button disabled={!file || isAnalyzing || !!error} onClick={startAnalysis} className="bg-primary text-white font-headline uppercase px-6">Process Review</Button>
              <Button variant="outline" className="border-white/10 font-headline uppercase px-6" onClick={() => { 
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setFile(null); 
                setPreviewUrl(null); 
                setResult(null); 
                setError(null);
                setIsPlaying(false);
                setCurrentTime(0);
              }}>Reset System</Button>
           </div>
           <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white"><Share2 className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white"><History className="w-5 h-5" /></Button>
           </div>
        </div>
      </div>

      {/* Side Analytics */}
      <div className="space-y-6">
        <Card className="glass-panel border-white/10 p-5">
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <h3 className="font-headline font-bold text-sm text-white uppercase tracking-widest">Decision Analysis</h3>
          </div>

          {!result ? (
            <div className="py-12 flex flex-col items-center justify-center text-center opacity-30 italic">
               <Radar className="w-8 h-8 mb-4" />
               <p className="text-xs uppercase font-bold tracking-tight">System Idle</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
               <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">AI Confidence</span>
                    <span className="text-xl font-headline font-bold text-primary italic">{result.confidencePercentage}%</span>
                  </div>
                  <Progress value={result.confidencePercentage} className="h-1 bg-white/5" />
               </div>

               <div className="space-y-4">
                  <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                    <h4 className="text-[10px] font-bold text-primary uppercase mb-2">Primary Logic</h4>
                    <p className="text-xs text-white leading-relaxed">{result.explanation}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase">Key Visual Evidence</h4>
                    <ul className="space-y-2">
                      <EvidenceItem label="Crease Boundary" status="Fair" />
                      <EvidenceItem label="Impact Point" status="Wickets Hit" />
                      <EvidenceItem label="Bat/Pad Contact" status="Inconclusive" />
                    </ul>
                  </div>
               </div>

               <div className="pt-4 border-t border-white/5 text-center">
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest italic mb-3">AI-Assisted Prediction Only</p>
                  <Button variant="outline" className="w-full text-xs font-headline uppercase border-primary/20 text-primary hover:bg-primary/10">Full Replay Breakdown</Button>
               </div>
            </div>
          )}
        </Card>

        {/* Match Context Scoreboard */}
        <MatchMonitor />
      </div>

      <VerdictReveal verdict={result?.decision as any} onComplete={() => setShowVerdict(false)} />
    </div>
  );
}

function EvidenceItem({ label, status }: { label: string; status: string }) {
  return (
    <li className="flex justify-between items-center text-xs p-2 bg-black/20 rounded border border-white/5 group hover:border-primary/30 transition-colors">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold text-white group-hover:text-primary">{status}</span>
    </li>
  );
}
