import { Component, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-screen-recorder',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="space-y-3 rounded-xl border border-white/10 p-4 bg-white/5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <mat-icon class="text-indigo-400">monitor</mat-icon>
          <span class="text-sm font-medium">Screen Recording</span>
        </div>
        
        <div *ngIf="status === 'recording'" class="flex items-center gap-2">
          <span *ngIf="isTranscribing" class="badge-outline">
            <mat-icon class="text-xs w-3 h-3">notes</mat-icon> Transcribing
          </span>
          <span class="badge-destructive animate-pulse">
            REC {{ formatTime(duration) }}
          </span>
        </div>

        <div *ngIf="status === 'paused'" class="badge-warning">
          PAUSED {{ formatTime(duration) }}
        </div>
      </div>

      <div *ngIf="error" class="flex items-center gap-2 text-sm text-red-400">
        <mat-icon>error</mat-icon>
        {{ error }}
      </div>

      <div *ngIf="status === 'idle'" class="space-y-3">
        <div class="flex items-center gap-3">
          <button mat-stroked-button (click)="toggleAudio()" type="button" class="border-white/10 text-white hover:bg-white/5">
            <mat-icon class="mr-1">{{ includeAudio ? 'mic' : 'mic_off' }}</mat-icon>
            {{ includeAudio ? 'Mic On' : 'Mic Off' }}
          </button>
          <span class="text-xs text-slate-400">
            {{ includeAudio ? 'Voice will be recorded + live transcribed' : 'No voice recording' }}
          </span>
        </div>
        <button mat-flat-button color="primary" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white" (click)="startRecording()" [disabled]="disabled" type="button">
          <mat-icon class="mr-1">videocam</mat-icon> Start Screen Recording
        </button>
      </div>

      <div *ngIf="status === 'recording' || status === 'paused'" class="flex items-center gap-2">
        <button *ngIf="status === 'recording'" mat-stroked-button (click)="pauseRecording()" type="button" class="border-white/10 text-white hover:bg-white/5">
          <mat-icon class="mr-1">pause</mat-icon> Pause
        </button>
        <button *ngIf="status === 'paused'" mat-stroked-button (click)="resumeRecording()" type="button" class="border-white/10 text-white hover:bg-white/5">
          <mat-icon class="mr-1">play_arrow</mat-icon> Resume
        </button>
        <button mat-flat-button color="warn" (click)="stopRecording()" type="button" class="bg-red-600 hover:bg-red-500 text-white">
          <mat-icon class="mr-1">stop</mat-icon> Stop
        </button>
      </div>

      <!-- Live transcript preview -->
      <div *ngIf="(status === 'recording' || status === 'paused') && transcript" class="p-2 bg-black/30 rounded border border-white/10 max-h-24 overflow-y-auto">
        <p class="text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">Live Transcript:</p>
        <p class="text-xs text-white leading-relaxed">{{ transcript }}</p>
      </div>

      <div *ngIf="status === 'stopped' && previewUrl" class="space-y-3">
        <video [src]="previewUrl" controls class="w-full rounded-md border border-white/10 max-h-48 bg-black"></video>
        <p class="text-xs text-slate-400">
          Duration: {{ formatTime(duration) }} • Size: {{ recordedBlob ? (recordedBlob.size / 1024 / 1024 | number:'1.1-1') : 0 }}MB
        </p>
        <div *ngIf="transcript" class="p-2 bg-black/30 rounded border border-white/10 max-h-32 overflow-y-auto">
          <p class="text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">
            Transcript ({{ transcript.split(' ').length }} words)
          </p>
          <p class="text-xs text-white leading-relaxed">{{ transcript }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button mat-stroked-button (click)="discardRecording()" type="button" class="border-red-500/30 text-red-400 hover:bg-red-500/5">
            <mat-icon class="mr-1">delete</mat-icon> Discard
          </button>
          <button mat-flat-button class="bg-indigo-600 hover:bg-indigo-500 text-white" (click)="confirmRecording()" [disabled]="disabled" type="button">
            <mat-icon class="mr-1">check</mat-icon> Use This Recording
          </button>
        </div>
      </div>

      <div *ngIf="status === 'idle' && !error" class="text-xs text-slate-500">
        Record your screen while testing. Use the think-aloud method — your voice will be transcribed in real-time for AI analysis.
      </div>
    </div>
  `,
  styles: [`
    .badge-outline {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #818cf8;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
    }
    .badge-destructive {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      background: #dc2626;
      color: white;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
    }
    .badge-warning {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      border: 1px solid #d97706;
      color: #fbbf24;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
    }
  `]
})
export class ScreenRecorderComponent implements OnDestroy {
  @Input() disabled = false;
  @Output() onRecordingComplete = new EventEmitter<{ blob: Blob; transcript: string }>();

  status: 'idle' | 'recording' | 'paused' | 'stopped' = 'idle';
  duration = 0;
  includeAudio = true;
  recordedBlob: Blob | null = null;
  previewUrl: string | null = null;
  error: string | null = null;
  transcript = '';
  isTranscribing = false;

  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private timerId: any = null;
  private stream: MediaStream | null = null;
  private recognition: any = null;
  private finalTranscriptAccumulator = '';

  ngOnDestroy() {
    this.stopAllTracks();
    this.stopSpeechRecognition();
    if (this.timerId) clearInterval(this.timerId);
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
  }

  toggleAudio() {
    this.includeAudio = !this.includeAudio;
  }

  formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  private stopAllTracks() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }

  private startSpeechRecognition() {
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
      let finalTranscript = this.finalTranscriptAccumulator;
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
          this.finalTranscriptAccumulator = finalTranscript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      this.transcript = finalTranscript + interimTranscript;
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        console.warn('Speech recognition error:', event.error);
      }
    };

    recognition.onend = () => {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        try {
          recognition.start();
        } catch { /* already started */ }
      }
    };

    try {
      recognition.start();
      this.recognition = recognition;
      this.isTranscribing = true;
    } catch (e) {
      console.warn('Could not start speech recognition:', e);
    }
  }

  private stopSpeechRecognition() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch { /* already stopped */ }
      this.recognition = null;
      this.isTranscribing = false;
    }
  }

  async startRecording() {
    this.error = null;
    this.chunks = [];
    this.finalTranscriptAccumulator = '';
    this.transcript = '';

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true
      });

      let combinedStream = screenStream;

      if (this.includeAudio) {
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
            ...dest.stream.getAudioTracks()
          ]);

          screenStream.getVideoTracks()[0].addEventListener('ended', () => {
            micStream.getTracks().forEach(t => t.stop());
          });
        } catch {
          // Mic denied, continue with screen only
        }
      }

      this.stream = combinedStream;

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm';

      const recorder = new MediaRecorder(combinedStream, { mimeType });
      this.mediaRecorder = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: mimeType });
        this.recordedBlob = blob;
        const url = URL.createObjectURL(blob);
        if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
        this.previewUrl = url;
        this.status = 'stopped';
        this.stopAllTracks();
        this.stopSpeechRecognition();
        if (this.timerId) clearInterval(this.timerId);
        this.transcript = this.finalTranscriptAccumulator.trim();
      };

      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        if (recorder.state !== 'inactive') recorder.stop();
      });

      recorder.start(1000);
      this.status = 'recording';
      this.duration = 0;
      this.timerId = setInterval(() => this.duration++, 1000);

      if (this.includeAudio) {
        this.startSpeechRecognition();
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        this.error = 'Screen sharing was cancelled.';
      } else {
        this.error = 'Failed to start recording. Please try again.';
      }
      this.stopAllTracks();
      this.stopSpeechRecognition();
    }
  }

  pauseRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.status = 'paused';
      if (this.timerId) clearInterval(this.timerId);
      this.stopSpeechRecognition();
    }
  }

  resumeRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.status = 'recording';
      this.timerId = setInterval(() => this.duration++, 1000);
      if (this.includeAudio) this.startSpeechRecognition();
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  discardRecording() {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.recordedBlob = null;
    this.previewUrl = null;
    this.status = 'idle';
    this.duration = 0;
    this.transcript = '';
    this.finalTranscriptAccumulator = '';
  }

  confirmRecording() {
    if (this.recordedBlob) {
      this.onRecordingComplete.emit({ blob: this.recordedBlob, transcript: this.transcript });
    }
  }
}
