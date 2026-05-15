"use client";

import { useState, useRef, useEffect } from 'react';
import { Upload, Radar, ShieldAlert, History, Maximize2, Play, Pause, Share2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { VerdictReveal } from './VerdictReveal';
import { aiDrsVisualAnalysis, type AIDRSVisualAnalysisOutput } from '@/ai/flows/ai-drs-visual-analysis';
import { useToast } from '@/hooks/use-toast';
import { MatchMonitor } from '@/components/scoreboard/MatchMonitor';
import { cn } from '@/lib/utils';

type ProcessingState = 'IDLE' | 'EXTRACTING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';

export function DrsReviewCenter() {
  const [file, setFile] = useState<File | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('IDLE');
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<AIDRSVisualAnalysisOutput | null>(null);
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

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) {
      const selectedFile = files[0];
      const validTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          variant: "destructive",
          title: "Unsupported Format",
          description: "Please upload a valid video file (MP4, MOV, or WEBM)."
        });
        return;
      }

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
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setResult(null);
      setProcessingState('IDLE');
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

  const extractFrames = async (video: HTMLVideoElement, frameCount: number = 6): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const frames: string[] = [];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error("Could not initialize canvas context"));

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const duration = video.duration;
      const interval = duration / (frameCount + 1);
      let capturedCount = 0;

      const originalTime = video.currentTime;

      const capture = (time: number) => {
        video.currentTime = time;
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL('image/jpeg', 0.6));
          capturedCount++;

          if (capturedCount < frameCount) {
            capture(interval * (capturedCount + 1));
          } else {
            video.onseeked = null;
            video.currentTime = originalTime; // Reset for user
            resolve(frames);
          }
        };
      };

      capture(interval);
    });
  };

  const startAnalysis = async () => {
    if (!file || !videoRef.current) return;

    try {
      setProcessingState('EXTRACTING');
      const frames = await extractFrames(videoRef.current);

      setProcessingState('ANALYZING');
      const response = await aiDrsVisualAnalysis({
        eventDescription: "Cricket Decision Review System analysis",
        frameDataUris: frames,
        additionalContext: "Analyze for LBW, caught behind, or crease integrity."
      });

      setResult(response);
      setProcessingState('COMPLETED');
      setShowVerdict(true);
      
    } catch (err: any) {
      setProcessingState('FAILED');
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: err.message || "There was an error processing the media."
      });
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const centiseconds = Math.floor((time % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <div className="xl:col-span-3 space-y-4">
        <Card 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
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
                onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                onError={() => setError("Video playback error")}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={togglePlay}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none opacity-0 group-hover/controls:opacity-100 transition-opacity duration-300" />
              
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
                  Upload or drag delivery footage (MP4, MOV, WEBM) for AI-assisted third umpire review.
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
                  onClick={() => fileInputRef.current?.click()}
                  variant={error ? "destructive" : "default"}
                  className="font-headline uppercase tracking-widest text-xs h-12 px-8 bg-primary hover:bg-primary/80"
                >
                  {error ? "Try Another" : "Connect Feed"}
                </Button>
              </div>
            </div>
          )}

          {(processingState === 'EXTRACTING' || processingState === 'ANALYZING') && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-6 z-40 scanline">
              <div className="relative">
                <Radar className="w-20 h-20 text-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-headline font-bold text-white uppercase italic tracking-wider">
                  {processingState === 'EXTRACTING' ? "Extracting Visual Data" : "Gemini Analysis Active"}
                </h3>
                <div className="flex flex-col items-center gap-2">
                   <p className="text-primary text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">
                     {processingState === 'EXTRACTING' ? "Processing Frame Buffers" : "Neural Pattern Matching"}
                   </p>
                   <Progress value={processingState === 'EXTRACTING' ? 40 : 80} className="w-48 h-1 bg-white/10" />
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="flex flex-wrap gap-4 items-center justify-between">
           <div className="flex gap-2">
              <Button 
                disabled={!file || processingState !== 'IDLE'} 
                onClick={startAnalysis} 
                className="bg-primary text-white font-headline uppercase px-8 h-12"
              >
                Initiate AI Review
              </Button>
              <Button variant="outline" className="border-white/10 font-headline uppercase px-6 h-12" onClick={() => { 
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setFile(null); setPreviewUrl(null); setResult(null); setError(null); setProcessingState('IDLE');
              }}>Reset System</Button>
           </div>
           <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white"><Share2 className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white"><History className="w-5 h-5" /></Button>
           </div>
        </div>
      </div>

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
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h4 className="text-[10px] font-bold text-primary uppercase mb-3 tracking-widest">Logic Breakdown</h4>
                    <p className="text-xs text-white/90 leading-relaxed font-medium">{result.explanation}</p>
                  </div>

                  {result.analyzedFrames && result.analyzedFrames.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Visual Evidence</h4>
                      <ul className="space-y-2">
                        {result.analyzedFrames.slice(0, 3).map((frame, i) => (
                          <EvidenceItem key={i} label={`Frame ${frame.frameIndex + 1}`} status={frame.frameDescription.split('.')[0]} />
                        ))}
                      </ul>
                    </div>
                  )}
               </div>

               <div className="pt-4 border-t border-white/5 text-center">
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest italic mb-3">AI-Assisted Prediction Substrate</p>
                  <Button variant="outline" className="w-full text-xs font-headline uppercase border-primary/20 text-primary hover:bg-primary/10">Full Replay Breakdown</Button>
               </div>
            </div>
          )}
        </Card>

        <MatchMonitor />
      </div>

      {showVerdict && result && (
        <VerdictReveal verdict={result.finalDecision as any} onComplete={() => setShowVerdict(false)} />
      )}
    </div>
  );
}

function EvidenceItem({ label, status }: { label: string; status: string }) {
  return (
    <li className="flex flex-col gap-1 p-3 bg-black/40 rounded-lg border border-white/5 group hover:border-primary/30 transition-colors">
      <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">{label}</span>
      <span className="text-[11px] text-white/70 line-clamp-1">{status}</span>
    </li>
  );
}
