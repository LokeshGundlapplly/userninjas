import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Send
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

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
}

interface Submission {
  id: string;
  test_id: string;
  status: string;
  feedback: string | null;
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
  
  // Submission flow state
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      // Fetch available tests
      const { data: testsData, error: testsError } = await supabase
        .from('tests')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (testsError) throw testsError;
      setTests(testsData || []);

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
    setSubmitDialogOpen(true);
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
      const { error } = await supabase
        .from('test_submissions')
        .update({
          status: 'submitted',
          feedback: feedbackText.trim(),
          submitted_at: new Date().toISOString(),
        })
        .eq('id', selectedSubmission.id);

      if (error) throw error;

      toast({
        title: 'Test submitted!',
        description: 'Your test has been submitted for review.',
      });
      
      setSubmitDialogOpen(false);
      setSelectedSubmission(null);
      setFeedbackText('');
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
    }
  };

  const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
  const pendingEarnings = earnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + Number(e.amount), 0);
  const paidEarnings = earnings.filter(e => e.status === 'paid').reduce((sum, e) => sum + Number(e.amount), 0);
  const completedTests = submissions.filter(s => s.status === 'approved').length;
  const inProgressTests = submissions.filter(s => s.status === 'in_progress').length;

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
          <div className="container mx-auto max-w-6xl py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-muted rounded-lg" />
                ))}
              </div>
            </div>
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
          <ScrollReveal animation="fade-up">
            <h1 className="text-3xl font-display font-bold mb-8">
              Welcome back, <span className="text-gradient">Tester</span>
            </h1>
          </ScrollReveal>

          {/* Stats Overview */}
          <ScrollReveal animation="fade-up" delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                      <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-full">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">${pendingEarnings.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 rounded-full">
                      <Clock className="h-6 w-6 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed Tests</p>
                      <p className="text-2xl font-bold">{completedTests}</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                      <p className="text-2xl font-bold">{inProgressTests}</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-full">
                      <PlayCircle className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollReveal>

          {/* Main Content Tabs */}
          <ScrollReveal animation="fade-up" delay={0.2}>
            <Tabs defaultValue="available" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="available" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Available
                </TabsTrigger>
                <TabsTrigger value="submissions" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  My Tests
                </TabsTrigger>
                <TabsTrigger value="earnings" className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Earnings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="available" className="space-y-4">
                {tests.length === 0 ? (
                  <Card className="glass-card">
                    <CardContent className="pt-6 text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No tests available at the moment.</p>
                      <p className="text-sm text-muted-foreground mt-2">Check back later for new opportunities!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {tests.map((test) => {
                      const alreadyStarted = submissions.some(s => s.test_id === test.id);
                      return (
                        <Card key={test.id} className="glass-card hover-lift">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-xl">{test.title}</CardTitle>
                                <CardDescription className="mt-2">{test.description}</CardDescription>
                              </div>
                              <Badge variant="secondary">{test.category}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                <span className="font-semibold text-foreground">${Number(test.reward_amount).toFixed(2)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{test.estimated_duration} mins</span>
                              </div>
                            </div>
                            {test.requirements && (
                              <p className="text-sm text-muted-foreground mb-4">
                                <strong>Requirements:</strong> {test.requirements}
                              </p>
                            )}
                            <Button 
                              onClick={() => startTest(test.id)} 
                              disabled={alreadyStarted}
                              className="w-full sm:w-auto"
                            >
                              {alreadyStarted ? 'Already Started' : 'Start Test'}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="submissions" className="space-y-4">
                {submissions.length === 0 ? (
                  <Card className="glass-card">
                    <CardContent className="pt-6 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">You haven't started any tests yet.</p>
                      <p className="text-sm text-muted-foreground mt-2">Browse available tests to get started!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <Card key={submission.id} className="glass-card">
                        <CardContent className="pt-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold">{submission.tests?.title || 'Test'}</h3>
                              <p className="text-sm text-muted-foreground">
                                Started {new Date(submission.created_at).toLocaleDateString()}
                                {submission.submitted_at && (
                                  <> • Submitted {new Date(submission.submitted_at).toLocaleDateString()}</>
                                )}
                              </p>
                              {submission.feedback && submission.status !== 'in_progress' && (
                                <p className="text-sm text-muted-foreground mt-2 italic">
                                  "{submission.feedback.substring(0, 100)}{submission.feedback.length > 100 ? '...' : ''}"
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold whitespace-nowrap">
                                ${Number(submission.tests?.reward_amount || 0).toFixed(2)}
                              </span>
                              {getStatusBadge(submission.status)}
                              {submission.status === 'in_progress' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => openSubmitDialog(submission)}
                                  className="flex items-center gap-2"
                                >
                                  <Send className="h-4 w-4" />
                                  Submit
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="earnings" className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <Card className="glass-card">
                    <CardContent className="pt-6 text-center">
                      <p className="text-sm text-muted-foreground">Total Earned</p>
                      <p className="text-2xl font-bold text-primary">${totalEarnings.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card">
                    <CardContent className="pt-6 text-center">
                      <p className="text-sm text-muted-foreground">Pending Payout</p>
                      <p className="text-2xl font-bold text-yellow-500">${pendingEarnings.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card">
                    <CardContent className="pt-6 text-center">
                      <p className="text-sm text-muted-foreground">Paid Out</p>
                      <p className="text-2xl font-bold text-green-500">${paidEarnings.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                </div>

                {earnings.length === 0 ? (
                  <Card className="glass-card">
                    <CardContent className="pt-6 text-center">
                      <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No earnings yet.</p>
                      <p className="text-sm text-muted-foreground mt-2">Complete tests to start earning!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="glass-card">
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
          </ScrollReveal>
        </div>
      </main>

      {/* Submit Test Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit Test</DialogTitle>
            <DialogDescription>
              Submit your completed test for "{selectedSubmission?.tests?.title}". Please provide detailed feedback about your testing experience.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Your Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Describe your testing experience, any bugs found, usability issues, suggestions for improvement, etc."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Provide detailed, constructive feedback to help improve the product.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setSubmitDialogOpen(false)}
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
                <>Submitting...</>
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
