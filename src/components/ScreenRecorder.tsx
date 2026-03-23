import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Mic, 
  MicOff, 
  Video, 
  Square, 
  Pause, 
  Play, 
  Trash2,
  Download,
  AlertCircle
} from 'lucide-react';

interface ScreenRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  disabled?: boolean;
}

export default function ScreenRecorder({ onRecordingComplete, disabled }: ScreenRecorderProps) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
  const [duration, setDuration] = useState(0);
  const [includeAudio, setIncludeAudio] = useState(true);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopAllTracks();
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  const stopAllTracks = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const startRecording = useCallback(async () => {
    setError(null);
    chunksRef.current = [];

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true, // system audio
      });

      let combinedStream = screenStream;

      if (includeAudio) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const ctx = new AudioContext();
          const dest = ctx.createMediaStreamDestination();

          // Mix system audio (if available) + mic
          screenStream.getAudioTracks().forEach(t => {
            ctx.createMediaStreamSource(new MediaStream([t])).connect(dest);
          });
          micStream.getAudioTracks().forEach(t => {
            ctx.createMediaStreamSource(new MediaStream([t])).connect(dest);
          });

          combinedStream = new MediaStream([
            ...screenStream.getVideoTracks(),
            ...dest.stream.getAudioTracks(),
          ]);

          // Stop mic when screen share stops
          screenStream.getVideoTracks()[0].addEventListener('ended', () => {
            micStream.getTracks().forEach(t => t.stop());
          });
        } catch {
          // Mic denied — continue with screen only
        }
      }

      streamRef.current = combinedStream;

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm';

      const recorder = new MediaRecorder(combinedStream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(url);
        setStatus('stopped');
        stopAllTracks();
        if (timerRef.current) clearInterval(timerRef.current);
      };

      // Handle user clicking "Stop sharing" in browser UI
      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        if (recorder.state !== 'inactive') recorder.stop();
      });

      recorder.start(1000); // collect chunks every second
      setStatus('recording');
      setDuration(0);
      timerRef.current = window.setInterval(() => setDuration(d => d + 1), 1000);
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Screen sharing was cancelled.');
      } else {
        setError('Failed to start recording. Please try again.');
      }
      stopAllTracks();
    }
  }, [includeAudio, previewUrl]);

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setStatus('paused');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setStatus('recording');
      timerRef.current = window.setInterval(() => setDuration(d => d + 1), 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const discardRecording = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setRecordedBlob(null);
    setPreviewUrl(null);
    setStatus('idle');
    setDuration(0);
  };

  const confirmRecording = () => {
    if (recordedBlob) {
      onRecordingComplete(recordedBlob);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Screen Recording</span>
        </div>
        {status === 'recording' && (
          <Badge variant="destructive" className="animate-pulse flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-white" />
            REC {formatTime(duration)}
          </Badge>
        )}
        {status === 'paused' && (
          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
            PAUSED {formatTime(duration)}
          </Badge>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {status === 'idle' && (
        <>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIncludeAudio(!includeAudio)}
              className="flex items-center gap-2"
            >
              {includeAudio ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              {includeAudio ? 'Mic On' : 'Mic Off'}
            </Button>
            <span className="text-xs text-muted-foreground">
              {includeAudio ? 'Voice will be recorded (think-aloud)' : 'No voice recording'}
            </span>
          </div>
          <Button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="w-full flex items-center gap-2"
          >
            <Video className="h-4 w-4" />
            Start Screen Recording
          </Button>
        </>
      )}

      {(status === 'recording' || status === 'paused') && (
        <div className="flex items-center gap-2">
          {status === 'recording' ? (
            <Button type="button" variant="outline" size="sm" onClick={pauseRecording}>
              <Pause className="h-4 w-4 mr-1" /> Pause
            </Button>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={resumeRecording}>
              <Play className="h-4 w-4 mr-1" /> Resume
            </Button>
          )}
          <Button type="button" variant="destructive" size="sm" onClick={stopRecording}>
            <Square className="h-4 w-4 mr-1" /> Stop
          </Button>
        </div>
      )}

      {status === 'stopped' && previewUrl && (
        <div className="space-y-3">
          <video
            src={previewUrl}
            controls
            className="w-full rounded-md border border-border max-h-48"
          />
          <p className="text-xs text-muted-foreground">
            Duration: {formatTime(duration)} • Size: {recordedBlob ? (recordedBlob.size / 1024 / 1024).toFixed(1) : 0}MB
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={discardRecording}>
              <Trash2 className="h-4 w-4 mr-1" /> Discard
            </Button>
            <Button type="button" size="sm" onClick={confirmRecording} disabled={disabled}>
              <Download className="h-4 w-4 mr-1" /> Use This Recording
            </Button>
          </div>
        </div>
      )}

      {status === 'idle' && !error && (
        <p className="text-xs text-muted-foreground">
          Record your screen while testing. Use the think-aloud method — speak your thoughts as you navigate.
        </p>
      )}
    </div>
  );
}
