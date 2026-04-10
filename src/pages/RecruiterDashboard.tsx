import { useState, useEffect, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus,
  FileText,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Trash2,
  Edit,
  TrendingUp,
  Star,
  BarChart3,
  Activity,
  Target,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Award,
  Zap,
  PieChart,
  Download,
  FileText as FileTextIcon,
  Sparkles,
  Play as PlayIcon,
  LogOut,
  Bell,
  Settings,
  ChevronRight,
  Layers
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import StarRating from '@/components/StarRating';
import ScrollReveal from '@/components/ScrollReveal';
import AIInsightsPanel from '@/components/AIInsightsPanel';

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
  tests: {
    title: string;
    reward_amount: number;
  };
}

const categories = [
  'Usability',
  'Functionality',
  'Performance',
  'Security',
  'Accessibility',
  'Mobile',
  'Web App',
  'Other'
];

const CHART_COLORS = [
  'hsl(37, 95%, 55%)',
  'hsl(230, 60%, 52%)',
  'hsl(142, 71%, 45%)',
  'hsl(0, 84%, 60%)',
  'hsl(280, 65%, 55%)',
  'hsl(190, 80%, 45%)',
  'hsl(45, 90%, 50%)',
  'hsl(330, 70%, 55%)',
];

export default function RecruiterDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tests, setTests] = useState<Test[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [submissionFilter, setSubmissionFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    reward_amount: '',
    estimated_duration: '',
    category: '',
    max_testers: '',
  });
  
  const [reviewRating, setReviewRating] = useState<{ [key: string]: number }>({});
  const [bulkSummarizing, setBulkSummarizing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });

  const summarizeAllTranscripts = async () => {
    const pending = submissions.filter(s => s.transcript && !s.transcript_summary);
    if (pending.length === 0) {
      toast({ title: 'Nothing to summarize', description: 'All transcripts already have summaries.' });
      return;
    }
    setBulkSummarizing(true);
    setBulkProgress({ done: 0, total: pending.length });
    let successCount = 0;
    let failCount = 0;
    for (const sub of pending) {
      try {
        const { data, error } = await supabase.functions.invoke('summarize-transcript', {
          body: { submission_id: sub.id },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        successCount++;
      } catch {
        failCount++;
      }
      setBulkProgress(prev => ({ ...prev, done: prev.done + 1 }));
    }
    setBulkSummarizing(false);
    toast({
      title: 'Bulk summarization complete',
      description: `${successCount} succeeded, ${failCount} failed out of ${pending.length}.`,
    });
    fetchData();
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && role !== 'recruiter') {
      navigate('/');
      toast({
        title: 'Access denied',
        description: 'This dashboard is only for recruiters.',
        variant: 'destructive',
      });
    }
  }, [user, role, authLoading, navigate, toast]);

  useEffect(() => {
    if (user && role === 'recruiter') {
      fetchData();
    }
  }, [user, role]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: testsData, error: testsError } = await supabase
        .from('tests')
        .select('*')
        .eq('recruiter_id', user.id)
        .order('created_at', { ascending: false });

      if (testsError) throw testsError;
      setTests(testsData || []);

      const { data: submissionsData, error: submissionsError } = await supabase
        .from('test_submissions')
        .select(`
          *,
          tests (title, reward_amount)
        `)
        .order('created_at', { ascending: false });

      if (submissionsError) throw submissionsError;
      
      const testIds = (testsData || []).map(t => t.id);
      const filteredSubmissions = (submissionsData || []).filter(s => testIds.includes(s.test_id));
      setSubmissions(filteredSubmissions);
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

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      requirements: '',
      reward_amount: '',
      estimated_duration: '',
      category: '',
      max_testers: '',
    });
    setEditingTest(null);
  };

  const handleCreateTest = async () => {
    if (!formData.title || !formData.reward_amount || !formData.estimated_duration) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('tests')
        .insert({
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

      toast({
        title: 'Test created!',
        description: 'Your test has been published and is now available to testers.',
      });
      setCreateDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating test:', error);
      toast({
        title: 'Error',
        description: 'Failed to create test.',
        variant: 'destructive',
      });
    }
  };

  const handleEditTest = async () => {
    if (!editingTest || !formData.title) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tests')
        .update({
          title: formData.title,
          description: formData.description || null,
          requirements: formData.requirements || null,
          reward_amount: parseFloat(formData.reward_amount),
          estimated_duration: parseInt(formData.estimated_duration),
          category: formData.category || null,
          max_testers: formData.max_testers ? parseInt(formData.max_testers) : 100,
        })
        .eq('id', editingTest.id);

      if (error) throw error;

      toast({
        title: 'Test updated!',
        description: 'Your test has been updated successfully.',
      });
      setEditingTest(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error updating test:', error);
      toast({
        title: 'Error',
        description: 'Failed to update test.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTest = async (testId: string) => {
    try {
      const { error } = await supabase
        .from('tests')
        .delete()
        .eq('id', testId);

      if (error) throw error;

      toast({
        title: 'Test deleted',
        description: 'The test has been removed.',
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting test:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete test.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (test: Test) => {
    const newStatus = test.status === 'active' ? 'paused' : 'active';
    try {
      const { error } = await supabase
        .from('tests')
        .update({ status: newStatus })
        .eq('id', test.id);

      if (error) throw error;

      toast({
        title: `Test ${newStatus === 'active' ? 'activated' : 'paused'}`,
        description: `The test is now ${newStatus}.`,
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling test status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update test status.',
        variant: 'destructive',
      });
    }
  };

  const handleReviewSubmission = async (submissionId: string, newStatus: 'approved' | 'rejected', submission: Submission) => {
    const rating = reviewRating[submissionId] || 0;
    
    if (newStatus === 'approved' && rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please provide a rating before approving.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('test_submissions')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          rating: newStatus === 'approved' ? rating : null,
        })
        .eq('id', submissionId);

      if (error) throw error;

      try {
        const { error: fnError } = await supabase.functions.invoke('send-review-notification', {
          body: {
            submissionId,
            testerId: submission.tester_id,
            testTitle: submission.tests?.title || 'Test',
            status: newStatus,
            reviewerFeedback: submission.feedback,
            rewardAmount: newStatus === 'approved' ? Number(submission.tests?.reward_amount || 0) : undefined,
          },
        });
        
        if (fnError) {
          console.error('Error sending notification:', fnError);
        }
      } catch (notificationError) {
        console.error('Failed to send email notification:', notificationError);
      }

      toast({
        title: `Submission ${newStatus}`,
        description: `The submission has been ${newStatus}. Tester has been notified via email.`,
      });
      fetchData();
    } catch (error) {
      console.error('Error reviewing submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to review submission.',
        variant: 'destructive',
      });
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

  // Computed stats
  const activeTests = tests.filter(t => t.status === 'active').length;
  const totalTesters = submissions.length;
  const pendingReviews = submissions.filter(s => s.status === 'submitted').length;
  const totalSpent = submissions.filter(s => s.status === 'approved').reduce(
    (sum, s) => sum + Number(s.tests?.reward_amount || 0), 
    0
  );
  const approvedCount = submissions.filter(s => s.status === 'approved').length;
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length;
  const reviewedCount = approvedCount + rejectedCount;
  const approvalRate = reviewedCount > 0 ? Math.round((approvedCount / reviewedCount) * 100) : 0;
  const avgRating = useMemo(() => {
    const rated = submissions.filter(s => s.rating && s.rating > 0);
    if (rated.length === 0) return 0;
    return rated.reduce((sum, s) => sum + (s.rating || 0), 0) / rated.length;
  }, [submissions]);
  const completionRate = useMemo(() => {
    if (submissions.length === 0) return 0;
    const completed = submissions.filter(s => s.status !== 'in_progress').length;
    return Math.round((completed / submissions.length) * 100);
  }, [submissions]);
  const uniqueTesters = useMemo(() => {
    return new Set(submissions.map(s => s.tester_id)).size;
  }, [submissions]);

  // Chart data
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    tests.forEach(t => {
      const cat = t.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tests]);

  const submissionStatusData = useMemo(() => {
    const counts: Record<string, number> = { 'In Progress': 0, 'Submitted': 0, 'Approved': 0, 'Rejected': 0 };
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
    return [...submissions]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [submissions]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    if (submissionFilter === 'all') return submissions;
    return submissions.filter(s => s.status === submissionFilter);
  }, [submissions, submissionFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Active</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">In Progress</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Pending Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
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
  };

  const exportSubmissions = () => {
    const headers = ['Test', 'Tester ID', 'Status', 'Rating', 'Feedback', 'Submitted At', 'Created At', 'Reward'];
    const rows = filteredSubmissions.map(s => [
      s.tests?.title || '',
      s.tester_id,
      s.status,
      s.rating?.toString() || '',
      s.feedback || '',
      s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : '',
      new Date(s.created_at).toLocaleDateString(),
      s.tests?.reward_amount?.toString() || '',
    ]);
    downloadCSV(`submissions_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    toast({ title: 'Export complete', description: `${rows.length} submissions exported.` });
  };

  const exportAnalytics = () => {
    const headers = ['Metric', 'Value'];
    const rows: string[][] = [
      ['Total Tests', tests.length.toString()],
      ['Total Submissions', submissions.length.toString()],
      ['Approval Rate', `${approvalRate}%`],
      ['Average Rating', avgRating.toFixed(1)],
      ['Completion Rate', `${completionRate}%`],
      ['Total Spend', `$${totalSpent.toFixed(2)}`],
      ['Unique Testers', uniqueTesters.toString()],
      ['', ''],
      ['--- Submissions by Status ---', ''],
      ...submissionStatusData.map(d => [d.name, d.value.toString()]),
      ['', ''],
      ['--- Tests by Category ---', ''],
      ...categoryData.map(d => [d.name, d.value.toString()]),
      ['', ''],
      ['--- Spending by Test ---', ''],
      ...spendingByTest.map(d => [d.name, `$${d.amount.toFixed(2)}`]),
    ];
    downloadCSV(`analytics_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    toast({ title: 'Export complete', description: 'Analytics data exported.' });
  };

  if (authLoading || loading) {
    return (
      <>
        <Background3D />
        <Navbar />
        <main className="min-h-screen pt-20 px-4">
          <div className="container mx-auto max-w-6xl py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-28 bg-muted rounded-2xl w-full" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-28 bg-muted rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Recruiter Dashboard — User Ninjas</title>
        <meta name="description" content="Manage your tests, review submissions, and track tester engagement." />
      </Helmet>

      <Background3D />
      <Navbar />

      <main className="min-h-screen pt-20 px-4 pb-16">
        <div className="container mx-auto max-w-6xl py-8 space-y-6">

          {/* Dashboard Header */}
          <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 md:p-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-primary uppercase tracking-widest">Recruiter Dashboard</span>
                  {pendingReviews > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-yellow-500/15 text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded-full">
                      <Bell className="w-3 h-3" /> {pendingReviews} pending
                    </span>
                  )}
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">
                  Welcome back, <span className="text-gradient">{user.email?.split('@')[0] || 'Recruiter'}</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeTests} active test{activeTests !== 1 ? 's' : ''} · {totalTesters} submission{totalTesters !== 1 ? 's' : ''} · ${totalSpent.toFixed(0)} spent
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/contact">
                  <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                    <Settings className="h-4 w-4" /> Settings
                  </Button>
                </Link>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20 font-semibold">
                      <Plus className="h-4 w-4" /> New Test
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Test</DialogTitle>
                      <DialogDescription>Fill in the details to create a new test for testers.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Test Title *</Label>
                        <Input id="title" placeholder="e.g., Mobile App Usability Test" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Describe what the test is about..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="requirements">Requirements</Label>
                        <Textarea id="requirements" placeholder="Any specific requirements for testers..." value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} rows={2} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="reward">Reward ($) *</Label>
                          <Input id="reward" type="number" min="0" step="0.01" placeholder="25.00" value={formData.reward_amount} onChange={(e) => setFormData({ ...formData, reward_amount: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="duration">Duration (mins) *</Label>
                          <Input id="duration" type="number" min="1" placeholder="30" value={formData.estimated_duration} onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                            <SelectContent>{categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max_testers">Max Testers</Label>
                          <Input id="max_testers" type="number" min="1" placeholder="100" value={formData.max_testers} onChange={(e) => setFormData({ ...formData, max_testers: e.target.value })} />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => { setCreateDialogOpen(false); resetForm(); }}>Cancel</Button>
                      <Button onClick={handleCreateTest}>Create Test</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Active Tests',
                value: activeTests,
                sub: `${tests.length} total`,
                icon: Layers,
                color: 'text-primary',
                bg: 'bg-primary/10',
                border: 'border-primary/20',
              },
              {
                label: 'Unique Testers',
                value: uniqueTesters,
                sub: `${totalTesters} submissions`,
                icon: Users,
                color: 'text-blue-500',
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/20',
              },
              {
                label: 'Pending Reviews',
                value: pendingReviews,
                sub: pendingReviews > 0 ? '⚠ Needs attention' : 'All up to date',
                icon: AlertCircle,
                color: pendingReviews > 0 ? 'text-yellow-500' : 'text-muted-foreground',
                bg: pendingReviews > 0 ? 'bg-yellow-500/10' : 'bg-secondary',
                border: pendingReviews > 0 ? 'border-yellow-500/20' : 'border-border/50',
              },
              {
                label: 'Total Spent',
                value: `$${totalSpent.toFixed(0)}`,
                sub: `${approvedCount} approved`,
                icon: DollarSign,
                color: 'text-green-500',
                bg: 'bg-green-500/10',
                border: 'border-green-500/20',
              },
            ].map((stat) => (
              <Card key={stat.label} className={`border ${stat.border} bg-card shadow-sm hover:shadow-md transition-shadow`}>
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                    <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold font-display">{stat.value}</p>
                  <p className={`text-xs mt-1 ${stat.label === 'Pending Reviews' && pendingReviews > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`}>{stat.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-border/50 bg-card shadow-sm">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-medium text-muted-foreground">Approval Rate</p>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Target className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold font-display">{approvalRate}%</p>
                <Progress value={approvalRate} className="h-1 mt-2" />
              </CardContent>
            </Card>
            <Card className="border border-border/50 bg-card shadow-sm">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-medium text-muted-foreground">Avg Rating</p>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Award className="h-4 w-4 text-amber-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold font-display">{avgRating.toFixed(1)}</p>
                <StarRating rating={Math.round(avgRating)} size="sm" />
              </CardContent>
            </Card>
            <Card className="border border-border/50 bg-card shadow-sm">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-medium text-muted-foreground">Completion Rate</p>
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-violet-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold font-display">{completionRate}%</p>
                <Progress value={completionRate} className="h-1 mt-2" />
              </CardContent>
            </Card>
            <Card className="border border-border/50 bg-card shadow-sm">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-medium text-muted-foreground">Rejected</p>
                  <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <XCircle className="h-4 w-4 text-destructive" />
                  </div>
                </div>
                <p className="text-2xl font-bold font-display">{rejectedCount}</p>
                <p className="text-xs text-muted-foreground mt-1">{reviewedCount} reviewed total</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="tests" className="space-y-5">
              <TabsList className="h-10 bg-secondary/60 border border-border/50 p-1 rounded-xl gap-1">
                <TabsTrigger value="tests" className="rounded-lg text-sm gap-1.5 data-[state=active]:shadow-sm">
                  <FileText className="h-3.5 w-3.5" /> My Tests
                </TabsTrigger>
                <TabsTrigger value="submissions" className="rounded-lg text-sm gap-1.5 data-[state=active]:shadow-sm">
                  <Users className="h-3.5 w-3.5" /> Submissions
                  {pendingReviews > 0 && (
                    <span className="ml-1 bg-yellow-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{pendingReviews}</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="insights" className="rounded-lg text-sm gap-1.5 data-[state=active]:shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" /> AI Insights
                </TabsTrigger>
                <TabsTrigger value="analytics" className="rounded-lg text-sm gap-1.5 data-[state=active]:shadow-sm">
                  <BarChart3 className="h-3.5 w-3.5" /> Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tests" className="space-y-4">
                {tests.length === 0 ? (
                  <Card className="bg-card border border-border/60 shadow-sm">
                    <CardContent className="pt-6 text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">You haven't created any tests yet.</p>
                      <p className="text-sm text-muted-foreground mt-2">Create your first test to start receiving submissions!</p>
                      <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Test
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-3">
                    {tests.map((test) => {
                      const testSubmissions = submissions.filter(s => s.test_id === test.id);
                      const testApproved = testSubmissions.filter(s => s.status === 'approved').length;
                      const testPending = testSubmissions.filter(s => s.status === 'submitted').length;
                      const fillRate = test.max_testers ? Math.round((testSubmissions.length / test.max_testers) * 100) : 0;
                      return (
                        <Card key={test.id} className={`bg-card border border-border/60 shadow-sm border-l-4 overflow-hidden ${test.status === 'active' ? 'border-l-primary' : test.status === 'paused' ? 'border-l-yellow-500' : 'border-l-muted-foreground/30'}`}>
                          <CardContent className="p-5">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="font-semibold text-base truncate">{test.title}</h3>
                                  {getStatusBadge(test.status)}
                                  {test.category && <Badge variant="secondary" className="text-xs">{test.category}</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{test.description}</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                                  <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-green-500" /><span className="font-semibold text-foreground">${Number(test.reward_amount).toFixed(2)}</span></span>
                                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{test.estimated_duration} mins</span>
                                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{testSubmissions.length}/{test.max_testers} testers</span>
                                  <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-3.5 w-3.5" />{testApproved} approved</span>
                                  {testPending > 0 && <span className="flex items-center gap-1 text-yellow-500 font-medium"><AlertCircle className="h-3.5 w-3.5" />{testPending} pending</span>}
                                </div>
                                <div>
                                  <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Fill rate</span><span className="font-medium">{fillRate}%</span></div>
                                  <Progress value={fillRate} className="h-1.5" />
                                </div>
                              </div>
                              <div className="flex sm:flex-col gap-2 flex-shrink-0">
                                <Button variant="outline" size="sm" className="text-xs" onClick={() => handleToggleStatus(test)}>
                                  {test.status === 'active' ? <><XCircle className="h-3.5 w-3.5 mr-1" />Pause</> : <><CheckCircle className="h-3.5 w-3.5 mr-1" />Activate</>}
                                </Button>
                                <Dialog open={editingTest?.id === test.id} onOpenChange={(open) => !open && setEditingTest(null)}>
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
                                        <Input id="edit-title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-description">Description</Label>
                                        <Textarea id="edit-description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-requirements">Requirements</Label>
                                        <Textarea id="edit-requirements" value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} rows={2} />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-reward">Reward ($) *</Label>
                                          <Input id="edit-reward" type="number" min="0" step="0.01" value={formData.reward_amount} onChange={(e) => setFormData({ ...formData, reward_amount: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-duration">Duration (mins) *</Label>
                                          <Input id="edit-duration" type="number" min="1" value={formData.estimated_duration} onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })} />
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-category">Category</Label>
                                          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                            <SelectContent>{categories.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-max_testers">Max Testers</Label>
                                          <Input id="edit-max_testers" type="number" min="1" value={formData.max_testers} onChange={(e) => setFormData({ ...formData, max_testers: e.target.value })} />
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
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="submissions" className="space-y-4">
                {/* Filter bar */}
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filter:</span>
                  {['all', 'in_progress', 'submitted', 'approved', 'rejected'].map(filter => (
                    <Button
                      key={filter}
                      variant={submissionFilter === filter ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSubmissionFilter(filter)}
                      className="capitalize"
                    >
                      {filter === 'all' ? 'All' : filter.replace('_', ' ')}
                      {filter !== 'all' && (
                        <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-xs">
                          {submissions.filter(s => s.status === filter).length}
                        </Badge>
                      )}
                    </Button>
                  ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={summarizeAllTranscripts}
                      disabled={bulkSummarizing || submissions.filter(s => s.transcript && !s.transcript_summary).length === 0}
                    >
                      <Sparkles className="h-4 w-4 mr-1.5" />
                      {bulkSummarizing
                        ? `Summarizing ${bulkProgress.done}/${bulkProgress.total}…`
                        : `Summarize All (${submissions.filter(s => s.transcript && !s.transcript_summary).length})`}
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportSubmissions} disabled={filteredSubmissions.length === 0}>
                      <Download className="h-4 w-4 mr-1.5" />
                      Export CSV
                    </Button>
                  </div>
                </div>

                {filteredSubmissions.length === 0 ? (
                  <Card className="bg-card border border-border/60 shadow-sm">
                    <CardContent className="pt-6 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {submissionFilter === 'all' 
                          ? 'No submissions yet.' 
                          : `No ${submissionFilter.replace('_', ' ')} submissions.`}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">Submissions will appear here when testers start your tests.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredSubmissions.map((submission) => (
                      <Card key={submission.id} className={`bg-card border border-border/60 shadow-sm border-l-4 overflow-hidden ${submission.status === 'submitted' ? 'border-l-yellow-500' : submission.status === 'approved' ? 'border-l-green-500' : submission.status === 'rejected' ? 'border-l-destructive' : 'border-l-muted-foreground/30'}`}>
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-semibold text-sm truncate">{submission.tests?.title || 'Test'}</h3>
                                {getStatusBadge(submission.status)}
                                <span className="text-sm font-semibold text-green-600">${Number(submission.tests?.reward_amount || 0).toFixed(2)}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Tester: {submission.tester_id.slice(0, 8)}...&nbsp;·&nbsp;
                                Started: {new Date(submission.created_at).toLocaleDateString()}
                                {submission.submitted_at && <>&nbsp;·&nbsp;Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</>}
                              </p>
                            </div>
                            {submission.status === 'submitted' && (
                              <div className="flex flex-col gap-2 flex-shrink-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Rate:</span>
                                  <StarRating rating={reviewRating[submission.id] || 0} interactive onRatingChange={(rating) => setReviewRating(prev => ({ ...prev, [submission.id]: rating }))} />
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
                          {submission.feedback && (
                            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm">
                                <strong>Feedback:</strong> {submission.feedback}
                              </p>
                            </div>
                          )}
                          {submission.attachments && submission.attachments.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold mb-2">Attachments:</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {submission.attachments.map((url, index) => {
                                  const isVideo = url.match(/\.(mp4|webm|mov)$/i);
                                  return (
                                    <a
                                      key={index}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block aspect-video bg-muted rounded-lg overflow-hidden hover:ring-2 ring-primary transition-all"
                                    >
                                      {isVideo ? (
                                        <video
                                          src={url}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <img
                                          src={url}
                                          alt={`Attachment ${index + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                      )}
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {/* Screen Recording */}
                          {submission.recording_url && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                                <PlayIcon className="h-4 w-4" /> Screen Recording
                              </p>
                              <video
                                src={submission.recording_url}
                                controls
                                className="w-full rounded-lg border border-border max-h-64"
                              />
                            </div>
                          )}
                          {/* Transcript */}
                          {submission.transcript && (
                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold flex items-center gap-1">
                                  <FileTextIcon className="h-4 w-4" /> Voice Transcript
                                </p>
                                {!submission.transcript_summary && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                      try {
                                        const { data, error } = await supabase.functions.invoke('summarize-transcript', {
                                          body: { submission_id: submission.id },
                                        });
                                        if (error) throw error;
                                        if (data?.error) throw new Error(data.error);
                                        toast({ title: 'Transcript summarized!', description: 'AI summary generated successfully.' });
                                        fetchData();
                                      } catch (err: any) {
                                        toast({ title: 'Error', description: err.message || 'Failed to summarize', variant: 'destructive' });
                                      }
                                    }}
                                    className="flex items-center gap-1"
                                  >
                                    <Sparkles className="h-3 w-3" /> AI Summarize
                                  </Button>
                                )}
                              </div>
                              <div className="p-3 bg-muted/50 rounded-lg max-h-32 overflow-y-auto">
                                <p className="text-xs text-foreground whitespace-pre-wrap">{submission.transcript}</p>
                              </div>
                            </div>
                          )}
                          {/* AI Transcript Summary */}
                          {submission.transcript_summary && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                                <Sparkles className="h-4 w-4 text-primary" /> AI Transcript Summary
                              </p>
                              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                <p className="text-sm text-foreground whitespace-pre-wrap">
                                  {submission.transcript_summary.replace(/\*\*(.*?)\*\*/g, '$1')}
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* AI Insights Tab */}
              <TabsContent value="insights" className="space-y-6">
                <AIInsightsPanel tests={tests} userId={user.id} />
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                {tests.length === 0 && submissions.length === 0 ? (
                  <Card className="bg-card border border-border/60 shadow-sm">
                    <CardContent className="pt-6 text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No data to analyze yet.</p>
                      <p className="text-sm text-muted-foreground mt-2">Create tests and receive submissions to see analytics.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={exportAnalytics}>
                        <Download className="h-4 w-4 mr-1.5" />
                        Export Analytics CSV
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Submission Status Breakdown */}
                      <Card className="bg-card border border-border/60 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-primary" />
                            Submission Status
                          </CardTitle>
                          <CardDescription>Breakdown of all submissions by status</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <RechartsPie>
                              <Pie
                                data={submissionStatusData.filter(d => d.value > 0)}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={4}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                              >
                                {submissionStatusData.filter(d => d.value > 0).map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RechartsPie>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Tests by Category */}
                      <Card className="bg-card border border-border/60 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-accent" />
                            Tests by Category
                          </CardTitle>
                          <CardDescription>Distribution of your tests across categories</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={categoryData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px',
                                }}
                              />
                              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Spending by Test */}
                    {spendingByTest.length > 0 && (
                      <Card className="bg-card border border-border/60 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            Spending by Test
                          </CardTitle>
                          <CardDescription>Reward payouts for approved submissions per test</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={spendingByTest} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                              <YAxis dataKey="name" type="category" width={150} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                              <Tooltip
                                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px',
                                }}
                              />
                              <Bar dataKey="amount" fill="hsl(142, 71%, 45%)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Recent Activity Table */}
                    <Card className="bg-card border border-border/60 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Activity className="h-5 w-5 text-primary" />
                          Recent Activity
                        </CardTitle>
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
                                  <TableCell className="text-muted-foreground">{sub.tester_id.slice(0, 8)}...</TableCell>
                                  <TableCell>{getStatusBadge(sub.status)}</TableCell>
                                  <TableCell>
                                    {sub.rating ? <StarRating rating={sub.rating} size="sm" /> : <span className="text-muted-foreground">—</span>}
                                  </TableCell>
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
              </TabsContent>
            </Tabs>
        </div>
      </main>
    </>
  );
}

