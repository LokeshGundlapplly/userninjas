import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Background3D from '@/components/Background3D';
import RecruiterChat from '@/components/RecruiterChat';
import TestDetailPanel from '@/components/recruiter/TestDetailPanel';
import SubmissionDetailPanel from '@/components/recruiter/SubmissionDetailPanel';
import RecruiterPaymentsPanel from '@/components/recruiter/RecruiterPaymentsPanel';
import PricingModal from '@/components/PricingModal';
import StarRating from '@/components/StarRating';
import ScrollReveal from '@/components/ScrollReveal';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import AIInterviewReport from '@/components/AIInterviewReport';
import type { InterviewReport } from '@/hooks/useAIInterviewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Plus, FileText, Users, DollarSign, Clock, CheckCircle, XCircle,
  AlertCircle, Trash2, Edit, BarChart3, Activity, Target, Filter,
  Percent, Award, Sparkles, Play as PlayIcon, LogOut, Settings,
  Layers, Bot, MessageSquare, PieChart, Download, Search,
  LayoutGrid, ClipboardList, Eye, ChevronLeft, ChevronRight,
  TrendingUp, Zap, Send, ArrowRight, ExternalLink, RefreshCw, CreditCard, Crown,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, AreaChart, Area,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────

interface Test {
  id: string;
  title: string;
  description: string | null;
  requirements: string | null;
  reward_amount: number;
  estimated_duration: number;
  category: string | null;
  status: string;
  max_testers: number | null;
  current_testers: number | null;
  created_at: string;
  test_type?: string | null;
  prototype_url?: string | null;
  device_targeting?: string[] | null;
  browser_targeting?: string[] | null;
  target_audience?: any;
  screener_questions?: any;
}

interface Submission {
  id: string;
  test_id: string;
  tester_id: string;
  status: string;
  feedback: string | null;
  rating: number | null;
  submitted_at: string | null;
  created_at: string;
  attachments: string[] | null;
  recording_url: string | null;
  transcript: string | null;
  transcript_summary: string | null;
  tests: { title: string; reward_amount: number };
}

interface AIInterviewSession {
  id: string;
  test_id: string;
  tester_id: string;
  status: string;
  eligible: boolean;
  eligibility_reason: string | null;
  transcript: Array<{ role: string; content: string }> | null;
  friction_points: unknown[];
  insights: unknown[];
  key_quotes: string[];
  duration_seconds: number | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  tests: { title: string } | null;
}

interface Survey {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
}

interface SurveyQuestion {
  question_text: string;
  question_type: 'open_text' | 'mcq' | 'rating' | 'yes_no';
  options: string[];
  required: boolean;
  logic_branch: { condition: string; skip_to: number } | null;
}

type Section = 'overview' | 'tests' | 'submissions' | 'insights' | 'ai_interviews' | 'surveys' | 'analytics' | 'payments';

// ─── Constants ────────────────────────────────────────────

const categories = ['Usability', 'Functionality', 'Performance', 'Security', 'Accessibility', 'Mobile', 'Web App', 'Other'];

const CHART_COLORS = [
  'hsl(37, 95%, 55%)', 'hsl(230, 60%, 52%)', 'hsl(142, 71%, 45%)', 'hsl(0, 84%, 60%)',
  'hsl(280, 65%, 55%)', 'hsl(190, 80%, 45%)', 'hsl(45, 90%, 50%)', 'hsl(330, 70%, 55%)',
];

const SIDEBAR_ITEMS: { key: Section; label: string; icon: typeof LayoutGrid }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'tests', label: 'My Tests', icon: FileText },
  { key: 'submissions', label: 'Submissions', icon: Users },
  { key: 'insights', label: 'AI Insights', icon: Sparkles },
  { key: 'ai_interviews', label: 'AI Interviews', icon: Bot },
  { key: 'surveys', label: 'Surveys', icon: ClipboardList },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'payments', label: 'Billing & Subscription', icon: CreditCard },
];

// ─── Helpers ──────────────────────────────────────────────

