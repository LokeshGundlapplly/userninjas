import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type InterviewPhase =
  | 'idle'
  | 'checking'
  | 'ineligible'
  | 'ready'
  | 'starting'
  | 'active'
  | 'completing'
  | 'done'
  | 'error';

export interface TranscriptEntry {
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  frame_captured?: boolean;
}

export interface FrictionPoint {
  title: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  quote?: string;
}

export interface UXInsight {
  category: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  evidence?: string;
}

export interface InterviewReport {
  friction_points: FrictionPoint[];
  insights: UXInsight[];
  key_quotes: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  summary: string;
  session_id: string;
}

export interface EligibilityResult {
  eligible: boolean;
  reason: string;
  match_score: number;
  missing_criteria?: string[];
}

interface UseAIInterviewerOptions {
  testId: string;
  estimatedDuration?: number; // minutes
  onError?: (msg: string) => void;
}

export function useAIInterviewer({ testId, estimatedDuration, onError }: UseAIInterviewerOptions) {
  const [phase, setPhase] = useState<InterviewPhase>('idle');
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [aiTyping, setAiTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null); // seconds

  // Refs for screen capture
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingFrameRef = useRef<string | null>(null);

  // Refs for duration timer
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScreenCapture();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reportError = useCallback(
    (msg: string) => {
      setError(msg);
      setPhase('error');
      onError?.(msg);
    },
    [onError]
  );

  // ─── Step 1: Check Eligibility ───────────────────────────────────────────────
  const checkEligibility = useCallback(async () => {
    setPhase('checking');
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-eligibility-check', {
        body: { test_id: testId },
      });
      if (fnError) throw new Error(fnError.message || 'Eligibility check failed');

      const result: EligibilityResult = data;
      setEligibility(result);
      setPhase(result.eligible ? 'ready' : 'ineligible');
    } catch (err) {
      reportError(err instanceof Error ? err.message : 'Eligibility check failed');
    }
  }, [testId, reportError]);

  // ─── Step 2: Create DB session ───────────────────────────────────────────────
  const createSession = useCallback(async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error: insertErr } = await (supabase
      .from as any)('ai_interview_sessions')
      .insert({
        test_id: testId,
        tester_id: user.id,
        status: 'pending',
        eligible: true,
        eligibility_reason: eligibility?.reason ?? null,
      })
      .select('id')
      .single();

    if (insertErr || !data) {
      reportError('Failed to create interview session');
      return null;
    }
    return data.id;
  }, [testId, eligibility, reportError]);

  // ─── Step 3: Screen capture helpers ─────────────────────────────────────────
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = 640;
    canvas.height = 360;
    ctx.drawImage(video, 0, 0, 640, 360);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.55);
    const base64 = dataUrl.split(',')[1];
    return base64 || null;
  }, []);

  const stopScreenCapture = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [screenStream]);

  const startScreenCapture = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 5 },
        },
      });

      // Attach to hidden video element
      if (!videoRef.current) {
        videoRef.current = document.createElement('video');
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
      }
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }

      setScreenStream(stream);

      // Capture a frame every 5 seconds and store in pendingFrameRef
      frameIntervalRef.current = setInterval(() => {
        const frame = captureFrame();
        if (frame) pendingFrameRef.current = frame;
      }, 5000);

      // Handle user stopping share from browser UI
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenCapture();
      });

      return stream;
    } catch (err) {
      // User denied or cancelled — not a hard error
      console.warn('Screen share not available:', err);
      return null;
    }
  }, [captureFrame, stopScreenCapture]);

  // ─── Step 4: Send message to AI ──────────────────────────────────────────────
  const callInterviewSession = useCallback(
    async (sid: string, message?: string): Promise<{ reply: string; should_end: boolean } | null> => {
      // Pop pending frame (consume once per message)
      const frame = pendingFrameRef.current;
      pendingFrameRef.current = null;

      const { data, error: fnError } = await supabase.functions.invoke('ai-interview-session', {
        body: {
          session_id: sid,
          message: message ?? undefined,
          frame_base64: frame ?? undefined,
        },
      });

      if (fnError) throw new Error(fnError.message || 'Session error');
      return data;
    },
    []
  );

  // ─── Step 5: Start interview ─────────────────────────────────────────────────
  const startInterview = useCallback(async () => {
    setPhase('starting');
    setError(null);

    try {
      // Create DB session
      const sid = await createSession();
      if (!sid) return;
      setSessionId(sid);

      // Attempt screen share (non-blocking — proceed even if denied)
      await startScreenCapture();

      // Get initial AI greeting
      setAiTyping(true);
      const result = await callInterviewSession(sid);
      setAiTyping(false);

      if (!result) throw new Error('No response from AI interviewer');

      const now = new Date().toISOString();
      setTranscript([{ role: 'ai', content: result.reply, timestamp: now }]);
      setPhase('active');

      // Start duration countdown timer
      if (estimatedDuration && estimatedDuration > 0) {
        const totalSeconds = estimatedDuration * 60;
        startTimeRef.current = Date.now();
        setTimeRemaining(totalSeconds);
        timerIntervalRef.current = setInterval(() => {
          const elapsed = Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
          const remaining = totalSeconds - elapsed;
          if (remaining <= 0) {
            clearInterval(timerIntervalRef.current!);
            timerIntervalRef.current = null;
            setTimeRemaining(0);
          } else {
            setTimeRemaining(remaining);
          }
        }, 1000);
      }
    } catch (err) {
      setAiTyping(false);
      reportError(err instanceof Error ? err.message : 'Failed to start interview');
    }
  }, [createSession, startScreenCapture, callInterviewSession, reportError]);

  // ─── Step 6: Send a message ──────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      if (!sessionId || phase !== 'active' || !text.trim()) return;

      setAiTyping(true);

      // Optimistically add user message to transcript
      const userEntry: TranscriptEntry = {
        role: 'user',
        content: text.trim(),
        timestamp: new Date().toISOString(),
      };
      setTranscript((prev) => [...prev, userEntry]);

      try {
        const result = await callInterviewSession(sessionId, text.trim());
        setAiTyping(false);

        if (!result) throw new Error('No response from AI interviewer');

        const aiEntry: TranscriptEntry = {
          role: 'ai',
          content: result.reply,
          timestamp: new Date().toISOString(),
        };
        setTranscript((prev) => [...prev, aiEntry]);
        setExchangeCount((c) => c + 1);

        if (result.should_end) {
          // Give tester a moment to read the closing message, then auto-generate report
          setTimeout(() => generateReport(sessionId), 2500);
        }
      } catch (err) {
        setAiTyping(false);
        reportError(err instanceof Error ? err.message : 'Failed to send message');
      }
    },
    [sessionId, phase, callInterviewSession, reportError]
  );

  // ─── Step 7: Generate report ─────────────────────────────────────────────────
  const generateReport = useCallback(
    async (sid?: string) => {
      const targetSid = sid || sessionId;
      if (!targetSid) return;

      // Clear the duration timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      setPhase('completing');
      stopScreenCapture();

      try {
        const { data, error: fnError } = await supabase.functions.invoke('ai-interview-report', {
          body: { session_id: targetSid },
        });
        if (fnError) throw new Error(fnError.message || 'Report generation failed');

        const reportData: InterviewReport = data;
        setReport(reportData);
        setPhase('done');
      } catch (err) {
        reportError(err instanceof Error ? err.message : 'Report generation failed');
      }
    },
    [sessionId, stopScreenCapture, reportError]
  );

  // ─── Step 8: Manual end interview ────────────────────────────────────────────
  const endInterview = useCallback(async () => {
    if (!sessionId) return;

    // Mark session as abandoned if ending early
    if (phase === 'active' && transcript.length < 4) {
      await (supabase
        .from as any)('ai_interview_sessions')
        .update({ status: 'abandoned' })
        .eq('id', sessionId);
      stopScreenCapture();
      setPhase('idle');
      return;
    }

    await generateReport();
  }, [sessionId, phase, transcript.length, generateReport, stopScreenCapture]);

  // ─── Reset ────────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    startTimeRef.current = null;
    stopScreenCapture();
    setPhase('idle');
    setEligibility(null);
    setTranscript([]);
    setSessionId(null);
    setTimeRemaining(null);
    setReport(null);
    setAiTyping(false);
    setError(null);
    setExchangeCount(0);
    pendingFrameRef.current = null;
  }, [stopScreenCapture]);

  return {
    phase,
    eligibility,
    transcript,
    sessionId,
    report,
    aiTyping,
    error,
    screenStream,
    exchangeCount,
    timeRemaining,
    estimatedDuration,
    checkEligibility,
    startInterview,
    sendMessage,
    endInterview,
    generateReport,
    reset,
  };
}
