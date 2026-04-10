import { useState, useEffect, useRef } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  Settings
} from 'lucide-react';
import StarRating from '@/components/StarRating';
import ScrollReveal from '@/components/ScrollReveal';
import ScreenRecorder from '@/components/ScreenRecorder';

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

interface Earning {
  id: string;
  amount: number;
  status: string;
  description: string | null;
  created_at: string;
}

export default function TesterDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tests, setTests] = useState<Test[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [testerProfile, setTesterProfile] = useState<TesterProfile | null>(null);
  
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

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && role !== 'tester') {
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

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch tester profile for matching
      const { data: profileData } = await supabase
        .from('profiles')
        .select('age, gender, location, devices, interests')
        .eq('user_id', user!.id)
        .maybeSingle();
      
      setTesterProfile(profileData || null);

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
        .eq('tester_id', user!.id)
        .order('created_at', { ascending: false });

      if (submissionsError) throw submissionsError;
      setSubmissions(submissionsData || []);

      // Fetch user's earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('earnings')
        .select('*')
        .eq('tester_id', user!.id)
        .order('created_at', { ascending: false });

      if (earningsError) throw earningsError;
      setEarnings(earningsData || []);
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
  };

  const startTest = async (testId: string) => {
    try {
      const { error } = await supabase
        .from('test_submissions')
        .insert({
          test_id: testId,
          tester_id: user!.id,
          status: 'in_progress',
        });

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
      } else {
        toast({
          title: 'Test started!',
          description: 'Good luck with your test.',
        });
        fetchData();
      }
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
        <main className="min-h-screen pt-20 px-4">
          <div className="container mx-auto max-w-6xl py-8 space-y-4 animate-pulse">
            <div className="h-24 bg-muted rounded-2xl" />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
            </div>
            <div className="h-52 bg-muted rounded-2xl" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Tester Dashboard - User Ninjas</title>
        <meta name="description" content="View available tests, track your submissions, and manage your earnings." />
      </Helmet>

      <Background3D />
      <Navbar />

      <main className="min-h-screen pt-20 px-4">
        <div className="container mx-auto max-w-6xl py-8">
          {/* Header */}
          <ScrollReveal animation="fade-down">
            <div className="rounded-2xl bg-card border border-border/60 p-5 mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-foreground">{user?.email?.split('@')[0] ?? 'Tester'}</h1>
                  <Badge variant="secondary" className="text-xs">Tester</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {completedTests} completed · ${totalEarnings.toFixed(2)} earned
                  {pendingEarnings > 0 && <span className="text-yellow-500 font-medium"> · ${pendingEarnings.toFixed(2)} pending</span>}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/tester/profile"><Settings className="h-4 w-4 mr-1.5" />My Profile</Link>
              </Button>
            </div>
          </div>
          </ScrollReveal>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Total Earned', value: `$${totalEarnings.toFixed(2)}`, Icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10', sub: 'All time' },
              { label: 'Pending', value: `$${pendingEarnings.toFixed(2)}`, Icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', sub: 'Awaiting payout' },
              { label: 'Completed', value: String(completedTests), Icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', sub: 'Approved tests' },
              { label: 'In Progress', value: String(inProgressTests), Icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-500/10', sub: 'Active tests' },
              { label: 'Reputation', value: ratedSubmissions.length > 0 ? averageRating.toFixed(1) : '—', Icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10', sub: `${ratedSubmissions.length} ratings` },
            ].map(({ label, value, Icon, color, bg, sub }, i) => (
              <ScrollReveal key={label} animation="zoom-up" delay={i * 70}>
                <Card className="bg-card border border-border/60 shadow-sm hover:shadow-lg transition-all spring-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-xs text-muted-foreground font-medium">{label}</p>
                      <div className={`p-1.5 ${bg} rounded-lg`}>
                        <Icon className={`h-3.5 w-3.5 ${color}`} />
                      </div>
                    </div>
                    <p className={`text-xl font-bold stat-number ${color}`}>{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>

          {/* Recommended For You */}
          {(() => {
            const recommendedTests = tests
              .filter(t => !submissions.some(s => s.test_id === t.id))
              .slice(0, 3);
            if (recommendedTests.length === 0) return null;
            return (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="text-base font-semibold text-foreground">Recommended for You</h2>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                    {recommendedTests.map((test) => {
                      const matchScore = (test as any)._matchScore ?? calculateMatchScore(test, testerProfile);
                      const matchLabel = matchScore >= 80 ? 'Excellent Match' : matchScore >= 60 ? 'Good Match' : matchScore >= 40 ? 'Fair Match' : 'Low Match';
                      const matchColor = matchScore >= 80 ? 'bg-green-500/15 text-green-400 border-green-500/30' : matchScore >= 60 ? 'bg-primary/15 text-primary border-primary/30' : matchScore >= 40 ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' : 'bg-muted text-muted-foreground border-border';
                      const ringColor = matchScore >= 80 ? 'ring-green-500/30' : matchScore >= 60 ? 'ring-primary/30' : 'ring-border';
                      return (
                        <Card key={test.id} className={`bg-card border border-border/60 shadow-sm transition-all duration-300 spring-card ring-2 ${ringColor}`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <Badge className={`${matchColor} border text-xs`}>{matchScore}% — {matchLabel}</Badge>
                              {test.category && <Badge variant="secondary" className="text-xs">{test.category}</Badge>}
                            </div>
                            <CardTitle className="text-lg mt-2">{test.title}</CardTitle>
                            <CardDescription className="line-clamp-2 text-sm">{test.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1 font-semibold text-foreground">
                                <DollarSign className="h-3.5 w-3.5" />${Number(test.reward_amount).toFixed(2)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />{test.estimated_duration} min
                              </span>
                            </div>
                            <Button size="sm" className="w-full" onClick={() => startTest(test.id)}>
                              Start Test <ArrowRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            );
          })()}

          {/* Main Content Tabs */}
          <Tabs defaultValue="available" className="space-y-5">
            <TabsList className="h-10 bg-secondary/60 border border-border/50 p-1 rounded-xl gap-1">
              <TabsTrigger value="available" className="rounded-lg text-sm gap-1.5 data-[state=active]:shadow-sm">
                <FileText className="h-3.5 w-3.5" /> Available
                {tests.filter(t => !submissions.some(s => s.test_id === t.id)).length > 0 && (
                  <span className="ml-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {tests.filter(t => !submissions.some(s => s.test_id === t.id)).length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="submissions" className="rounded-lg text-sm gap-1.5 data-[state=active]:shadow-sm">
                <TrendingUp className="h-3.5 w-3.5" /> My Tests
                {inProgressTests > 0 && <span className="ml-1 bg-yellow-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{inProgressTests}</span>}
              </TabsTrigger>
              <TabsTrigger value="earnings" className="rounded-lg text-sm gap-1.5 data-[state=active]:shadow-sm">
                <Wallet className="h-3.5 w-3.5" /> Earnings
              </TabsTrigger>
            </TabsList>

              <TabsContent value="available" className="space-y-3">
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
                    {tests.map((test) => {
                      const alreadyStarted = submissions.some(s => s.test_id === test.id);
                      const matchScore = (test as any)._matchScore ?? calculateMatchScore(test, testerProfile);
                      const matchLabel = matchScore >= 80 ? 'Excellent' : matchScore >= 60 ? 'Good Match' : matchScore >= 40 ? 'Fair Match' : 'Low Match';
                      const matchColor = matchScore >= 80 ? 'bg-green-500/15 text-green-400 border-green-500/30' : matchScore >= 60 ? 'bg-primary/15 text-primary border-primary/30' : matchScore >= 40 ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' : 'bg-muted text-muted-foreground border-border';
                      const leftBorder = alreadyStarted ? 'border-l-muted-foreground/30' : matchScore >= 80 ? 'border-l-green-500' : matchScore >= 60 ? 'border-l-primary' : 'border-l-yellow-500';
                      return (
                        <Card key={test.id} className={`bg-card border border-border/60 shadow-sm border-l-4 overflow-hidden ${leftBorder}`}>
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="font-semibold text-base">{test.title}</h3>
                                  <Badge className={`${matchColor} border text-xs`}>{matchScore}% {matchLabel}</Badge>
                                  {test.category && <Badge variant="secondary" className="text-xs">{test.category}</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{test.description}</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                  <span className="flex items-center gap-1 font-semibold text-green-600"><DollarSign className="h-3.5 w-3.5" />${Number(test.reward_amount).toFixed(2)}</span>
                                  <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" />{test.estimated_duration} mins</span>
                                </div>
                                {test.requirements && (
                                  <p className="text-xs text-muted-foreground mt-2"><span className="font-medium">Requirements:</span> {test.requirements}</p>
                                )}
                              </div>
                              <Button size="sm" onClick={() => startTest(test.id)} disabled={alreadyStarted} className="flex-shrink-0 w-full sm:w-auto">
                                {alreadyStarted ? 'Already Started' : <><PlayCircle className="h-3.5 w-3.5 mr-1.5" />Start Test</>}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="submissions" className="space-y-3">
                {submissions.length === 0 ? (
                  <Card className="bg-card border border-border/60 shadow-sm">
                    <CardContent className="pt-6 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">You haven't started any tests yet.</p>
                      <p className="text-sm text-muted-foreground mt-2">Browse available tests to get started!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((submission) => (
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
                                Started {new Date(submission.created_at).toLocaleDateString()}
                                {submission.submitted_at && <> · Submitted {new Date(submission.submitted_at).toLocaleDateString()}</>}
                              </p>
                              {submission.feedback && submission.status !== 'in_progress' && (
                                <p className="text-xs text-muted-foreground mt-1.5 italic line-clamp-1">"{submission.feedback}"</p>
                              )}
                              {submission.rating && submission.status === 'approved' && (
                                <div className="mt-1.5"><StarRating rating={submission.rating} size="sm" /></div>
                              )}
                            </div>
                            {submission.status === 'in_progress' && (
                              <Button size="sm" onClick={() => openSubmitDialog(submission)} className="flex items-center gap-1.5 flex-shrink-0">
                                <Send className="h-3.5 w-3.5" />Submit
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="earnings" className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
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
                    <CardHeader>
                      <CardTitle>Earnings History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {earnings.map((earning) => (
                          <div key={earning.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                            <div>
                              <p className="font-medium">{earning.description || 'Test completion'}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(earning.created_at).toLocaleDateString()}
                              </p>
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
              </TabsContent>
            </Tabs>
        </div>
      </main>

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
    </>
  );
}
