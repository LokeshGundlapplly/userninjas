import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Background3D from '@/components/Background3D';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  AlertCircle,
  TrendingUp,
  Wallet,
  FileText,
  Send,
  Upload,
  X,
  Image,
  Film,
  Star,
  Target,
  Sparkles,
  ArrowRight,
  Settings,
  Bot,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  MapPin,
  Smartphone,
  Heart,
  Save,
  Edit,
  Trophy,
  Award,
  Video,
} from 'lucide-react';
import StarRating from '@/components/StarRating';
import ScrollReveal from '@/components/ScrollReveal';
import ScreenRecorder from '@/components/ScreenRecorder';
import AIInterviewerModal from '@/components/AIInterviewerModal';
import AIInterviewReport from '@/components/AIInterviewReport';
import { useAIInterviewer } from '@/hooks/useAIInterviewer';
import ScreenerGate from '@/components/ScreenerGate';
import TesterSurveyFlow from '@/components/TesterSurveyFlow';
import { format } from 'date-fns';

interface Test {
  id: string;
  title: string;
  description: string;
  requirements: string;
  reward_amount: number;
  estimated_duration: number;
  category: string;
  status: string;
  created_at: string;
  target_audience: any;
  device_targeting: string[] | null;
  test_type: string | null;
}

interface TesterProfile {
  age: number | null;
  gender: string | null;
  location: string | null;
  devices: string[] | null;
  interests: string[] | null;
}

function calculateMatchScore(test: Test, profile: TesterProfile | null): number {
  if (!profile) return 50; // default mid-score if no profile
  let score = 50;
  let factors = 0;

  // Device match
  if (test.device_targeting && test.device_targeting.length > 0 && profile.devices && profile.devices.length > 0) {
    const deviceMatch = test.device_targeting.some(d => 
      profile.devices!.some(pd => pd.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(pd.toLowerCase()))
    );
    score += deviceMatch ? 20 : -10;
    factors++;
  }

  // Location match
  const targetAudience = test.target_audience as Record<string, any> | null;
  if (targetAudience?.location && profile.location) {
    const targetLoc = String(targetAudience.location).toLowerCase();
    const profLoc = profile.location.toLowerCase();
    if (targetLoc.includes(profLoc) || profLoc.includes(targetLoc) || targetLoc === 'any') {
      score += 15;
    } else {
      score -= 5;
    }
    factors++;
  }

  // Age match
  if (targetAudience?.minAge && targetAudience?.maxAge && profile.age) {
    if (profile.age >= Number(targetAudience.minAge) && profile.age <= Number(targetAudience.maxAge)) {
      score += 15;
    } else {
      score -= 10;
    }
    factors++;
  }

  // Gender match
  if (targetAudience?.gender && profile.gender) {
    const targetGender = String(targetAudience.gender).toLowerCase();
    if (targetGender === 'any' || targetGender === profile.gender.toLowerCase()) {
      score += 10;
    } else {
      score -= 5;
    }
    factors++;
  }

  // Interest/category match
  if (test.category && profile.interests && profile.interests.length > 0) {
    const catLower = test.category.toLowerCase();
    const interestMatch = profile.interests.some(i => 
      i.toLowerCase().includes(catLower) || catLower.includes(i.toLowerCase())
    );
    if (interestMatch) score += 15;
    factors++;
  }

  // Boost if no targeting (open to all)
  if (factors === 0) score = 70;

  return Math.max(0, Math.min(100, score));
}

interface Submission {
  id: string;
  test_id: string;
  status: string;
  feedback: string | null;
  rating: number | null;
  submitted_at: string | null;
  created_at: string;
  tests: {
    title: string;
    reward_amount: number;
  };
}

