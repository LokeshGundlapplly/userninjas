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
  AlertCircle,
  FileText
} from 'lucide-react';

interface ScreenRecorderProps {
  onRecordingComplete: (blob: Blob, transcript: string) => void;
  disabled?: boolean;
}

export default function ScreenRecorder({ onRecordingComplete, disabled }: ScreenRecorderProps) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
  const [duration, setDuration] = useState(0);
  const [includeAudio, setIncludeAudio] = useState(true);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef('');

  useEffect(() => {
    return () => {
      stopAllTracks();
      stopSpeechRecognition();
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  const stopAllTracks = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = transcriptRef.current;
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
          transcriptRef.current = finalTranscript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        console.warn('Speech recognition error:', event.error);
      }
    };

    recognition.onend = () => {
      // Restart if still recording
      if (mediaRecorderRef.current?.state === 'recording') {
        try {
          recognition.start();
        } catch { /* already started */ }
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsTranscribing(true);
    } catch (e) {
      console.warn('Could not start speech recognition:', e);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch { /* already stopped */ }
      recognitionRef.current = null;
      setIsTranscribing(false);
    }
  };

  const startRecording = useCallback(async () => {
    setError(null);
    chunksRef.current = [];
    transcriptRef.current = '';
    setTranscript('');

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
      });

      let combinedStream = screenStream;

      if (includeAudio) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const ctx = new AudioContext();
          const dest = ctx.createMediaStreamDestination();

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
        stopSpeechRecognition();
        if (timerRef.current) clearInterval(timerRef.current);
        // Finalize transcript
        setTranscript(transcriptRef.current.trim());
      };

      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        if (recorder.state !== 'inactive') recorder.stop();
      });

      recorder.start(1000);
      setStatus('recording');
      setDuration(0);
      timerRef.current = window.setInterval(() => setDuration(d => d + 1), 1000);

      // Start live transcription
      if (includeAudio) {
        startSpeechRecognition();
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Screen sharing was cancelled.');
      } else {
        setError('Failed to start recording. Please try again.');
      }
      stopAllTracks();
      stopSpeechRecognition();
    }
  }, [includeAudio, previewUrl]);

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setStatus('paused');
      if (timerRef.current) clearInterval(timerRef.current);
      stopSpeechRecognition();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setStatus('recording');
      timerRef.current = window.setInterval(() => setDuration(d => d + 1), 1000);
      if (includeAudio) startSpeechRecognition();
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
    setTranscript('');
    transcriptRef.current = '';
  };

  const confirmRecording = () => {
    if (recordedBlob) {
      onRecordingComplete(recordedBlob, transcript);
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
          <div className="flex items-center gap-2">
            {isTranscribing && (
              <Badge variant="outline" className="text-xs border-primary/40 text-primary">
                <FileText className="h-3 w-3 mr-1" />
                Transcribing
              </Badge>
            )}
            <Badge variant="destructive" className="animate-pulse flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-white" />
              REC {formatTime(duration)}
            </Badge>
          </div>
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
              {includeAudio ? 'Voice will be recorded + live transcribed' : 'No voice recording'}
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

      {/* Live transcript preview during recording */}
      {(status === 'recording' || status === 'paused') && transcript && (
        <div className="p-2 bg-background/50 rounded border border-border/50 max-h-24 overflow-y-auto">
          <p className="text-xs text-muted-foreground mb-1 font-medium">Live Transcript:</p>
          <p className="text-xs text-foreground">{transcript}</p>
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
          {transcript && (
            <div className="p-2 bg-background/50 rounded border border-border/50 max-h-32 overflow-y-auto">
              <p className="text-xs text-muted-foreground mb-1 font-medium flex items-center gap-1">
                <FileText className="h-3 w-3" /> Transcript ({transcript.split(' ').length} words)
              </p>
              <p className="text-xs text-foreground">{transcript}</p>
            </div>
          )}
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
          Record your screen while testing. Use the think-aloud method — your voice will be transcribed in real-time for AI analysis.
        </p>
      )}
    </div>
  );
}