function getStatusBadge(status: string) {
  switch (status) {
    case 'active': return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Active</Badge>;
    case 'paused': return <Badge variant="secondary">Paused</Badge>;
    case 'completed': return <Badge variant="outline">Completed</Badge>;
    case 'in_progress': return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">In Progress</Badge>;
    case 'submitted': return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Pending Review</Badge>;
    case 'approved': return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Approved</Badge>;
    case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
}

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Main Component ───────────────────────────────────────

export default function RecruiterDashboard() {
  const { user, role, profile, subscription, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Layout
  const [section, setSection] = useState<Section>('overview');
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['overview', 'tests', 'analytics', 'submissions'].includes(hash)) {
        setSection(hash as Section);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Data
  const [tests, setTests] = useState<Test[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [aiInterviewSessions, setAiInterviewSessions] = useState<AIInterviewSession[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  // Tests CRUD
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', requirements: '', reward_amount: '', estimated_duration: '', category: '', max_testers: '',
  });
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [testSearchQuery, setTestSearchQuery] = useState('');
  const [testStatusFilter, setTestStatusFilter] = useState<string>('all');

  // Submissions
  const [submissionFilter, setSubmissionFilter] = useState<string>('all');
  const [submissionTestFilter, setSubmissionTestFilter] = useState<string>('all');
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<Record<string, number>>({});
  const [bulkSummarizing, setBulkSummarizing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });

  // AI Interviews
  const [viewingSession, setViewingSession] = useState<AIInterviewSession | null>(null);

  const planKey = subscription?.plan_type || profile?.plan_type || 'free';
  const isYearly = planKey === 'yearly';
  const isPremium = planKey === 'monthly' || planKey === 'yearly';

  // Surveys
  const [surveyTab, setSurveyTab] = useState<'list' | 'create' | 'results'>('list');
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([
    { question_text: '', question_type: 'open_text', options: [], required: true, logic_branch: null },
  ]);
  const [savingSurvey, setSavingSurvey] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [surveyResponses, setSurveyResponses] = useState<any[]>([]);

  // ─── Auth Guard ───────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
    else if (!authLoading && user && role && role !== 'recruiter') {
      // Redirect admins to admin portal, testers elsewhere
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (role === 'tester') {
        navigate('/tester', { replace: true });
      } else {
        navigate('/');
      }
      toast({ 
        title: 'Access denied', 
        description: role === 'admin' ? 'Redirecting to admin portal...' : 'This dashboard is only for recruiters.', 
        variant: role === 'admin' ? 'default' : 'destructive' 
      });
    }
  }, [user, role, authLoading, navigate, toast]);

  // ─── Data Fetching ────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: testsData, error: testsError } = await supabase
        .from('tests').select('*').eq('recruiter_id', user.id).order('created_at', { ascending: false });
      if (testsError) throw testsError;
      setTests(testsData || []);

      const { data: submissionsData, error: submissionsError } = await supabase
        .from('test_submissions').select('*, tests (title, reward_amount)').order('created_at', { ascending: false });
      if (submissionsError) throw submissionsError;

      const testIds = (testsData || []).map(t => t.id);
      setSubmissions((submissionsData || []).filter(s => testIds.includes(s.test_id)));

      if (testIds.length > 0) {
        const { data: aiSessionsData } = await (supabase.from as any)('ai_interview_sessions')
          .select('*, tests(title)').in('test_id', testIds).order('created_at', { ascending: false });
        setAiInterviewSessions((aiSessionsData as AIInterviewSession[]) || []);
      } else {
        setAiInterviewSessions([]);
      }

      const { data: surveyData } = await supabase.from('surveys').select('*').eq('recruiter_id', user.id).order('created_at', { ascending: false });
      setSurveys((surveyData as Survey[]) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error', description: 'Failed to load dashboard data.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user && role === 'recruiter') fetchData();
  }, [user, role, fetchData]);

  // ─── Test CRUD Handlers ───────────────────────────────────

  const resetForm = () => {
    setFormData({ title: '', description: '', requirements: '', reward_amount: '', estimated_duration: '', category: '', max_testers: '' });
    setEditingTest(null);
  };

  const handleCreateTest = async () => {
    if (!formData.title || !formData.reward_amount || !formData.estimated_duration) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase.from('tests').insert({
        recruiter_id: user!.id,
        title: formData.title,
        description: formData.description || null,
        requirements: formData.requirements || null,
        reward_amount: parseFloat(formData.reward_amount),
        estimated_duration: parseInt(formData.estimated_duration),
        category: formData.category || null,
        max_testers: formData.max_testers ? parseInt(formData.max_testers) : 100,
        status: 'active',
      });
      if (error) throw error;
      toast({ title: 'Test created!', description: 'Your test has been published and is now available to testers.' });
      setCreateDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating test:', error);
      toast({ title: 'Error', description: 'Failed to create test.', variant: 'destructive' });
    }
  };

  const handleEditTest = async () => {
    if (!editingTest || !formData.title) return;
    try {
      const { error } = await supabase.from('tests').update({
        title: formData.title,
        description: formData.description || null,
        requirements: formData.requirements || null,
        reward_amount: parseFloat(formData.reward_amount),
        estimated_duration: parseInt(formData.estimated_duration),
        category: formData.category || null,
        max_testers: formData.max_testers ? parseInt(formData.max_testers) : 100,
      }).eq('id', editingTest.id);
      if (error) throw error;
      toast({ title: 'Test updated!', description: 'Your test has been updated successfully.' });
      setEditingTest(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error updating test:', error);
      toast({ title: 'Error', description: 'Failed to update test.', variant: 'destructive' });
    }
  };

  const handleDeleteTest = async (testId: string) => {
    try {
      const { error } = await supabase.from('tests').delete().eq('id', testId);
      if (error) throw error;
      toast({ title: 'Test deleted', description: 'The test has been removed.' });
      if (selectedTestId === testId) setSelectedTestId(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting test:', error);
      toast({ title: 'Error', description: 'Failed to delete test.', variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (test: Test) => {
    const newStatus = test.status === 'active' ? 'paused' : 'active';
    try {
      const { error } = await supabase.from('tests').update({ status: newStatus }).eq('id', test.id);
      if (error) throw error;
      toast({ title: `Test ${newStatus === 'active' ? 'activated' : 'paused'}`, description: `The test is now ${newStatus}.` });
      fetchData();
    } catch (error) {
      console.error('Error toggling test status:', error);
      toast({ title: 'Error', description: 'Failed to update test status.', variant: 'destructive' });
    }
  };

  const openEditDialog = (test: Test) => {
    setFormData({
      title: test.title,
      description: test.description || '',
      requirements: test.requirements || '',
      reward_amount: test.reward_amount.toString(),
      estimated_duration: test.estimated_duration.toString(),
      category: test.category || '',
      max_testers: test.max_testers?.toString() || '',
    });
    setEditingTest(test);
  };

  // ─── Submission Handlers ──────────────────────────────────

  const handleReviewSubmission = async (submissionId: string, newStatus: 'approved' | 'rejected', submission: Submission) => {
    const rating = reviewRating[submissionId] || 0;
    if (newStatus === 'approved' && rating === 0) {
      toast({ title: 'Rating required', description: 'Please provide a rating before approving.', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase.from('test_submissions').update({
        status: newStatus, reviewed_at: new Date().toISOString(), rating: newStatus === 'approved' ? rating : null,
      }).eq('id', submissionId);
      if (error) throw error;
      toast({ title: `Submission ${newStatus}`, description: `The submission has been ${newStatus}.` });
      fetchData();
    } catch (error) {
      console.error('Error reviewing submission:', error);
      toast({ title: 'Error', description: 'Failed to review submission.', variant: 'destructive' });
    }
  };

  const handleSummarizeTranscript = async (submissionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('summarize-transcript', { body: { submission_id: submissionId } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: 'Transcript summarized!', description: 'AI summary generated successfully.' });
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to summarize', variant: 'destructive' });
    }
  };

  const summarizeAllTranscripts = async () => {
    const pending = submissions.filter(s => s.transcript && !s.transcript_summary);
    if (pending.length === 0) {
      toast({ title: 'Nothing to summarize', description: 'All transcripts already have summaries.' });
      return;
    }
    setBulkSummarizing(true);
    setBulkProgress({ done: 0, total: pending.length });
    let successCount = 0, failCount = 0;
    for (const sub of pending) {
      try {
        const { data, error } = await supabase.functions.invoke('summarize-transcript', { body: { submission_id: sub.id } });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        successCount++;
      } catch { failCount++; }
      setBulkProgress(prev => ({ ...prev, done: prev.done + 1 }));
    }
    setBulkSummarizing(false);
    toast({ title: 'Bulk summarization complete', description: `${successCount} succeeded, ${failCount} failed out of ${pending.length}.` });
    fetchData();
  };

  // ─── Survey Handlers ──────────────────────────────────────

  const handleCreateSurvey = async () => {
    if (!surveyTitle.trim()) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    if (planKey === 'monthly' && surveys.length >= 3) {
      toast({
        title: 'Survey Limit Reached',
        description: 'Monthly plans are limited to 3 active surveys. Upgrade to Yearly Enterprise for unlimited surveys.',
        variant: 'destructive'
      });
      return;
    }
    setSavingSurvey(true);
    try {
      const { data: survey, error } = await supabase.from('surveys')
        .insert({ recruiter_id: user!.id, title: surveyTitle.trim(), description: surveyDescription.trim() || null, status: 'active' })
        .select().single();
      if (error) throw error;
      const validQs = surveyQuestions.filter(q => q.question_text.trim());
      if (validQs.length > 0) {
        const { error: qErr } = await supabase.from('survey_questions').insert(
          validQs.map((q, i) => ({
            survey_id: (survey as any).id,
            question_text: q.question_text.trim(),
            question_type: q.question_type,
            options: q.question_type === 'mcq' ? q.options.filter(o => o.trim()) : [],
            required: q.required,
            logic_branch: q.logic_branch,
            sort_order: i,
          }))
        );
        if (qErr) throw qErr;
      }
      toast({ title: 'Survey created!' });
      setSurveyTitle(''); setSurveyDescription('');
      setSurveyQuestions([{ question_text: '', question_type: 'open_text', options: [], required: true, logic_branch: null }]);
      fetchData();
      setSurveyTab('list');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setSavingSurvey(false); }
  };

  const fetchSurveyResponses = async (surveyId: string) => {
    setSelectedSurveyId(surveyId);
    const { data } = await supabase.from('survey_responses').select('*').eq('survey_id', surveyId).order('created_at', { ascending: false });
    setSurveyResponses(data || []);
    setSurveyTab('results');
  };

  // ─── Export Handlers ──────────────────────────────────────

  const exportSubmissions = () => {
    if (!isYearly) {
      toast({
        title: "Feature Locked",
        description: "Exporting submissions data to CSV is exclusive to the Yearly Enterprise tier.",
        variant: "destructive"
      });
      setPricingModalOpen(true);
      return;
    }
    const headers = ['Test', 'Tester ID', 'Status', 'Rating', 'Feedback', 'Submitted At', 'Created At', 'Reward'];
    const rows = filteredSubmissions.map(s => [
      s.tests?.title || '', s.tester_id, s.status, s.rating?.toString() || '',
      s.feedback || '', s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : '',
      new Date(s.created_at).toLocaleDateString(), s.tests?.reward_amount?.toString() || '',
    ]);
    downloadCSV(`submissions_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    toast({ title: 'Export complete', description: `${rows.length} submissions exported.` });
  };

  const exportAnalytics = () => {
    const headers = ['Metric', 'Value'];
    const rows: string[][] = [
      ['Total Tests', tests.length.toString()], ['Total Submissions', submissions.length.toString()],
      ['Approval Rate', `${approvalRate}%`], ['Average Rating', avgRating.toFixed(1)],
      ['Completion Rate', `${completionRate}%`], ['Total Spend', `$${totalSpent.toFixed(2)}`],
      ['Unique Testers', uniqueTesters.toString()], ['', ''],
      ['--- Submissions by Status ---', ''],
      ...submissionStatusData.map(d => [d.name, d.value.toString()]),
      ['', ''], ['--- Tests by Category ---', ''],
      ...categoryData.map(d => [d.name, d.value.toString()]),
      ['', ''], ['--- Spending by Test ---', ''],
      ...spendingByTest.map(d => [d.name, `$${d.amount.toFixed(2)}`]),
    ];
    downloadCSV(`analytics_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    toast({ title: 'Export complete', description: 'Analytics data exported.' });
  };

  // ─── Computed Values ──────────────────────────────────────

  const activeTests = tests.filter(t => t.status === 'active').length;
  const totalTesters = submissions.length;
  const pendingReviews = submissions.filter(s => s.status === 'submitted').length;
  const totalSpent = submissions.filter(s => s.status === 'approved').reduce((sum, s) => sum + Number(s.tests?.reward_amount || 0), 0);
  const approvedCount = submissions.filter(s => s.status === 'approved').length;
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length;
  const reviewedCount = approvedCount + rejectedCount;
  const approvalRate = reviewedCount > 0 ? Math.round((approvedCount / reviewedCount) * 100) : 0;
  const avgRating = useMemo(() => {
    const rated = submissions.filter(s => s.rating && s.rating > 0);
    return rated.length === 0 ? 0 : rated.reduce((sum, s) => sum + (s.rating || 0), 0) / rated.length;
  }, [submissions]);
  const completionRate = useMemo(() => {
    if (submissions.length === 0) return 0;
    return Math.round((submissions.filter(s => s.status !== 'in_progress').length / submissions.length) * 100);
  }, [submissions]);
  const uniqueTesters = useMemo(() => new Set(submissions.map(s => s.tester_id)).size, [submissions]);

  // Charts
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    tests.forEach(t => { const cat = t.category || 'Other'; counts[cat] = (counts[cat] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tests]);

  const submissionStatusData = useMemo(() => {
    const counts: Record<string, number> = { 'In Progress': 0, Submitted: 0, Approved: 0, Rejected: 0 };
    submissions.forEach(s => {
      if (s.status === 'in_progress') counts['In Progress']++;
      else if (s.status === 'submitted') counts['Submitted']++;
      else if (s.status === 'approved') counts['Approved']++;
      else if (s.status === 'rejected') counts['Rejected']++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [submissions]);

  const spendingByTest = useMemo(() => {
    const spending: Record<string, number> = {};
    submissions.filter(s => s.status === 'approved').forEach(s => {
      const title = s.tests?.title || 'Unknown';
      const short = title.length > 20 ? title.slice(0, 20) + '…' : title;
      spending[short] = (spending[short] || 0) + Number(s.tests?.reward_amount || 0);
    });
    return Object.entries(spending).map(([name, amount]) => ({ name, amount }));
  }, [submissions]);

  const recentActivity = useMemo(() => {
    return [...submissions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);
  }, [submissions]);

  // Filtered tests
  const filteredTests = useMemo(() => {
    let list = tests;
    if (testStatusFilter !== 'all') list = list.filter(t => t.status === testStatusFilter);
    if (testSearchQuery.trim()) {
      const q = testSearchQuery.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || (t.category || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q));
    }
    return list;
  }, [tests, testStatusFilter, testSearchQuery]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    let list = submissions;
    if (submissionFilter !== 'all') list = list.filter(s => s.status === submissionFilter);
    if (submissionTestFilter !== 'all') list = list.filter(s => s.test_id === submissionTestFilter);
    return list;
  }, [submissions, submissionFilter, submissionTestFilter]);

  const selectedTest = selectedTestId ? tests.find(t => t.id === selectedTestId) || null : null;

  // ─── Loading / Auth ───────────────────────────────────────

  if (authLoading || loading) {
    return (
      <>
        <Background3D />
        <Navbar />
        <main className="min-h-screen pt-20 px-4">
          <div className="container mx-auto max-w-7xl py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-muted rounded-xl w-64" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-muted rounded-xl" />)}
              </div>
              <div className="h-96 bg-muted rounded-2xl" />
            </div>
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
        <title>Recruiter Dashboard — User Ninjas</title>
        <meta name="description" content="Manage your tests, review submissions, and track tester engagement." />
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
                  const badge = item.key === 'submissions' && pendingReviews > 0 ? pendingReviews :
                    item.key === 'ai_interviews' && aiInterviewSessions.length > 0 ? aiInterviewSessions.length : null;
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

              <Separator className="my-3 mx-2" />

              <div className="space-y-1 px-2">
                {/* Create Test */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/recruiter/create-test" className={`flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all`}>
                      <Plus className="h-4.5 w-4.5 shrink-0" />
                      {!sidebarCollapsed && <span>Create Test</span>}
                    </Link>
                  </TooltipTrigger>
                  {sidebarCollapsed && <TooltipContent side="right">Create Test</TooltipContent>}
                </Tooltip>

                {/* AI Chat */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setChatOpen(true)}
                      className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
                    >
                      <MessageSquare className="h-4.5 w-4.5 shrink-0" />
                      {!sidebarCollapsed && <span>AI Assistant</span>}
                    </button>
                  </TooltipTrigger>
                  {sidebarCollapsed && <TooltipContent side="right">AI Assistant</TooltipContent>}
                </Tooltip>
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
                    {section === 'overview' && <>Welcome back, <span className="text-gradient">{user.email?.split('@')[0] || 'Recruiter'}</span></>}
                    {section === 'tests' && 'My Tests'}
                    {section === 'submissions' && 'Submissions'}
                    {section === 'insights' && 'AI Insights'}
                    {section === 'ai_interviews' && 'AI Interviews'}
                    {section === 'surveys' && 'Surveys'}
                    {section === 'analytics' && 'Analytics'}
                    {section === 'payments' && 'Billing & Payments'}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {section === 'overview' && `${activeTests} active tests · ${totalTesters} submissions · $${totalSpent.toFixed(0)} spent`}
                    {section === 'tests' && `${tests.length} total · ${activeTests} active`}
                    {section === 'submissions' && `${submissions.length} total · ${pendingReviews} pending review`}
                    {section === 'insights' && 'AI-powered analysis of your test submissions'}
                    {section === 'ai_interviews' && `${aiInterviewSessions.length} sessions`}
                    {section === 'surveys' && `${surveys.length} surveys`}
                    {section === 'analytics' && 'Performance metrics and insights'}
                    {section === 'payments' && `${profile?.plan_type || 'free'} plan · manage subscription & credits`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={fetchData} className="gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                  </Button>
                  {section === 'tests' && (
                    <Link to="/recruiter/create-test">
                      <Button size="sm" className="btn-shimmer gap-1.5 rounded-xl shadow-md shadow-primary/20 font-semibold">
                        <Plus className="h-3.5 w-3.5" /> New Test
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* ══════════════════════════════════════════════════ */}
              {/*  OVERVIEW SECTION                                  */}
              {/* ══════════════════════════════════════════════════ */}
              {section === 'overview' && (
                <div className="space-y-6">
                  {/* Stat cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      { label: 'Active Tests', value: activeTests, icon: Layers, color: 'text-primary', bg: 'bg-primary/10' },
                      { label: 'Pending Reviews', value: pendingReviews, icon: AlertCircle, color: pendingReviews > 0 ? 'text-yellow-500' : 'text-muted-foreground', bg: pendingReviews > 0 ? 'bg-yellow-500/10' : 'bg-secondary' },
                      { label: 'Unique Testers', value: uniqueTesters, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                      { label: 'Total Spent', value: `$${totalSpent.toFixed(0)}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
                      { label: 'Approval Rate', value: `${approvalRate}%`, icon: Percent, color: 'text-primary', bg: 'bg-primary/10' },
                      { label: 'Avg Rating', value: avgRating > 0 ? avgRating.toFixed(1) : '—', icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    ].map((s, i) => (
                      <ScrollReveal key={s.label} animation="zoom-up" delay={i * 60}>
                        <Card className="border border-border/50 shadow-sm spring-card hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
                              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                                <s.icon className={`h-4 w-4 ${s.color}`} />
                              </div>
                            </div>
                            <p className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</p>
                          </CardContent>
                        </Card>
                      </ScrollReveal>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <Card className="border border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        <Link to="/recruiter/create-test">
                          <Button size="sm" className="gap-2 rounded-xl"><Plus className="h-3.5 w-3.5" /> Create Test</Button>
                        </Link>
                        <Button size="sm" variant="outline" className="gap-2 rounded-xl" onClick={() => setSection('submissions')}>
                          <Users className="h-3.5 w-3.5" /> Review Submissions {pendingReviews > 0 && <Badge className="bg-yellow-500 text-white text-[10px] px-1.5 py-0">{pendingReviews}</Badge>}
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2 rounded-xl" onClick={() => setChatOpen(true)}>
                          <MessageSquare className="h-3.5 w-3.5" /> AI Assistant
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2 rounded-xl" onClick={() => setSection('analytics')}>
                          <BarChart3 className="h-3.5 w-3.5" /> View Analytics
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2 rounded-xl" onClick={() => { setSection('surveys'); setSurveyTab('create'); }}>
                          <ClipboardList className="h-3.5 w-3.5" /> Create Survey
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Mini charts */}
                    {submissionStatusData.some(d => d.value > 0) && (
                      <Card className="border border-border/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2"><PieChart className="h-4 w-4 text-primary" /> Submission Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={220}>
                            <RechartsPie>
                              <Pie data={submissionStatusData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                {submissionStatusData.filter(d => d.value > 0).map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                            </RechartsPie>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Recent Activity */}
                    <Card className="border border-border/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {recentActivity.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center mb-3">
                              <Activity className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <h3 className="font-medium text-sm">No activity yet</h3>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                              When testers start interacting with your tests, their activity will appear here.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {recentActivity.slice(0, 5).map(sub => (
                              <div key={sub.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 border border-border/30">
                                <div className={`w-2 h-2 rounded-full shrink-0 ${sub.status === 'approved' ? 'bg-green-500' : sub.status === 'submitted' ? 'bg-yellow-500' : sub.status === 'rejected' ? 'bg-red-500' : 'bg-muted-foreground'}`} />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">{sub.tests?.title || 'Unknown'}</p>
                                  <p className="text-xs text-muted-foreground">{sub.tester_id.slice(0, 8)}… · {new Date(sub.created_at).toLocaleDateString()}</p>
                                </div>
                                {getStatusBadge(sub.status)}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════ */}
              {/*  MY TESTS SECTION                                  */}
              {/* ══════════════════════════════════════════════════ */}
              {section === 'tests' && (
                <div className="space-y-4">
                  {/* Search & Filter Bar */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search tests..." value={testSearchQuery} onChange={e => setTestSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                    <div className="flex gap-2">
                      {['all', 'active', 'paused', 'completed'].map(f => (
                        <Button key={f} variant={testStatusFilter === f ? 'default' : 'outline'} size="sm" className="capitalize" onClick={() => setTestStatusFilter(f)}>
                          {f === 'all' ? 'All' : f}
                          {f !== 'all' && <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-xs">{tests.filter(t => t.status === f).length}</Badge>}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {filteredTests.length === 0 ? (
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardContent className="pt-12 pb-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-foreground font-medium">
                          {tests.length === 0 ? "You haven't created any tests yet." : 'No tests match your filters.'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {tests.length === 0 ? 'Create your first test to start receiving submissions!' : 'Try adjusting your search or filters.'}
                        </p>
                        {tests.length === 0 && (
                          <Link to="/recruiter/create-test">
                            <Button className="mt-4"><Plus className="h-4 w-4 mr-2" />Create Test</Button>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {filteredTests.map(test => {
                        const testSubs = submissions.filter(s => s.test_id === test.id);
                        const testApproved = testSubs.filter(s => s.status === 'approved').length;
                        const testPending = testSubs.filter(s => s.status === 'submitted').length;
                        const fillRate = test.max_testers ? Math.round((testSubs.length / test.max_testers) * 100) : 0;
                        const isSelected = selectedTestId === test.id;
                        return (
                          <div key={test.id}>
                            <Card className={`bg-card border shadow-sm border-l-4 overflow-hidden transition-all duration-300 hover:shadow-lg spring-card cursor-pointer ${
                              test.status === 'active' ? 'border-l-primary' : test.status === 'paused' ? 'border-l-yellow-500' : 'border-l-muted-foreground/30'
                            } ${isSelected ? 'border-border ring-2 ring-primary/20' : 'border-border/60'}`}
                              onClick={() => setSelectedTestId(isSelected ? null : test.id)}
                            >
                              <CardContent className="p-5">
                                <div className="flex flex-col md:flex-row md:items-start gap-4">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <h3 className="font-semibold text-base truncate">{test.title}</h3>
                                      {getStatusBadge(test.status)}
                                      {test.test_type && <Badge variant="outline" className="text-xs capitalize">{test.test_type.replace('_', ' ')}</Badge>}
                                      {test.category && <Badge variant="secondary" className="text-xs">{test.category}</Badge>}
                                    </div>
                                    {test.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{test.description}</p>}
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                                      <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-green-500" /><span className="font-semibold text-foreground">${Number(test.reward_amount).toFixed(2)}</span></span>
                                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{test.estimated_duration} mins</span>
                                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{testSubs.length}/{test.max_testers} testers</span>
                                      <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-3.5 w-3.5" />{testApproved} approved</span>
                                      {testPending > 0 && <span className="flex items-center gap-1 text-yellow-500 font-medium"><AlertCircle className="h-3.5 w-3.5" />{testPending} pending</span>}
                                    </div>
                                    <div>
                                      <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Fill rate</span><span className="font-medium">{fillRate}%</span></div>
                                      <Progress value={fillRate} className="h-1.5" />
                                    </div>
                                  </div>
                                  <div className="flex md:flex-col gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                                    <Button variant="outline" size="sm" className="text-xs" onClick={() => handleToggleStatus(test)}>
                                      {test.status === 'active' ? <><XCircle className="h-3.5 w-3.5 mr-1" />Pause</> : <><CheckCircle className="h-3.5 w-3.5 mr-1" />Activate</>}
                                    </Button>
                                    <Dialog open={editingTest?.id === test.id} onOpenChange={open => !open && setEditingTest(null)}>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="text-xs" onClick={() => openEditDialog(test)}>
                                          <Edit className="h-3.5 w-3.5 mr-1" />Edit
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                          <DialogTitle>Edit Test</DialogTitle>
                                          <DialogDescription>Update the details of your test.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-title">Test Title *</Label>
                                            <Input id="edit-title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-description">Description</Label>
                                            <Textarea id="edit-description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} />
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-requirements">Requirements</Label>
                                            <Textarea id="edit-requirements" value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} rows={2} />
                                          </div>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                              <Label htmlFor="edit-reward">Reward ($) *</Label>
                                              <Input id="edit-reward" type="number" min="0" step="0.01" value={formData.reward_amount} onChange={e => setFormData({ ...formData, reward_amount: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                              <Label htmlFor="edit-duration">Duration (mins) *</Label>
                                              <Input id="edit-duration" type="number" min="1" value={formData.estimated_duration} onChange={e => setFormData({ ...formData, estimated_duration: e.target.value })} />
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                              <Label htmlFor="edit-category">Category</Label>
                                              <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                                                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                                <SelectContent>{categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                                              </Select>
                                            </div>
                                            <div className="space-y-2">
                                              <Label htmlFor="edit-max_testers">Max Testers</Label>
                                              <Input id="edit-max_testers" type="number" min="1" value={formData.max_testers} onChange={e => setFormData({ ...formData, max_testers: e.target.value })} />
                                            </div>
                                          </div>
                                        </div>
                                        <DialogFooter>
                                          <Button variant="outline" onClick={() => { setEditingTest(null); resetForm(); }}>Cancel</Button>
                                          <Button onClick={handleEditTest}>Save Changes</Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                    <Button variant="outline" size="sm" className="text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleDeleteTest(test.id)}>
                                      <Trash2 className="h-3.5 w-3.5 mr-1" />Delete
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Inline Detail Panel */}
                            {isSelected && selectedTest && (
                              <div className="mt-2">
                                <TestDetailPanel
                                  test={selectedTest}
                                  submissionCount={submissions.filter(s => s.test_id === test.id).length}
                                  approvedCount={submissions.filter(s => s.test_id === test.id && s.status === 'approved').length}
                                  pendingCount={submissions.filter(s => s.test_id === test.id && s.status === 'submitted').length}
                                  onClose={() => setSelectedTestId(null)}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ══════════════════════════════════════════════════ */}
              {/*  SUBMISSIONS SECTION                               */}
              {/* ══════════════════════════════════════════════════ */}
              {section === 'submissions' && (
                <div className="space-y-4">
                  {/* Filter Bar */}
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      {['all', 'in_progress', 'submitted', 'approved', 'rejected'].map(f => (
                        <Button key={f} variant={submissionFilter === f ? 'default' : 'outline'} size="sm" className="capitalize" onClick={() => setSubmissionFilter(f)}>
                          {f === 'all' ? 'All' : f.replace('_', ' ')}
                          {f !== 'all' && <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-xs">{submissions.filter(s => s.status === f).length}</Badge>}
                        </Button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={submissionTestFilter} onValueChange={setSubmissionTestFilter}>
                        <SelectTrigger className="w-44 h-8 text-sm"><SelectValue placeholder="All tests" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Tests</SelectItem>
                          {tests.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={summarizeAllTranscripts} disabled={bulkSummarizing || submissions.filter(s => s.transcript && !s.transcript_summary).length === 0}>
                        <Sparkles className="h-4 w-4 mr-1.5" />
                        {bulkSummarizing ? `${bulkProgress.done}/${bulkProgress.total}…` : `Summarize (${submissions.filter(s => s.transcript && !s.transcript_summary).length})`}
                      </Button>
                      <Button variant="outline" size="sm" onClick={exportSubmissions} disabled={filteredSubmissions.length === 0}>
                        <Download className="h-4 w-4 mr-1.5" /> CSV
                      </Button>
                    </div>
                  </div>

                  {filteredSubmissions.length === 0 ? (
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardContent className="pt-12 pb-12 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-foreground font-medium">
                          {submissionFilter === 'all' ? 'No submissions yet.' : `No ${submissionFilter.replace('_', ' ')} submissions.`}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">Submissions will appear here when testers start your tests.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {filteredSubmissions.map(submission => {
                        const isExpanded = expandedSubmissionId === submission.id;
                        return (
                          <Card key={submission.id} className={`bg-card border shadow-sm border-l-4 overflow-hidden transition-all ${
                            submission.status === 'submitted' ? 'border-l-yellow-500' : submission.status === 'approved' ? 'border-l-green-500'
                            : submission.status === 'rejected' ? 'border-l-destructive' : 'border-l-muted-foreground/30'
                          } ${isExpanded ? 'border-border ring-1 ring-primary/10' : 'border-border/60'}`}>
                            <CardContent className="p-4">
                              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setExpandedSubmissionId(isExpanded ? null : submission.id)}>
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className="font-semibold text-sm truncate">{submission.tests?.title || 'Test'}</h3>
                                    {getStatusBadge(submission.status)}
                                    <span className="text-sm font-semibold text-green-600">${Number(submission.tests?.reward_amount || 0).toFixed(2)}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Tester: {submission.tester_id.slice(0, 8)}…&nbsp;·&nbsp;
                                    Started: {new Date(submission.created_at).toLocaleDateString()}
                                    {submission.submitted_at && <>&nbsp;·&nbsp;Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</>}
                                  </p>
                                </div>

                                {/* Review actions */}
                                {submission.status === 'submitted' && (
                                  <div className="flex flex-col gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">Rate:</span>
                                      <StarRating rating={reviewRating[submission.id] || 0} interactive onRatingChange={r => setReviewRating(prev => ({ ...prev, [submission.id]: r }))} />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600 text-white h-8 text-xs" onClick={() => handleReviewSubmission(submission.id, 'approved', submission)}>
                                        <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
                                      </Button>
                                      <Button size="sm" variant="outline" className="flex-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground h-8 text-xs" onClick={() => handleReviewSubmission(submission.id, 'rejected', submission)}>
                                        <XCircle className="h-3.5 w-3.5 mr-1" />Reject
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                {submission.status === 'approved' && submission.rating && (
                                  <div className="flex items-center gap-1 flex-shrink-0"><StarRating rating={submission.rating} size="sm" /></div>
                                )}
                              </div>

                              {/* Expandable Detail */}
                              {isExpanded && (
                                <SubmissionDetailPanel
                                  submission={submission}
                                  testTitle={submission.tests?.title || 'Test'}
                                  rewardAmount={submission.tests?.reward_amount || 0}
                                  onSummarize={() => handleSummarizeTranscript(submission.id)}
                                />
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ══════════════════════════════════════════════════ */}
              {/*  AI INSIGHTS SECTION                               */}
              {/* ══════════════════════════════════════════════════ */}
              {section === 'insights' && (
                !isYearly ? (
                  <Card className="border border-border/50 bg-card/50 backdrop-blur-md overflow-hidden relative py-12 px-6 text-center max-w-2xl mx-auto mt-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-card opacity-50" />
                    <CardHeader className="relative pb-2">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                        <Crown className="h-6 w-6 text-amber-500" />
                      </div>
                      <CardTitle className="text-xl font-bold font-display">AI Insights Locked</CardTitle>
                      <CardDescription className="text-sm">
                        AI-powered analysis and Insights reports are exclusive to the Yearly Enterprise plan.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative space-y-4 pt-4">
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Upgrade to Yearly Enterprise to unlock AI Insights, sentiment analyses, automated summaries, and friction point maps.
                      </p>
                      <div className="flex justify-center gap-3 pt-2">
                        <Button 
                          onClick={() => setPricingModalOpen(true)}
                          className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold rounded-xl text-xs h-9"
                        >
                          View Pricing Plans
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <AIInsightsPanel tests={tests} userId={user.id} />
                )
              )}

              {/* ══════════════════════════════════════════════════ */}
              {/*  AI INTERVIEWS SECTION                             */}
              {/* ══════════════════════════════════════════════════ */}
              {section === 'ai_interviews' && (
                !isPremium ? (
                  <Card className="border border-border/50 bg-card/50 backdrop-blur-md overflow-hidden relative py-12 px-6 text-center max-w-2xl mx-auto mt-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-card opacity-50" />
                    <CardHeader className="relative pb-2">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                        <Crown className="h-6 w-6 text-amber-500" />
                      </div>
                      <CardTitle className="text-xl font-bold font-display">AI Interviews Locked</CardTitle>
                      <CardDescription className="text-sm">
                        AI-moderated research interviews are exclusive to the Monthly Standard and Yearly Enterprise plans.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative space-y-4 pt-4">
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Upgrade to a premium plan to launch unmoderated AI-guided interviews conducted automatically by our Gemini researcher.
                      </p>
                      <div className="flex justify-center gap-3 pt-2">
                        <Button 
                          onClick={() => setPricingModalOpen(true)}
                          className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold rounded-xl text-xs h-9"
                        >
                          View Pricing Plans
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Show a banner if on Monthly Standard plan with the usage stats */}
                    {planKey === 'monthly' && (
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                        <div>
                          <p className="text-sm font-semibold text-primary">Monthly Plan AI Interview Sessions</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Your Monthly Standard plan allows up to 3 AI Interview sessions per month.</p>
                        </div>
                        <Badge variant="outline" className="bg-background border-primary/30 font-semibold">
                          Used: {aiInterviewSessions.filter(s => s.status === 'completed').length} / 3 Sessions
                        </Badge>
                      </div>
                    )}
                  {/* Stats row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Sessions', value: aiInterviewSessions.length, icon: Bot, color: 'text-primary', bg: 'bg-primary/10' },
                      { label: 'Completed', value: aiInterviewSessions.filter(s => s.status === 'completed').length, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
                      { label: 'Profile Matched', value: aiInterviewSessions.filter(s => s.eligible === true).length, icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                      { label: 'Total Friction Pts', value: aiInterviewSessions.reduce((acc, s) => acc + ((s.friction_points as unknown[])?.length || 0), 0), icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                    ].map((stat, i) => (
                      <ScrollReveal key={stat.label} animation="zoom-up" delay={i * 80}>
                        <Card className="border border-border/50 bg-card shadow-sm spring-card">
                          <CardContent className="pt-5 pb-5">
                            <div className="flex items-start justify-between mb-3">
                              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                              </div>
                            </div>
                            <p className={`text-2xl font-bold font-display stat-number ${stat.color}`}>{stat.value}</p>
                          </CardContent>
                        </Card>
                      </ScrollReveal>
                    ))}
                  </div>

                  {aiInterviewSessions.length === 0 ? (
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardContent className="pt-12 pb-12 text-center">
                        <div className="relative mx-auto mb-5 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                          <Bot className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-foreground font-semibold">No AI interview sessions yet.</p>
                        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                          Create an AI Interview type test — testers will speak with UserNinjas AI and their sessions will appear here with profile analysis and friction reports.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {aiInterviewSessions.map(session => {
                        const frictionPoints = (session.friction_points as Array<{ severity: string; title: string; description: string }>) || [];
                        const insights = (session.insights as Array<{ category: string; recommendation: string; priority: string }>) || [];
                        const keyQuotes = session.key_quotes || [];
                        const hasReport = frictionPoints.length > 0 || insights.length > 0;
                        const durationMin = session.duration_seconds ? Math.round(session.duration_seconds / 60) : null;
                        const criticalCount = frictionPoints.filter(f => f.severity === 'critical').length;
                        const majorCount = frictionPoints.filter(f => f.severity === 'major').length;
                        return (
                          <Card key={session.id} className={`bg-card border border-border/60 shadow-sm border-l-4 overflow-hidden transition-all duration-300 hover:shadow-lg spring-card ${
                            session.status === 'completed' ? 'border-l-green-500' :
                            session.status === 'in_progress' ? 'border-l-blue-500' :
                            'border-l-muted-foreground/30'
                          }`}>
                            <CardContent className="p-5">
                              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex-shrink-0">
                                      <Bot className="h-3 w-3 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-sm truncate">{session.tests?.title || 'Unknown Test'}</h3>
                                    {getStatusBadge(session.status)}
                                    {session.eligible === true && (
                                      <Badge className="bg-green-500/15 text-green-500 border-green-500/30 border text-xs gap-1">
                                        <CheckCircle className="h-3 w-3" /> Profile Match
                                      </Badge>
                                    )}
                                    {session.eligible === false && (
                                      <Badge variant="secondary" className="text-xs gap-1"><XCircle className="h-3 w-3" /> No Match</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    Tester: <span className="font-mono">{session.tester_id.slice(0, 8)}…</span>
                                    {durationMin !== null && <> · <Clock className="inline h-3 w-3 mx-0.5" />{durationMin} min</>}
                                    {' · '}{new Date(session.created_at).toLocaleDateString()}
                                  </p>
                                  {session.eligibility_reason && (
                                    <p className="text-xs text-muted-foreground italic mb-2 bg-muted/40 px-2 py-1 rounded-lg">{session.eligibility_reason}</p>
                                  )}
                                  {hasReport && (
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                      {criticalCount > 0 && <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-destructive/15 text-destructive border border-destructive/30 px-2 py-0.5 rounded-full"><AlertCircle className="h-3 w-3" /> {criticalCount} critical</span>}
                                      {majorCount > 0 && <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full"><AlertCircle className="h-3 w-3" /> {majorCount} major</span>}
                                      {insights.length > 0 && <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 rounded-full"><Sparkles className="h-3 w-3" /> {insights.length} insight{insights.length !== 1 ? 's' : ''}</span>}
                                      {keyQuotes.length > 0 && <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded-full"><MessageSquare className="h-3 w-3" /> {keyQuotes.length} quote{keyQuotes.length !== 1 ? 's' : ''}</span>}
                                    </div>
                                  )}
                                  {keyQuotes.length > 0 && (
                                    <blockquote className="text-xs italic text-muted-foreground border-l-2 border-primary/40 pl-2 line-clamp-2">"{keyQuotes[0]}"</blockquote>
                                  )}
                                  {!hasReport && session.status === 'completed' && (
                                    <p className="text-xs text-muted-foreground italic">Session completed — report generating…</p>
                                  )}
                                </div>
                                {hasReport && (
                                  <Button size="sm" className="flex-shrink-0 gap-1.5 bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all" variant="outline" onClick={() => setViewingSession(session)}>
                                    <Sparkles className="h-3.5 w-3.5" /> Full Analysis
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}

                  {/* Report dialog */}
                  <Dialog open={!!viewingSession} onOpenChange={open => !open && setViewingSession(null)}>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader className="pb-2">
                        <DialogTitle className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span><span className="text-foreground">User</span><span className="text-primary">Ninjas</span> AI Analysis Report</span>
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                          {viewingSession?.tests?.title} · Tester: {viewingSession?.tester_id.slice(0, 8)}…
                        </DialogDescription>
                      </DialogHeader>
                      {viewingSession && viewingSession.friction_points && (
                        <AIInterviewReport
                          testTitle={viewingSession.tests?.title || 'Unknown Test'}
                          report={{
                            friction_points: viewingSession.friction_points as InterviewReport['friction_points'],
                            insights: viewingSession.insights as InterviewReport['insights'],
                            key_quotes: viewingSession.key_quotes || [],
                            sentiment: 'neutral',
                            summary: '',
                            session_id: viewingSession.id,
                          }}
                          onClose={() => setViewingSession(null)}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
                )
              )}

              {/* ══════════════════════════════════════════════════ */}
              {/*  SURVEYS SECTION                                   */}
              {/* ══════════════════════════════════════════════════ */}
              {section === 'surveys' && (
                !isPremium ? (
                  <Card className="border border-border/50 bg-card/50 backdrop-blur-md overflow-hidden relative py-12 px-6 text-center max-w-2xl mx-auto mt-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-card opacity-50" />
                    <CardHeader className="relative pb-2">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                        <Crown className="h-6 w-6 text-amber-500" />
                      </div>
                      <CardTitle className="text-xl font-bold font-display">Surveys Locked</CardTitle>
                      <CardDescription className="text-sm">
                        Custom questionnaires and surveys are exclusive to the Monthly Standard and Yearly Enterprise plans.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative space-y-4 pt-4">
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Upgrade to a premium plan to build complex surveys, MCQ feedback loops, rating lists, and logic branching.
                      </p>
                      <div className="flex justify-center gap-3 pt-2">
                        <Button 
                          onClick={() => setPricingModalOpen(true)}
                          className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold rounded-xl text-xs h-9"
                        >
                          View Pricing Plans
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {/* Show survey limit warning if on monthly plan */}
                    {planKey === 'monthly' && (
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                          <p className="text-sm font-semibold text-primary">Monthly Plan Surveys Limit</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Your Monthly Standard plan allows up to 3 surveys created.</p>
                        </div>
                        <Badge variant="outline" className="bg-background border-primary/30 font-semibold">
                          Surveys: {surveys.length} / 3 Created
                        </Badge>
                      </div>
                    )}
                  {/* Tab row */}
                  <div className="flex items-center gap-2">
                    {[
                      { key: 'list' as const, label: 'My Surveys', icon: ClipboardList },
                      { key: 'create' as const, label: 'Create Survey', icon: Plus },
                      { key: 'results' as const, label: 'Results', icon: BarChart3 },
                    ].map(tab => (
                      <Button
                        key={tab.key}
                        variant={surveyTab === tab.key ? 'default' : 'outline'}
                        size="sm"
                        className="gap-1.5"
                        onClick={() => {
                          if (tab.key === 'create' && planKey === 'monthly' && surveys.length >= 3) {
                            toast({
                              title: 'Survey Limit Reached',
                              description: 'Your Monthly Standard plan allows max 3 surveys. Please archive/delete a survey, or upgrade to Yearly Enterprise.',
                              variant: 'destructive'
                            });
                            return;
                          }
                          setSurveyTab(tab.key);
                        }}
                      >
                        <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                      </Button>
                    ))}
                  </div>

                  {/* Survey List */}
                  {surveyTab === 'list' && (
                    <Card className="border border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Your Surveys</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {surveys.length === 0 ? (
                          <div className="text-center py-8">
                            <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground text-sm">No surveys yet.</p>
                            <Button size="sm" className="mt-3" onClick={() => setSurveyTab('create')}><Plus className="h-3.5 w-3.5 mr-1.5" /> Create Survey</Button>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {surveys.map(s => (
                                <TableRow key={s.id}>
                                  <TableCell className="font-medium">{s.title}</TableCell>
                                  <TableCell>{getStatusBadge(s.status)}</TableCell>
                                  <TableCell className="text-muted-foreground text-sm">{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                                  <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="gap-1" onClick={() => fetchSurveyResponses(s.id)}>
                                      <Eye className="h-3.5 w-3.5" /> Results
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Create Survey */}
                  {surveyTab === 'create' && (
                    <Card className="border border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Create Survey</CardTitle>
                        <CardDescription>Build a standalone survey with multiple question types</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Survey Title *</Label>
                          <Input value={surveyTitle} onChange={e => setSurveyTitle(e.target.value)} placeholder="e.g., Product satisfaction survey" />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea value={surveyDescription} onChange={e => setSurveyDescription(e.target.value)} placeholder="Brief description..." rows={3} />
                        </div>
                        <div className="space-y-3">
                          <Label>Questions</Label>
                          {surveyQuestions.map((q, i) => (
                            <div key={i} className="p-4 border border-border rounded-lg space-y-3">
                              <div className="flex gap-2">
                                <span className="text-muted-foreground font-mono text-sm mt-2 w-6 text-center">{i + 1}</span>
                                <Input className="flex-1" value={q.question_text} onChange={e => {
                                  const u = [...surveyQuestions]; u[i].question_text = e.target.value; setSurveyQuestions(u);
                                }} placeholder="Question text" />
                                <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => setSurveyQuestions(surveyQuestions.filter((_, idx) => idx !== i))}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex gap-3 flex-wrap pl-8">
                                <Select value={q.question_type} onValueChange={v => {
                                  const u = [...surveyQuestions]; u[i].question_type = v as any; setSurveyQuestions(u);
                                }}>
                                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="open_text">Open Text</SelectItem>
                                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                                    <SelectItem value="rating">Rating (1–5)</SelectItem>
                                    <SelectItem value="yes_no">Yes / No</SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="flex items-center gap-2">
                                  <Checkbox checked={q.required} onCheckedChange={v => {
                                    const u = [...surveyQuestions]; u[i].required = v as boolean; setSurveyQuestions(u);
                                  }} />
                                  <Label className="text-xs">Required</Label>
                                </div>
                              </div>
                              {q.question_type === 'mcq' && (
                                <div className="space-y-2 pl-8">
                                  {(q.options.length === 0 ? ['', ''] : q.options).map((opt, oi) => (
                                    <Input key={oi} value={opt} onChange={e => {
                                      const u = [...surveyQuestions];
                                      const newOpts = [...(u[i].options.length === 0 ? ['', ''] : u[i].options)];
                                      newOpts[oi] = e.target.value;
                                      u[i].options = newOpts;
                                      setSurveyQuestions(u);
                                    }} placeholder={`Option ${oi + 1}`} className="text-sm" />
                                  ))}
                                  <Button variant="ghost" size="sm" onClick={() => {
                                    const u = [...surveyQuestions];
                                    u[i].options = [...(u[i].options.length === 0 ? ['', ''] : u[i].options), ''];
                                    setSurveyQuestions(u);
                                  }}><Plus className="h-3 w-3 mr-1" /> Add Option</Button>
                                </div>
                              )}
                            </div>
                          ))}
                          <Button variant="outline" className="w-full" onClick={() => setSurveyQuestions([...surveyQuestions, { question_text: '', question_type: 'open_text', options: [], required: true, logic_branch: null }])}>
                            <Plus className="h-4 w-4 mr-2" /> Add Question
                          </Button>
                        </div>
                        <Button onClick={handleCreateSurvey} disabled={savingSurvey} className="w-full">
                          <Send className="h-4 w-4 mr-2" /> {savingSurvey ? 'Creating...' : 'Create & Publish Survey'}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Survey Results */}
                  {surveyTab === 'results' && (
                    <Card className="border border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Survey Results</CardTitle>
                        <CardDescription>{selectedSurveyId ? `${surveyResponses.length} responses` : 'Select a survey from Your Surveys'}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {!selectedSurveyId ? (
                          <p className="text-muted-foreground text-center py-8 text-sm">Select a survey to view results</p>
                        ) : surveyResponses.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8 text-sm">No responses yet</p>
                        ) : (
                          <div className="space-y-3">
                            {surveyResponses.map((r: any, i: number) => (
                              <div key={r.id} className="p-4 border border-border rounded-lg">
                                <p className="text-xs text-muted-foreground mb-2">Response {i + 1} · {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                <pre className="text-sm whitespace-pre-wrap bg-secondary/30 p-3 rounded-lg">{JSON.stringify(r.answers, null, 2)}</pre>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
                )
              )}

              {/* ══════════════════════════════════════════════════ */}
              {/*  ANALYTICS SECTION                                 */}
              {/* ══════════════════════════════════════════════════ */}
              {section === 'analytics' && (
                !isYearly ? (
                  <Card className="border border-border/50 bg-card/50 backdrop-blur-md overflow-hidden relative py-12 px-6 text-center max-w-2xl mx-auto mt-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-card opacity-50" />
                    <CardHeader className="relative pb-2">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                        <Crown className="h-6 w-6 text-amber-500" />
                      </div>
                      <CardTitle className="text-xl font-bold font-display">Enterprise Analytics Locked</CardTitle>
                      <CardDescription className="text-sm">
                        Advanced analytics and CSV export features are exclusive to the Yearly Enterprise plan.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative space-y-4 pt-4">
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Upgrade to Yearly Enterprise to unlock advanced graphs, category breakdowns, detailed spending layouts, and complete database downloads.
                      </p>
                      <div className="flex justify-center gap-3 pt-2">
                        <Button 
                          onClick={() => setPricingModalOpen(true)}
                          className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold rounded-xl text-xs h-9"
                        >
                          View Pricing Plans
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {tests.length === 0 && submissions.length === 0 ? (
                      <Card className="bg-card border border-border/60 shadow-sm">
                        <CardContent className="pt-12 pb-12 text-center">
                          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-foreground font-medium">No data to analyze yet.</p>
                          <p className="text-sm text-muted-foreground mt-2">Create tests and receive submissions to see analytics.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <>
                      {/* KPI row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Completion Rate', value: `${completionRate}%`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
                          { label: 'Approval Rate', value: `${approvalRate}%`, icon: Percent, color: 'text-green-500', bg: 'bg-green-500/10' },
                          { label: 'Avg Rating', value: avgRating > 0 ? avgRating.toFixed(1) : '—', icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                          { label: 'Total Spend', value: `$${totalSpent.toFixed(2)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-500/10' },
                        ].map((s, i) => (
                          <ScrollReveal key={s.label} animation="zoom-up" delay={i * 60}>
                            <Card className="border border-border/50 shadow-sm spring-card">
                              <CardContent className="pt-5 pb-5">
                                <div className="flex items-start justify-between mb-3">
                                  <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                                  <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}><s.icon className={`h-4 w-4 ${s.color}`} /></div>
                                </div>
                                <p className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</p>
                              </CardContent>
                            </Card>
                          </ScrollReveal>
                        ))}
                      </div>

                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={exportAnalytics}>
                          <Download className="h-4 w-4 mr-1.5" /> Export Analytics CSV
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Submission Status Pie */}
                        <Card className="border border-border/50">
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2"><PieChart className="h-4 w-4 text-primary" /> Submission Status</CardTitle>
                            <CardDescription>Breakdown of all submissions by status</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={260}>
                              <RechartsPie>
                                <Pie data={submissionStatusData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                  {submissionStatusData.filter(d => d.value > 0).map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                  ))}
                                </Pie>
                                <RechartsTooltip />
                              </RechartsPie>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        {/* Tests by Category Bar */}
                        <Card className="border border-border/50">
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-accent" /> Tests by Category</CardTitle>
                            <CardDescription>Distribution of your tests across categories</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={260}>
                              <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Spending by Test */}
                      {spendingByTest.length > 0 && (
                        <Card className="border border-border/50">
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4 text-green-500" /> Spending by Test</CardTitle>
                            <CardDescription>Reward payouts for approved submissions per test</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={spendingByTest} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                <RechartsTooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                                <Bar dataKey="amount" fill="hsl(142, 71%, 45%)" radius={[0, 4, 4, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}

                      {/* Recent Activity Table */}
                      <Card className="border border-border/50">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Recent Activity</CardTitle>
                          <CardDescription>Latest submission activity across all your tests</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {recentActivity.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">No recent activity.</p>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Test</TableHead>
                                  <TableHead>Tester</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Rating</TableHead>
                                  <TableHead>Date</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {recentActivity.map(sub => (
                                  <TableRow key={sub.id}>
                                    <TableCell className="font-medium truncate max-w-[200px]">{sub.tests?.title || 'Unknown'}</TableCell>
                                    <TableCell className="text-muted-foreground">{sub.tester_id.slice(0, 8)}…</TableCell>
                                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                                    <TableCell>{sub.rating ? <StarRating rating={sub.rating} size="sm" /> : <span className="text-muted-foreground">—</span>}</TableCell>
                                    <TableCell className="text-muted-foreground">{new Date(sub.created_at).toLocaleDateString()}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  )}
                  </div>
                )
              )}

              {/* ══════════════════════════════════════════════════ */}
              {/*  PAYMENTS SECTION                                  */}
              {/* ══════════════════════════════════════════════════ */}
              {section === 'payments' && (
                <RecruiterPaymentsPanel
                  user={user}
                  profile={profile}
                  onUpgradePlan={() => setPricingModalOpen(true)}
                  onProfileRefresh={refreshProfile}
                />
              )}
            </div>
          </main>
        </div>
      </TooltipProvider>

      {/* ─── Pricing Modal ─── */}
      <PricingModal
        open={pricingModalOpen}
        onOpenChange={setPricingModalOpen}
        currentPlan={profile?.plan_type || 'free'}
      />

      {/* ─── Floating AI Chat Sheet ─── */}
      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetContent side="right" className="w-full sm:w-[540px] sm:max-w-[540px] p-0 flex flex-col">
          <SheetHeader className="px-6 pt-5 pb-3 border-b border-border/60">
            <SheetTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              AI Research Assistant
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <RecruiterChat />
          </div>
        </SheetContent>
      </Sheet>

      {/* Floating chat button (when sheet is closed) */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}
    </>
  );
}