// ─── AI Interview Button (own hook instance per test) ─────────────────────────
function AIInterviewButton({ testId, testTitle, estimatedDuration }: { testId: string; testTitle: string; estimatedDuration?: number }) {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const interviewer = useAIInterviewer({
    testId,
    estimatedDuration,
    onError: (msg) =>
      toast({ title: 'Interview error', description: msg, variant: 'destructive' }),
  });

  const handleModalOpen = () => {
    setModalOpen(true);
    // Auto-start eligibility check when opening
    if (interviewer.phase === 'idle') {
      interviewer.checkEligibility();
    }
  };

  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open && interviewer.phase === 'done' && interviewer.report) {
      setReportOpen(true);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="w-full sm:w-auto gap-1.5 border-primary/40 text-primary hover:bg-primary/5"
        onClick={handleModalOpen}
      >
        <Bot className="h-3.5 w-3.5" />
        AI Interview
      </Button>

      <AIInterviewerModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        testTitle={testTitle}
        phase={interviewer.phase}
        eligibility={interviewer.eligibility}
        transcript={interviewer.transcript}
        aiTyping={interviewer.aiTyping}
        error={interviewer.error}
        screenStream={interviewer.screenStream}
        exchangeCount={interviewer.exchangeCount}
        timeRemaining={interviewer.timeRemaining}
        estimatedDuration={interviewer.estimatedDuration}
        onCheckEligibility={interviewer.checkEligibility}
        onStartInterview={interviewer.startInterview}
        onSendMessage={interviewer.sendMessage}
        onEndInterview={interviewer.endInterview}
        onReset={interviewer.reset}
      />

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Your UX Interview Report
            </DialogTitle>
            <DialogDescription>
              AI-generated insights from your interview session for "{testTitle}".
            </DialogDescription>
          </DialogHeader>
          {interviewer.report && (
            <AIInterviewReport
              report={interviewer.report}
              testTitle={testTitle}
              onClose={() => {
                setReportOpen(false);
                interviewer.reset();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface Earning {
  id: string;
  amount: number;
  status: string;
  description: string | null;
  created_at: string;
}

interface Profile {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  age: number | null;
  gender: string | null;
  location: string | null;
  bio: string | null;
  devices: string[] | null;
  interests: string[] | null;
}

interface StudySlot {
  id: string;
  test_id: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface ScheduledSession {
  id: string;
  slot_id: string;
  test_id: string;
  tester_id: string;
  meeting_url: string | null;
  status: string;
  created_at: string;
  tests?: { title: string; reward_amount: number; meeting_link: string | null; estimated_duration: number } | null;
  study_slots?: { start_time: string; end_time: string } | null;
}

type Section = 'overview' | 'available' | 'my_tests' | 'earnings' | 'schedule' | 'profile';

const SIDEBAR_ITEMS: { key: Section; label: string; icon: typeof LayoutGrid }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'available', label: 'Available Tests', icon: FileText },
  { key: 'my_tests', label: 'My Tests', icon: Target },
  { key: 'earnings', label: 'Earnings', icon: Wallet },
  { key: 'schedule', label: 'Schedule', icon: Calendar },
  { key: 'profile', label: 'Profile', icon: User },
];

export default function TesterDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Layout
  const [section, setSection] = useState<Section>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Data
  const [tests, setTests] = useState<Test[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [testerProfile, setTesterProfile] = useState<TesterProfile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>([]);
  
  // Submission flow state
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Screen recording state
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingTranscript, setRecordingTranscript] = useState('');

  // Screener gate state
  const [screenerTest, setScreenerTest] = useState<Test | null>(null);
  const [screenerDialogOpen, setScreenerDialogOpen] = useState(false);

  // Survey flow state
  const [surveyTest, setSurveyTest] = useState<{ testId: string; submissionId: string } | null>(null);
  const [surveyDialogOpen, setSurveyDialogOpen] = useState(false);

  // Scheduling state
  const [schedulingTest, setSchedulingTest] = useState<Test | null>(null);
  const [availableSlots, setAvailableSlots] = useState<StudySlot[]>([]);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [bookingSlot, setBookingSlot] = useState(false);

  // Profile editing state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    age: '',
    gender: '',
    location: '',
    bio: '',
    devices: [] as string[],
    interests: [] as string[],
    newInterest: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && user && role && role !== 'tester') {
      navigate('/');
      toast({
        title: 'Access denied',
        description: 'This dashboard is only for testers.',
        variant: 'destructive',
      });
    }
  }, [user, role, authLoading, navigate, toast]);

  useEffect(() => {
    if (user && role === 'tester') {
      fetchData();
    }
  }, [user, role]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch tester profile for matching
      const { data: profileData } = await supabase
        .from('profiles')
        .select('age, gender, location, devices, interests')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setTesterProfile(profileData || null);

      // Fetch full profile for profile section
      const { data: fullProfile } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url, created_at, age, gender, location, bio, devices, interests')
        .eq('user_id', user.id)
        .single();
      setProfile(fullProfile);

      // Fetch available tests
      const { data: testsData, error: testsError } = await supabase
        .from('tests')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (testsError) throw testsError;
      
      // Sort tests by match score (highest first)
      const scored = (testsData || []).map(t => ({
        ...t,
        _matchScore: calculateMatchScore(t as Test, profileData || null),
      }));
      scored.sort((a, b) => b._matchScore - a._matchScore);
      setTests(scored as any);

      // Fetch user's submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('test_submissions')
        .select(`
          *,
          tests (title, reward_amount)
        `)
        .eq('tester_id', user.id)
        .order('created_at', { ascending: false });

      if (submissionsError) throw submissionsError;
      setSubmissions(submissionsData || []);

      // Fetch user's earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('earnings')
        .select('*')
        .eq('tester_id', user.id)
        .order('created_at', { ascending: false });

      if (earningsError) throw earningsError;
      setEarnings(earningsData || []);

      // Fetch scheduled sessions
      const { data: sessionsData } = await (supabase as any)
        .from('scheduled_sessions')
        .select('*, tests(title, reward_amount, meeting_link, estimated_duration), study_slots(start_time, end_time)')
        .eq('tester_id', user.id)
        .order('created_at', { ascending: false });
      setScheduledSessions((sessionsData as ScheduledSession[]) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Start test flow — route through screener gate first
  const initiateTest = (test: Test) => {
    const alreadyStarted = submissions.some(s => s.test_id === test.id);
    if (alreadyStarted) {
      toast({ title: 'Already started', description: 'You have already started this test.', variant: 'destructive' });
      return;
    }
    setScreenerTest(test);
    setScreenerDialogOpen(true);
  };

  const handleScreenerPass = async () => {
    if (!screenerTest) return;
    setScreenerDialogOpen(false);

    // For AI interview type, the AIInterviewButton handles its own flow
    if (screenerTest.test_type === 'ai_interview') {
      setScreenerTest(null);
      return;
    }

    // Create submission
    await startTest(screenerTest.id);
    setScreenerTest(null);
  };

  const startTest = async (testId: string) => {
    try {
      const { data: insertedData, error } = await supabase
        .from('test_submissions')
        .insert({
          test_id: testId,
          tester_id: user!.id,
          status: 'in_progress',
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already started',
            description: 'You have already started this test.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: 'Test started!',
        description: 'Good luck with your test.',
      });

      // Notify recruiter of new submission (non-blocking)
      const matchedTest = tests.find(t => t.id === testId);

      // If it's a survey, open survey flow immediately
      if (matchedTest?.test_type === 'survey' && insertedData) {
        setSurveyTest({ testId, submissionId: insertedData.id });
        setSurveyDialogOpen(true);
      }

      fetchData();
    } catch (error) {
      console.error('Error starting test:', error);
      toast({
        title: 'Error',
        description: 'Failed to start the test.',
        variant: 'destructive',
      });
    }
  };

  const openSubmitDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setFeedbackText(submission.feedback || '');
    setUploadedFiles([]);
    setRecordingBlob(null);
    setRecordingTranscript('');
    setSubmitDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
    
    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 10MB limit.`,
          variant: 'destructive',
        });
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not a supported format. Use images (JPG, PNG, GIF, WebP) or videos (MP4, WebM).`,
          variant: 'destructive',
        });
        return;
      }
      validFiles.push(file);
    });
    
    if (uploadedFiles.length + validFiles.length > 5) {
      toast({
        title: 'Too many files',
        description: 'Maximum 5 files allowed per submission.',
        variant: 'destructive',
      });
      return;
    }
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<{ attachmentUrls: string[]; recordingUrl: string | null }> => {
    if (!user || !selectedSubmission) return { attachmentUrls: [], recordingUrl: null };
    
    const urls: string[] = [];
    
    for (const file of uploadedFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${selectedSubmission.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('submission-attachments')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('submission-attachments')
        .getPublicUrl(fileName);
      
      urls.push(publicUrl);
    }
    
    // Upload screen recording if present
    let recordingUrl: string | null = null;
    if (recordingBlob) {
      const recName = `${user.id}/${selectedSubmission.id}/recording-${Date.now()}.webm`;
      const { error } = await supabase.storage
        .from('submission-attachments')
        .upload(recName, recordingBlob);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('submission-attachments')
        .getPublicUrl(recName);
      
      recordingUrl = publicUrl;
    }
    
    return { attachmentUrls: urls, recordingUrl };
  };

  const submitTest = async () => {
    if (!selectedSubmission) return;
    
    if (!feedbackText.trim()) {
      toast({
        title: 'Feedback required',
        description: 'Please provide feedback about your testing experience.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      // Upload files and recording
      setUploading(true);
      const { attachmentUrls, recordingUrl } = await uploadFiles();
      setUploading(false);
      
      const { error } = await supabase
        .from('test_submissions')
        .update({
          status: 'submitted',
          feedback: feedbackText.trim(),
          submitted_at: new Date().toISOString(),
          attachments: attachmentUrls,
          recording_url: recordingUrl,
          transcript: recordingTranscript || null,
        } as any)
        .eq('id', selectedSubmission.id);

      if (error) throw error;

      toast({
        title: 'Test submitted!',
        description: 'Your test has been submitted for review.',
      });
      
      setSubmitDialogOpen(false);
      setSelectedSubmission(null);
      setFeedbackText('');
      setUploadedFiles([]);
      setRecordingBlob(null);
      setRecordingTranscript('');
      fetchData();
    } catch (error) {
      console.error('Error submitting test:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit the test.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  // ─── Scheduling Handlers ──────────────────────────────────

  const openScheduleDialog = async (test: Test) => {
    setSchedulingTest(test);
    setBookingSlot(false);
    try {
      const { data, error } = await (supabase as any)
        .from('study_slots')
        .select('*')
        .eq('test_id', test.id)
        .eq('status', 'available')
        .gt('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });
      if (error) throw error;
      setAvailableSlots((data as StudySlot[]) || []);
      setScheduleDialogOpen(true);
    } catch (err) {
      console.error('Error fetching slots:', err);
      toast({ title: 'Error', description: 'Could not load available time slots.', variant: 'destructive' });
    }
  };

  const bookSlot = async (slot: StudySlot) => {
    if (!user || !schedulingTest) return;
    setBookingSlot(true);
    try {
      // Update slot to booked with optimistic race protection
      const { data: bookedSlot, error: slotError } = await (supabase as any)
        .from('study_slots')
        .update({
          status: 'booked',
          booked_by: user.id,
          booked_at: new Date().toISOString(),
        })
        .eq('id', slot.id)
        .eq('status', 'available')
        .select('id')
        .maybeSingle();
      if (slotError) throw slotError;
      if (!bookedSlot) {
        throw new Error('This slot was just booked by another tester. Please choose a different slot.');
      }

      // Attempt to create Zoom meeting (non-blocking — falls back to static link)
      let zoomJoinUrl: string | null = (schedulingTest as any).meeting_link || null;
      let zoomMeetingId: string | null = null;
      let zoomPassword: string | null = null;

      try {
        const { data: zoomData } = await supabase.functions.invoke('create-zoom-meeting', {
          body: {
            topic: `User Research: ${schedulingTest.title}`,
            duration: schedulingTest.estimated_duration || 60,
            startTime: slot.start_time,
          },
        });
        if (zoomData?.success && !zoomData?.placeholder) {
          zoomJoinUrl = zoomData.joinUrl;
          zoomMeetingId = zoomData.meetingId;
          zoomPassword = zoomData.password;
        }
      } catch {
        // Zoom creation failed — fall back to static meeting_link
      }

      // Create scheduled session with Zoom info
      const { error: sessionError } = await (supabase as any)
        .from('scheduled_sessions')
        .insert({
          slot_id: slot.id,
          test_id: schedulingTest.id,
          tester_id: user.id,
          meeting_url: zoomJoinUrl,
          zoom_meeting_id: zoomMeetingId,
          zoom_join_url: zoomJoinUrl,
          zoom_password: zoomPassword,
          status: 'scheduled',
        });
      if (sessionError) throw sessionError;

      // Also create a test submission (in_progress) for this moderated test
      const existing = submissions.find(s => s.test_id === schedulingTest.id);
      if (!existing) {
        await supabase.from('test_submissions').insert({
          test_id: schedulingTest.id,
          tester_id: user.id,
          status: 'in_progress',
        });
      }

      // Send rich scheduling confirmation email
      try {
        const dateStr = format(new Date(slot.start_time), 'EEEE, MMMM d, yyyy');
        const startTimeStr = format(new Date(slot.start_time), 'h:mm a');
        const endTimeStr = format(new Date(slot.end_time), 'h:mm a');
        const incentiveStr = `$${Number(schedulingTest.reward_amount).toFixed(2)}`;
        const durationStr = `${schedulingTest.estimated_duration || 60} minutes`;
        const meetingBlock = zoomJoinUrl
          ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:16px 0;">
              <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#16a34a;">🔗 Meeting Link Ready</p>
              <a href="${zoomJoinUrl}" style="color:#6366f1;font-size:14px;word-break:break-all;">${zoomJoinUrl}</a>
              ${zoomPassword ? `<p style="margin:8px 0 0;font-size:13px;color:#4b5563;"><strong>Password:</strong> ${zoomPassword}</p>` : ''}
              <p style="margin:8px 0 0;font-size:12px;color:#6b7280;">Click the link at the scheduled time to join.</p>
            </div>`
          : `<div style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:16px;margin:16px 0;">
              <p style="margin:0;font-size:14px;color:#92400e;">📩 Meeting link will be provided by the recruiter before the session.</p>
            </div>`;

        await supabase.functions.invoke('send-email', {
          body: {
            to: user.email,
            subject: `📅 Study Confirmed: ${schedulingTest.title} — User Ninjas`,
            html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:40px 32px;text-align:center;">
    <div style="font-size:36px;margin-bottom:12px;">📅</div>
    <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">Study Session Confirmed!</h1>
    <p style="color:#e0e7ff;margin:8px 0 0;font-size:16px;">${schedulingTest.title}</p>
  </div>

  <!-- Body -->
  <div style="padding:32px;">
    <p style="font-size:16px;color:#1f2937;margin:0 0 24px;">
      Great news! Your moderated study session is confirmed. Here are the full details:
    </p>

    <!-- Session Details -->
    <div style="background:#f8f7ff;border-radius:12px;padding:24px;margin:0 0 20px;">
      <h2 style="margin:0 0 16px;font-size:16px;color:#4f46e5;">Session Details</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#6b7280;width:40%;">📅 Date</td>
          <td style="padding:6px 0;font-size:14px;font-weight:600;color:#111827;">${dateStr}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#6b7280;">🕐 Time</td>
          <td style="padding:6px 0;font-size:14px;font-weight:600;color:#111827;">${startTimeStr} – ${endTimeStr}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#6b7280;">⏱ Duration</td>
          <td style="padding:6px 0;font-size:14px;font-weight:600;color:#111827;">${durationStr}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#6b7280;">💰 Incentive</td>
          <td style="padding:6px 0;font-size:14px;font-weight:700;color:#16a34a;">${incentiveStr}</td>
        </tr>
        ${schedulingTest.category ? `<tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">📂 Category</td><td style="padding:6px 0;font-size:14px;color:#111827;">${schedulingTest.category}</td></tr>` : ''}
      </table>
    </div>

    ${meetingBlock}

    <!-- Tips -->
    <div style="border-left:3px solid #6366f1;padding-left:16px;margin:20px 0;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#374151;">Tips for a great session:</p>
      <ul style="margin:0;padding-left:16px;font-size:13px;color:#6b7280;line-height:1.7;">
        <li>Join 2–3 minutes early to test your audio/video</li>
        <li>Find a quiet environment with good lighting</li>
        <li>Close unnecessary browser tabs and apps</li>
        <li>Think aloud as you use the product</li>
      </ul>
    </div>

    <p style="font-size:13px;color:#9ca3af;margin:20px 0 0;">
      Need to reschedule? Visit your <a href="${window.location.origin}/tester" style="color:#6366f1;">dashboard</a> or reply to this email.
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="font-size:13px;color:#9ca3af;margin:0;">
      © ${new Date().getFullYear()} User Ninjas · <a href="${window.location.origin}" style="color:#6366f1;">userninjas.in</a>
    </p>
  </div>

</div>
</body></html>`,
          },
        });
      } catch {
        // Email is non-blocking
      }

      toast({ title: 'Session booked!', description: `You're scheduled for ${format(new Date(slot.start_time), 'MMM d, h:mm a')}.` });
      setScheduleDialogOpen(false);
      setSchedulingTest(null);
      fetchData();
    } catch (err: any) {
      toast({ title: 'Booking failed', description: err.message || 'Could not book the slot.', variant: 'destructive' });
    } finally {
      setBookingSlot(false);
    }
  };

  // ─── Profile Handlers ──────────────────────────────────────

  const startEditing = () => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        age: profile.age?.toString() || '',
        gender: profile.gender || '',
        location: profile.location || '',
        bio: profile.bio || '',
        devices: profile.devices || [],
        interests: profile.interests || [],
        newInterest: '',
      });
    }
    setEditing(true);
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name || null,
          age: editForm.age ? parseInt(editForm.age) : null,
          gender: editForm.gender || null,
          location: editForm.location || null,
          bio: editForm.bio || null,
          devices: editForm.devices,
          interests: editForm.interests,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({ title: 'Profile updated', description: 'Your demographics have been saved.' });
      setEditing(false);
      fetchData();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({ title: 'Error', description: 'Failed to save profile.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleDevice = (device: string) => {
    setEditForm(prev => ({
      ...prev,
      devices: prev.devices.includes(device) ? prev.devices.filter(d => d !== device) : [...prev.devices, device],
    }));
  };

  const addInterest = () => {
    const interest = editForm.newInterest.trim();
    if (interest && !editForm.interests.includes(interest)) {
      setEditForm(prev => ({ ...prev, interests: [...prev.interests, interest], newInterest: '' }));
    }
  };

  const removeInterest = (interest: string) => {
    setEditForm(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
  };

  // ─── Computed Values ──────────────────────────────────────

  const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
  const pendingEarnings = earnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + Number(e.amount), 0);
  const paidEarnings = earnings.filter(e => e.status === 'paid').reduce((sum, e) => sum + Number(e.amount), 0);
  const completedTests = submissions.filter(s => s.status === 'approved').length;
  const inProgressTests = submissions.filter(s => s.status === 'in_progress').length;
  
  // Calculate average rating for reputation
  const ratedSubmissions = submissions.filter(s => s.rating !== null && s.rating > 0);
  const averageRating = ratedSubmissions.length > 0 
    ? ratedSubmissions.reduce((sum, s) => sum + (s.rating || 0), 0) / ratedSubmissions.length 
    : 0;

  const rejectedTests = submissions.filter(s => s.status === 'rejected').length;
  const submittedTests = submissions.filter(s => s.status === 'submitted').length;
  const completionRate = submissions.length > 0 ? ((completedTests / (completedTests + rejectedTests)) * 100) || 0 : 0;
  const upcomingSessions = scheduledSessions.filter(s => s.status === 'scheduled').length;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: ratedSubmissions.filter(s => s.rating === rating).length,
    percentage: ratedSubmissions.length > 0 ? (ratedSubmissions.filter(s => s.rating === rating).length / ratedSubmissions.length) * 100 : 0,
  }));

  const categoryStats = submissions.reduce((acc, s) => {
    const cat = (s.tests as any)?.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = { total: 0, approved: 0 };
    acc[cat].total++;
    if (s.status === 'approved') acc[cat].approved++;
    return acc;
  }, {} as Record<string, { total: number; approved: number }>);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">In Progress</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="text-blue-500 border-blue-500">Submitted</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-500 border-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Pending</Badge>;
      case 'paid':
        return <Badge variant="outline" className="text-green-500 border-green-500">Paid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Background3D />
        <Navbar />
        <main className="min-h-screen pt-16 flex">
          <div className="w-56 border-r bg-card/95 animate-pulse" />
          <div className="flex-1 ml-56 px-6 py-6 space-y-4 animate-pulse">
            <div className="h-8 bg-muted rounded-xl w-1/3" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted rounded-xl" />)}
            </div>
            <div className="h-96 bg-muted rounded-2xl" />
          </div>
        </main>
      </>
    );
  }

  if (!user) return null;

  // ─── Render ───────────────────────────────────────────────

  return (
    <>
      <Helmet>
        <title>Tester Dashboard — User Ninjas</title>
        <meta name="description" content="View available tests, track your submissions, and manage your earnings." />
      </Helmet>
      <Background3D />
      <Navbar />

      <TooltipProvider delayDuration={200}>
        <div className="min-h-screen pt-16 flex">
          {/* ─── Sidebar ─── */}
          <aside className={`fixed top-16 left-0 bottom-0 z-40 bg-card/95 backdrop-blur-md border-r border-border/60 transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-56'}`}>
            <ScrollArea className="flex-1 py-3">
              <div className="space-y-1 px-2">
                {SIDEBAR_ITEMS.map(item => {
                  const isActive = section === item.key;
                  const badge = item.key === 'available' && tests.filter(t => !submissions.some(s => s.test_id === t.id)).length > 0
                    ? tests.filter(t => !submissions.some(s => s.test_id === t.id)).length
                    : item.key === 'my_tests' && inProgressTests > 0 ? inProgressTests
                    : item.key === 'schedule' && upcomingSessions > 0 ? upcomingSessions
                    : null;
                  return (
                    <Tooltip key={item.key}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setSection(item.key)}
                          className={`flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                            ${isActive ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'}`}
                        >
                          <item.icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                          {!sidebarCollapsed && (
                            <>
                              <span className="truncate flex-1 text-left">{item.label}</span>
                              {badge && <span className="ml-auto bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{badge}</span>}
                            </>
                          )}
                          {sidebarCollapsed && badge && <span className="absolute left-10 top-1 bg-yellow-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{badge}</span>}
                        </button>
                      </TooltipTrigger>
                      {sidebarCollapsed && <TooltipContent side="right">{item.label}{badge ? ` (${badge})` : ''}</TooltipContent>}
                    </Tooltip>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Collapse toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex items-center justify-center h-10 border-t border-border/60 text-muted-foreground hover:text-foreground transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </aside>

          {/* ─── Main Content ─── */}
          <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
              {/* ── Header ── */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold font-display">
                    {section === 'overview' && <>Welcome back, <span className="text-gradient">{profile?.full_name || user.email?.split('@')[0] || 'Tester'}</span></>}
                    {section === 'available' && 'Available Tests'}
                    {section === 'my_tests' && 'My Tests'}
                    {section === 'earnings' && 'Earnings'}
                    {section === 'schedule' && 'Schedule'}
                    {section === 'profile' && 'Profile & Settings'}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {section === 'overview' && `${completedTests} completed · $${totalEarnings.toFixed(0)} earned · ${inProgressTests} in progress`}
                    {section === 'available' && `${tests.filter(t => !submissions.some(s => s.test_id === t.id)).length} tests available`}
                    {section === 'my_tests' && `${submissions.length} total · ${inProgressTests} in progress`}
                    {section === 'earnings' && `$${totalEarnings.toFixed(2)} total · $${pendingEarnings.toFixed(2)} pending`}
                    {section === 'schedule' && `${upcomingSessions} upcoming sessions`}
                    {section === 'profile' && 'Manage your demographics and preferences'}
                  </p>
                </div>
                {section === 'overview' && (
                  <Button variant="outline" size="sm" onClick={() => setSection('profile')}>
                    <Settings className="h-4 w-4 mr-1.5" /> Profile
                  </Button>
                )}
              </div>

              {/* ═══════════════ OVERVIEW SECTION ═══════════════ */}
              {section === 'overview' && (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                      { label: 'Total Earned', value: `$${totalEarnings.toFixed(2)}`, Icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
                      { label: 'Pending', value: `$${pendingEarnings.toFixed(2)}`, Icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                      { label: 'Completed', value: String(completedTests), Icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
                      { label: 'In Progress', value: String(inProgressTests), Icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                      { label: 'Reputation', value: ratedSubmissions.length > 0 ? averageRating.toFixed(1) : '—', Icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                    ].map(({ label, value, Icon, color, bg }) => (
                      <Card key={label} className="bg-card border border-border/60 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-xs text-muted-foreground font-medium">{label}</p>
                            <div className={`p-1.5 ${bg} rounded-lg`}><Icon className={`h-3.5 w-3.5 ${color}`} /></div>
                          </div>
                          <p className={`text-xl font-bold ${color}`}>{value}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Recommended Tests */}
                  {(() => {
                    const recommendedTests = tests.filter(t => !submissions.some(s => s.test_id === t.id)).slice(0, 3);
                    if (recommendedTests.length === 0) return null;
                    return (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <h2 className="text-base font-semibold">Recommended for You</h2>
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                          {recommendedTests.map(test => {
                            const matchScore = (test as any)._matchScore ?? calculateMatchScore(test, testerProfile);
                            const matchColor = matchScore >= 80 ? 'bg-green-500/15 text-green-400 border-green-500/30' : matchScore >= 60 ? 'bg-primary/15 text-primary border-primary/30' : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
                            const isModerated = test.test_type === 'moderated';
                            return (
                              <Card key={test.id} className="bg-card border border-border/60 shadow-sm">
                                <CardHeader className="pb-3">
                                  <div className="flex items-center gap-2">
                                    <Badge className={`${matchColor} border text-xs`}>{matchScore}%</Badge>
                                    {test.test_type && <Badge variant="outline" className="text-xs capitalize">{(test.test_type || '').replace('_', ' ')}</Badge>}
                                  </div>
                                  <CardTitle className="text-lg mt-2">{test.title}</CardTitle>
                                  <CardDescription className="line-clamp-2">{test.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1 font-semibold text-foreground"><DollarSign className="h-3.5 w-3.5" />${Number(test.reward_amount).toFixed(2)}</span>
                                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{test.estimated_duration} min</span>
                                  </div>
                                  <div className="flex gap-2">
                                    {isModerated ? (
                                      <Button size="sm" className="flex-1" onClick={() => openScheduleDialog(test)}>
                                        <Calendar className="h-3.5 w-3.5 mr-1" /> Schedule
                                      </Button>
                                    ) : (
                                      <Button size="sm" className="flex-1" onClick={() => initiateTest(test)}>
                                        Start Test <ArrowRight className="h-3.5 w-3.5 ml-1" />
                                      </Button>
                                    )}
                                    {test.test_type === 'ai_interview' && (
                                      <AIInterviewButton testId={test.id} testTitle={test.title} estimatedDuration={test.estimated_duration} />
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Activity & Rating Summary */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Recent Activity</CardTitle></CardHeader>
                      <CardContent>
                        {submissions.length === 0 ? (
                          <p className="text-muted-foreground text-center py-6">No activity yet. Start a test to begin!</p>
                        ) : (
                          <div className="space-y-3">
                            {submissions.slice(0, 5).map(s => (
                              <div key={s.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                                <div>
                                  <p className="text-sm font-medium">{s.tests?.title || 'Test'}</p>
                                  <p className="text-xs text-muted-foreground">{format(new Date(s.created_at), 'MMM d, yyyy')}</p>
                                </div>
                                {getStatusBadge(s.status)}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Rating Distribution */}
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-yellow-500" /> Rating Distribution</CardTitle></CardHeader>
                      <CardContent>
                        {ratedSubmissions.length === 0 ? (
                          <p className="text-muted-foreground text-center py-6">No ratings yet. Complete tests to earn ratings!</p>
                        ) : (
                          <div className="space-y-3">
                            {ratingDistribution.map(({ rating, count, percentage }) => (
                              <div key={rating} className="flex items-center gap-3">
                                <div className="flex items-center gap-1 w-16"><span className="text-sm font-medium">{rating}</span><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /></div>
                                <Progress value={percentage} className="flex-1 h-2" />
                                <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              {/* ═══════════════ AVAILABLE TESTS SECTION ═══════════════ */}
              {section === 'available' && (
                <div className="space-y-3">
                  {tests.length === 0 ? (
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardContent className="pt-6 text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No tests available at the moment.</p>
                        <p className="text-sm text-muted-foreground mt-2">Check back later for new opportunities!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-3">
                      {tests.map(test => {
                        const alreadyStarted = submissions.some(s => s.test_id === test.id);
                        const matchScore = (test as any)._matchScore ?? calculateMatchScore(test, testerProfile);
                        const matchLabel = matchScore >= 80 ? 'Excellent' : matchScore >= 60 ? 'Good Match' : matchScore >= 40 ? 'Fair Match' : 'Low Match';
                        const matchColor = matchScore >= 80 ? 'bg-green-500/15 text-green-400 border-green-500/30' : matchScore >= 60 ? 'bg-primary/15 text-primary border-primary/30' : matchScore >= 40 ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' : 'bg-muted text-muted-foreground border-border';
                        const leftBorder = alreadyStarted ? 'border-l-muted-foreground/30' : matchScore >= 80 ? 'border-l-green-500' : matchScore >= 60 ? 'border-l-primary' : 'border-l-yellow-500';
                        const isModerated = test.test_type === 'moderated';
                        return (
                          <Card key={test.id} className={`bg-card border border-border/60 shadow-sm border-l-4 overflow-hidden ${leftBorder}`}>
                            <CardContent className="p-4">
                              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className="font-semibold text-base">{test.title}</h3>
                                    <Badge className={`${matchColor} border text-xs`}>{matchScore}% {matchLabel}</Badge>
                                    {test.test_type && <Badge variant="outline" className="text-xs capitalize">{(test.test_type || '').replace('_', ' ')}</Badge>}
                                    {test.category && <Badge variant="secondary" className="text-xs">{test.category}</Badge>}
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{test.description}</p>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                    <span className="flex items-center gap-1 font-semibold text-green-600"><DollarSign className="h-3.5 w-3.5" />${Number(test.reward_amount).toFixed(2)}</span>
                                    <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" />{test.estimated_duration} mins</span>
                                  </div>
                                  {test.requirements && <p className="text-xs text-muted-foreground mt-2"><span className="font-medium">Requirements:</span> {test.requirements}</p>}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                                  {isModerated ? (
                                    <Button size="sm" onClick={() => openScheduleDialog(test)} disabled={alreadyStarted} className="w-full sm:w-auto">
                                      {alreadyStarted ? 'Already Scheduled' : <><Calendar className="h-3.5 w-3.5 mr-1.5" />Schedule Session</>}
                                    </Button>
                                  ) : (
                                    <Button size="sm" onClick={() => initiateTest(test)} disabled={alreadyStarted} className="w-full sm:w-auto">
                                      {alreadyStarted ? 'Already Started' : <><PlayCircle className="h-3.5 w-3.5 mr-1.5" />Start Test</>}
                                    </Button>
                                  )}
                                  {!alreadyStarted && test.test_type === 'ai_interview' && (
                                    <AIInterviewButton testId={test.id} testTitle={test.title} estimatedDuration={test.estimated_duration} />
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════════ MY TESTS SECTION ═══════════════ */}
              {section === 'my_tests' && (
                <div className="space-y-3">
                  {submissions.length === 0 ? (
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardContent className="pt-6 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">You haven't started any tests yet.</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          <button onClick={() => setSection('available')} className="text-primary hover:underline">Browse available tests</button> to get started!
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {submissions.map(submission => (
                        <Card key={submission.id} className={`bg-card border border-border/60 shadow-sm border-l-4 overflow-hidden ${submission.status === 'in_progress' ? 'border-l-yellow-500' : submission.status === 'submitted' ? 'border-l-blue-500' : submission.status === 'approved' ? 'border-l-green-500' : 'border-l-destructive'}`}>
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="font-semibold text-sm">{submission.tests?.title || 'Test'}</h3>
                                  {getStatusBadge(submission.status)}
                                  <span className="text-sm font-semibold text-green-600">${Number(submission.tests?.reward_amount || 0).toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Started {format(new Date(submission.created_at), 'MMM d, yyyy')}
                                  {submission.submitted_at && <> · Submitted {format(new Date(submission.submitted_at), 'MMM d, yyyy')}</>}
                                </p>
                                {submission.feedback && submission.status !== 'in_progress' && (
                                  <p className="text-xs text-muted-foreground mt-1.5 italic line-clamp-1">"{submission.feedback}"</p>
                                )}
                                {submission.rating && submission.status === 'approved' && (
                                  <div className="mt-1.5"><StarRating rating={submission.rating} size="sm" /></div>
                                )}
                              </div>
                              {submission.status === 'in_progress' && (() => {
                                const testForSub = tests.find(t => t.id === submission.test_id);
                                const isSurvey = testForSub?.test_type === 'survey';
                                return (
                                  <div className="flex gap-2 flex-shrink-0">
                                    {isSurvey ? (
                                      <Button size="sm" onClick={() => { setSurveyTest({ testId: submission.test_id, submissionId: submission.id }); setSurveyDialogOpen(true); }} className="flex items-center gap-1.5">
                                        <FileText className="h-3.5 w-3.5" /> Take Survey
                                      </Button>
                                    ) : (
                                      <Button size="sm" onClick={() => openSubmitDialog(submission)} className="flex items-center gap-1.5">
                                        <Send className="h-3.5 w-3.5" /> Submit
                                      </Button>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════════ EARNINGS SECTION ═══════════════ */}
              {section === 'earnings' && (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardContent className="pt-6 text-center">
                        <p className="text-sm text-muted-foreground">Total Earned</p>
                        <p className="text-2xl font-bold text-primary">${totalEarnings.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardContent className="pt-6 text-center">
                        <p className="text-sm text-muted-foreground">Pending Payout</p>
                        <p className="text-2xl font-bold text-yellow-500">${pendingEarnings.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardContent className="pt-6 text-center">
                        <p className="text-sm text-muted-foreground">Paid Out</p>
                        <p className="text-2xl font-bold text-green-500">${paidEarnings.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {earnings.length === 0 ? (
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardContent className="pt-6 text-center">
                        <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No earnings yet.</p>
                        <p className="text-sm text-muted-foreground mt-2">Complete tests to start earning!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardHeader><CardTitle>Earnings History</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {earnings.map(earning => (
                            <div key={earning.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                              <div>
                                <p className="font-medium">{earning.description || 'Test completion'}</p>
                                <p className="text-sm text-muted-foreground">{format(new Date(earning.created_at), 'MMM d, yyyy')}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="font-semibold">${Number(earning.amount).toFixed(2)}</span>
                                {getStatusBadge(earning.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* ═══════════════ SCHEDULE SECTION ═══════════════ */}
              {section === 'schedule' && (
                <div className="space-y-6">
                  {/* Upcoming Sessions */}
                  <Card className="bg-card border border-border/60 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Upcoming Sessions</CardTitle>
                      <CardDescription>Your scheduled moderated study sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {scheduledSessions.filter(s => s.status === 'scheduled').length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No upcoming sessions. Browse moderated tests in Available Tests to schedule one.</p>
                      ) : (
                        <div className="space-y-3">
                          {scheduledSessions.filter(s => s.status === 'scheduled').map(session => (
                            <div key={session.id} className="p-4 rounded-xl border border-border/60 bg-muted/30">
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <h4 className="font-semibold">{session.tests?.title || 'Study Session'}</h4>
                                  {session.study_slots && (
                                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {format(new Date(session.study_slots.start_time), 'EEEE, MMMM d, yyyy')}</span>
                                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {format(new Date(session.study_slots.start_time), 'h:mm a')} – {format(new Date(session.study_slots.end_time), 'h:mm a')}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-sm font-semibold text-green-600 flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />${Number(session.tests?.reward_amount || 0).toFixed(2)}</span>
                                    <span className="text-xs text-muted-foreground">{session.tests?.estimated_duration || 30} min</span>
                                  </div>
                                </div>
                                {session.meeting_url && (
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={session.meeting_url} target="_blank" rel="noopener noreferrer">
                                      <Video className="h-3.5 w-3.5 mr-1.5" /> Join Meeting
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Past Sessions */}
                  {scheduledSessions.filter(s => s.status !== 'scheduled').length > 0 && (
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardHeader><CardTitle>Past Sessions</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {scheduledSessions.filter(s => s.status !== 'scheduled').map(session => (
                            <div key={session.id} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                              <div>
                                <p className="text-sm font-medium">{session.tests?.title || 'Session'}</p>
                                {session.study_slots && (
                                  <p className="text-xs text-muted-foreground">{format(new Date(session.study_slots.start_time), 'MMM d, yyyy h:mm a')}</p>
                                )}
                              </div>
                              <Badge variant={session.status === 'completed' ? 'outline' : 'destructive'} className={session.status === 'completed' ? 'text-green-500 border-green-500' : ''}>
                                {session.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Moderated tests to schedule */}
                  {(() => {
                    const moderatedTests = tests.filter(t => t.test_type === 'moderated' && !submissions.some(s => s.test_id === t.id));
                    if (moderatedTests.length === 0) return null;
                    return (
                      <Card className="bg-card border border-border/60 shadow-sm">
                        <CardHeader><CardTitle>Available Moderated Studies</CardTitle><CardDescription>Schedule a session to participate</CardDescription></CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {moderatedTests.map(test => (
                              <div key={test.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                                <div>
                                  <p className="font-medium">{test.title}</p>
                                  <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1 font-semibold text-green-600"><DollarSign className="h-3.5 w-3.5" />${Number(test.reward_amount).toFixed(2)}</span>
                                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{test.estimated_duration} min</span>
                                  </div>
                                </div>
                                <Button size="sm" onClick={() => openScheduleDialog(test)}>
                                  <Calendar className="h-3.5 w-3.5 mr-1.5" /> Schedule
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()}
                </div>
              )}

              {/* ═══════════════ PROFILE SECTION ═══════════════ */}
              {section === 'profile' && (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <Card className="bg-card border border-border/60 shadow-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            {profile?.full_name || 'Tester'}
                          </CardTitle>
                          <CardDescription>
                            Member since {profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : 'N/A'} · {user.email}
                          </CardDescription>
                        </div>
                        {!editing ? (
                          <Button variant="outline" size="sm" onClick={startEditing}>
                            <Edit className="h-4 w-4 mr-1.5" /> Edit Profile
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditing(false)}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                            <Button size="sm" onClick={saveProfile} disabled={saving}><Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save'}</Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Edit Form */}
                  {editing && (
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardHeader>
                        <CardTitle>Edit Demographics</CardTitle>
                        <CardDescription>Complete your profile to get better test recommendations and higher match scores.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input id="full_name" value={editForm.full_name} onChange={e => setEditForm(prev => ({ ...prev, full_name: e.target.value }))} placeholder="Your name" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="age">Age</Label>
                            <Input id="age" type="number" value={editForm.age} onChange={e => setEditForm(prev => ({ ...prev, age: e.target.value }))} placeholder="25" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select value={editForm.gender} onValueChange={v => setEditForm(prev => ({ ...prev, gender: v }))}>
                              <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="non-binary">Non-binary</SelectItem>
                                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" value={editForm.location} onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))} placeholder="City, Country" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea id="bio" value={editForm.bio} onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))} placeholder="Tell us about yourself..." rows={3} />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2"><Smartphone className="h-4 w-4" /> Devices</Label>
                          <div className="flex flex-wrap gap-3">
                            {['Desktop', 'Laptop', 'Tablet', 'Mobile (iOS)', 'Mobile (Android)'].map(device => (
                              <label key={device} className="flex items-center gap-2 cursor-pointer">
                                <Checkbox checked={editForm.devices.includes(device)} onCheckedChange={() => toggleDevice(device)} />
                                <span className="text-sm">{device}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2"><Heart className="h-4 w-4" /> Interests</Label>
                          <div className="flex gap-2">
                            <Input value={editForm.newInterest} onChange={e => setEditForm(prev => ({ ...prev, newInterest: e.target.value }))} placeholder="Add interest (e.g., E-commerce, Gaming)" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addInterest())} />
                            <Button variant="outline" size="sm" onClick={addInterest}>Add</Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {editForm.interests.map(interest => (
                              <Badge key={interest} variant="secondary" className="cursor-pointer" onClick={() => removeInterest(interest)}>{interest} <X className="h-3 w-3 ml-1" /></Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Demographics Display */}
                  {!editing && profile && (
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardHeader><CardTitle>Demographics</CardTitle></CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {profile.age && <div><p className="text-xs text-muted-foreground">Age</p><p className="font-medium">{profile.age}</p></div>}
                          {profile.gender && <div><p className="text-xs text-muted-foreground">Gender</p><p className="font-medium capitalize">{profile.gender}</p></div>}
                          {profile.location && <div className="flex items-start gap-1"><MapPin className="h-3 w-3 mt-1 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Location</p><p className="font-medium">{profile.location}</p></div></div>}
                          {profile.devices && profile.devices.length > 0 && <div><p className="text-xs text-muted-foreground">Devices</p><div className="flex flex-wrap gap-1 mt-1">{profile.devices.map(d => <Badge key={d} variant="outline" className="text-xs">{d}</Badge>)}</div></div>}
                        </div>
                        {profile.interests && profile.interests.length > 0 && (
                          <div className="mt-4"><p className="text-xs text-muted-foreground mb-2">Interests</p><div className="flex flex-wrap gap-1">{profile.interests.map(i => <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>)}</div></div>
                        )}
                        {profile.bio && <div className="mt-4"><p className="text-xs text-muted-foreground mb-1">Bio</p><p className="text-sm">{profile.bio}</p></div>}
                        {!profile.age && !profile.gender && !profile.location && (!profile.devices || profile.devices.length === 0) && (
                          <div className="text-center py-6">
                            <p className="text-muted-foreground mb-2">Complete your profile for better test matches</p>
                            <Button size="sm" onClick={startEditing}><Edit className="h-4 w-4 mr-1.5" /> Edit Profile</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Stats & Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-yellow-500/10 rounded-full"><Star className="h-6 w-6 text-yellow-500" /></div>
                          <div>
                            <p className="text-sm text-muted-foreground">Average Rating</p>
                            <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
                            <p className="text-xs text-muted-foreground">{ratedSubmissions.length} reviews</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-green-500/10 rounded-full"><CheckCircle className="h-6 w-6 text-green-500" /></div>
                          <div>
                            <p className="text-sm text-muted-foreground">Completion Rate</p>
                            <span className="text-2xl font-bold">{completionRate.toFixed(0)}%</span>
                            <p className="text-xs text-muted-foreground">{completedTests} completed</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-full"><DollarSign className="h-6 w-6 text-primary" /></div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Earned</p>
                            <span className="text-2xl font-bold">${totalEarnings.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-purple-500/10 rounded-full"><Trophy className="h-6 w-6 text-purple-500" /></div>
                          <div>
                            <p className="text-sm text-muted-foreground">Level</p>
                            <span className="text-2xl font-bold">
                              {completedTests >= 50 ? 'Expert' : completedTests >= 20 ? 'Pro' : completedTests >= 5 ? 'Rising' : 'Beginner'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Category Expertise */}
                  {Object.keys(categoryStats).length > 0 && (
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Category Expertise</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(categoryStats).sort((a, b) => b[1].total - a[1].total).slice(0, 6).map(([category, stats]) => (
                            <div key={category} className="space-y-1">
                              <div className="flex justify-between text-sm"><span>{category}</span><span className="text-muted-foreground">{stats.approved}/{stats.total}</span></div>
                              <Progress value={stats.total > 0 ? (stats.approved / stats.total) * 100 : 0} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </TooltipProvider>

      {/* Submit Test Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Test</DialogTitle>
            <DialogDescription>
              Submit your completed test for "{selectedSubmission?.tests?.title}". Please provide detailed feedback about your testing experience.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Your Feedback *</Label>
              <Textarea
                id="feedback"
                placeholder="Describe your testing experience, any bugs found, usability issues, suggestions for improvement, etc."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Provide detailed, constructive feedback to help improve the product.
              </p>
            </div>
            
            {/* Screen Recording Section */}
            <ScreenRecorder
              onRecordingComplete={(blob, transcript) => {
                setRecordingBlob(blob);
                setRecordingTranscript(transcript);
              }}
              disabled={submitting}
            />
            {recordingBlob && (
              <p className="text-xs text-green-500 flex items-center gap-1">
                ✓ Recording attached ({(recordingBlob.size / 1024 / 1024).toFixed(1)}MB)
                {recordingTranscript && ` • ${recordingTranscript.split(' ').length} words transcribed`}
              </p>
            )}

            {/* File Upload Section */}
            <div className="space-y-3">
              <Label>Attachments (Optional)</Label>
              <p className="text-xs text-muted-foreground">
                Upload screenshots or screen recordings to support your feedback. Max 5 files, 10MB each.
              </p>
              
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadedFiles.length >= 5 || submitting}
                className="w-full border-dashed"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadedFiles.length >= 5 ? 'Max files reached' : 'Upload Screenshots or Videos'}
              </Button>
              
              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {file.type.startsWith('video/') ? (
                          <Film className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        ) : (
                          <Image className="h-4 w-4 text-green-500 flex-shrink-0" />
                        )}
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          ({(file.size / 1024 / 1024).toFixed(1)}MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={submitting}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSubmitDialogOpen(false);
                setUploadedFiles([]);
                setRecordingBlob(null);
                setRecordingTranscript('');
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={submitTest}
              disabled={submitting || !feedbackText.trim()}
              className="flex items-center gap-2"
            >
              {submitting ? (
                <>{uploading ? 'Uploading files...' : 'Submitting...'}</>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Test
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Screener Gate Dialog */}
      <Dialog open={screenerDialogOpen} onOpenChange={(open) => {
        setScreenerDialogOpen(open);
        if (!open) setScreenerTest(null);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eligibility Screener</DialogTitle>
            <DialogDescription>
              Checking if you match the requirements for "{screenerTest?.title}".
            </DialogDescription>
          </DialogHeader>
          {screenerTest && (
            <ScreenerGate
              testId={screenerTest.id}
              testTitle={screenerTest.title}
              onEligible={handleScreenerPass}
              onCancel={() => {
                setScreenerDialogOpen(false);
                setScreenerTest(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Survey Flow Dialog */}
      <Dialog open={surveyDialogOpen} onOpenChange={(open) => {
        setSurveyDialogOpen(open);
        if (!open) setSurveyTest(null);
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Survey Questions</DialogTitle>
            <DialogDescription>
              Answer the questions below to complete this survey.
            </DialogDescription>
          </DialogHeader>
          {surveyTest && (
            <TesterSurveyFlow
              testId={surveyTest.testId}
              submissionId={surveyTest.submissionId}
              onComplete={() => {
                setSurveyDialogOpen(false);
                setSurveyTest(null);
                fetchData();
              }}
              onCancel={() => {
                setSurveyDialogOpen(false);
                setSurveyTest(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Booking Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={(open) => {
        setScheduleDialogOpen(open);
        if (!open) { setSchedulingTest(null); setAvailableSlots([]); }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Schedule Session</DialogTitle>
            <DialogDescription>
              Choose an available time slot for "<strong>{schedulingTest?.title}</strong>"
            </DialogDescription>
          </DialogHeader>

          {/* Study summary */}
          {schedulingTest && (
            <div className="flex items-center gap-4 px-1 py-2 rounded-lg bg-muted/40 border border-border/40 text-sm">
              <span className="flex items-center gap-1 font-semibold text-green-600"><DollarSign className="h-3.5 w-3.5" />${Number(schedulingTest.reward_amount).toFixed(2)} incentive</span>
              <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" />{schedulingTest.estimated_duration} min session</span>
              <span className="flex items-center gap-1 text-muted-foreground"><Video className="h-3.5 w-3.5" />Zoom meeting</span>
            </div>
          )}

          <div className="space-y-2 py-1 max-h-[50vh] overflow-y-auto">
            {availableSlots.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No available time slots for this study. Check back later.</p>
            ) : (
              (() => {
                // Group slots by date
                const grouped = availableSlots.reduce((acc, slot) => {
                  const dateKey = format(new Date(slot.start_time), 'EEEE, MMMM d, yyyy');
                  if (!acc[dateKey]) acc[dateKey] = [];
                  acc[dateKey].push(slot);
                  return acc;
                }, {} as Record<string, StudySlot[]>);

                return Object.entries(grouped).map(([date, slots]) => (
                  <div key={date}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 mt-3 first:mt-0">{date}</p>
                    <div className="space-y-2">
                      {slots.map(slot => {
                        const durationMins = Math.round((new Date(slot.end_time).getTime() - new Date(slot.start_time).getTime()) / 60000);
                        return (
                          <div key={slot.id} className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/30 transition-colors">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">{format(new Date(slot.start_time), 'h:mm a')} – {format(new Date(slot.end_time), 'h:mm a')}</p>
                              <p className="text-xs text-muted-foreground">{durationMins} min · Zoom link provided upon booking</p>
                            </div>
                            <Button size="sm" onClick={() => bookSlot(slot)} disabled={bookingSlot} className="shrink-0">
                              {bookingSlot ? <><span className="animate-spin mr-1">⏳</span>Booking...</> : 'Select Slot'}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setScheduleDialogOpen(false); setSchedulingTest(null); setAvailableSlots([]); }} disabled={bookingSlot}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
