import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Background3D from '@/components/Background3D';
import StarRating from '@/components/StarRating';
import ScrollReveal from '@/components/ScrollReveal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  ArrowLeft,
  Trophy,
  Target,
  Clock,
  Award,
  Edit,
  Save,
  X,
  MapPin,
  Smartphone,
  Heart,
  User,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

interface Submission {
  id: string;
  test_id: string;
  status: string;
  feedback: string | null;
  rating: number | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  tests: {
    title: string;
    reward_amount: number;
    category: string | null;
  };
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
}

export default function TesterProfile() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && role !== 'tester') {
      navigate('/');
      toast({
        title: 'Access denied',
        description: 'This page is only for testers.',
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
      const [submissionsRes, earningsRes, profileRes] = await Promise.all([
        supabase
          .from('test_submissions')
          .select(`*, tests (title, reward_amount, category)`)
          .eq('tester_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('earnings')
          .select('*')
          .eq('tester_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('full_name, email, avatar_url, created_at')
          .eq('user_id', user!.id)
          .single(),
      ]);

      if (submissionsRes.error) throw submissionsRes.error;
      if (earningsRes.error) throw earningsRes.error;
      
      setSubmissions(submissionsRes.data || []);
      setEarnings(earningsRes.data || []);
      setProfile(profileRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
  const completedTests = submissions.filter(s => s.status === 'approved').length;
  const submittedTests = submissions.filter(s => s.status === 'submitted').length;
  const rejectedTests = submissions.filter(s => s.status === 'rejected').length;
  const inProgressTests = submissions.filter(s => s.status === 'in_progress').length;

  const ratedSubmissions = submissions.filter(s => s.rating !== null && s.rating > 0);
  const averageRating = ratedSubmissions.length > 0
    ? ratedSubmissions.reduce((sum, s) => sum + (s.rating || 0), 0) / ratedSubmissions.length
    : 0;

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: ratedSubmissions.filter(s => s.rating === rating).length,
    percentage: ratedSubmissions.length > 0
      ? (ratedSubmissions.filter(s => s.rating === rating).length / ratedSubmissions.length) * 100
      : 0,
  }));

  // Completion rate
  const completionRate = submissions.length > 0
    ? ((completedTests / (completedTests + rejectedTests)) * 100) || 0
    : 0;

  // Category breakdown
  const categoryStats = submissions.reduce((acc, s) => {
    const category = s.tests?.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = { total: 0, approved: 0 };
    }
    acc[category].total++;
    if (s.status === 'approved') {
      acc[category].approved++;
    }
    return acc;
  }, {} as Record<string, { total: number; approved: number }>);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/50">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/50">Under Review</Badge>;
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
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-40 bg-muted rounded-lg" />
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
        <title>My Profile - User Ninjas</title>
        <meta name="description" content="View your tester profile, stats, ratings history, and completed tests." />
      </Helmet>

      <Background3D />
      <Navbar />

      <main className="min-h-screen pt-20 px-4 pb-12">
        <div className="container mx-auto max-w-6xl py-8">
          {/* Header */}
          <ScrollReveal animation="fade-up">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/tester">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-display font-bold">
                  {profile?.full_name || 'Tester'}'s <span className="text-gradient">Profile</span>
                </h1>
                <p className="text-muted-foreground">
                  Member since {profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : 'N/A'}
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Key Stats */}
          <ScrollReveal animation="fade-up" delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-card border border-border/60 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-500/10 rounded-full">
                      <Star className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
                        <StarRating rating={Math.round(averageRating)} size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground">{ratedSubmissions.length} reviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border/60 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed Tests</p>
                      <span className="text-2xl font-bold">{completedTests}</span>
                      <p className="text-xs text-muted-foreground">{completionRate.toFixed(0)}% success rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border/60 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earned</p>
                      <span className="text-2xl font-bold">${totalEarnings.toFixed(2)}</span>
                      <p className="text-xs text-muted-foreground">Lifetime earnings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border/60 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-full">
                      <Trophy className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tester Level</p>
                      <span className="text-2xl font-bold">
                        {completedTests >= 50 ? 'Expert' : completedTests >= 20 ? 'Pro' : completedTests >= 5 ? 'Rising' : 'Beginner'}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {completedTests < 5 ? `${5 - completedTests} more to Rising` : 
                         completedTests < 20 ? `${20 - completedTests} more to Pro` :
                         completedTests < 50 ? `${50 - completedTests} more to Expert` : 'Max level!'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Rating Distribution */}
              <ScrollReveal animation="fade-up" delay={0.2}>
                <Card className="bg-card border border-border/60 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      Rating Distribution
                    </CardTitle>
                    <CardDescription>How recruiters have rated your work</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {ratedSubmissions.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No ratings yet. Complete tests to earn ratings!</p>
                    ) : (
                      <div className="space-y-3">
                        {ratingDistribution.map(({ rating, count, percentage }) => (
                          <div key={rating} className="flex items-center gap-3">
                            <div className="flex items-center gap-1 w-20">
                              <span className="text-sm font-medium">{rating}</span>
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            </div>
                            <Progress value={percentage} className="flex-1 h-2" />
                            <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </ScrollReveal>

              {/* Completed Tests History */}
              <ScrollReveal animation="fade-up" delay={0.3}>
                <Card className="bg-card border border-border/60 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Test History
                    </CardTitle>
                    <CardDescription>Your reviewed submissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {submissions.filter(s => s.status === 'approved' || s.status === 'rejected').length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No completed tests yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {submissions
                          .filter(s => s.status === 'approved' || s.status === 'rejected')
                          .slice(0, 10)
                          .map(submission => (
                            <div key={submission.id} className="flex items-start justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{submission.tests?.title}</h4>
                                  {getStatusBadge(submission.status)}
                                </div>
                                {submission.tests?.category && (
                                  <Badge variant="outline" className="text-xs">{submission.tests.category}</Badge>
                                )}
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {submission.reviewed_at 
                                      ? format(new Date(submission.reviewed_at), 'MMM d, yyyy')
                                      : format(new Date(submission.created_at), 'MMM d, yyyy')
                                    }
                                  </span>
                                  {submission.status === 'approved' && (
                                    <span className="text-green-500 font-medium">
                                      +${submission.tests?.reward_amount}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {submission.rating && (
                                <StarRating rating={submission.rating} size="sm" />
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Activity Summary */}
              <ScrollReveal animation="fade-up" delay={0.2}>
                <Card className="bg-card border border-border/60 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Activity Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Tests Started</span>
                      <span className="font-bold">{submissions.length}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">In Progress</span>
                      <Badge variant="outline" className="text-yellow-500">{inProgressTests}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Under Review</span>
                      <Badge variant="outline" className="text-blue-500">{submittedTests}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Approved</span>
                      <Badge variant="outline" className="text-green-500">{completedTests}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Rejected</span>
                      <Badge variant="destructive">{rejectedTests}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>

              {/* Category Expertise */}
              <ScrollReveal animation="fade-up" delay={0.3}>
                <Card className="bg-card border border-border/60 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Category Expertise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(categoryStats).length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No tests completed yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(categoryStats)
                          .sort((a, b) => b[1].total - a[1].total)
                          .slice(0, 5)
                          .map(([category, stats]) => (
                            <div key={category} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{category}</span>
                                <span className="text-muted-foreground">{stats.approved}/{stats.total} completed</span>
                              </div>
                              <Progress 
                                value={stats.total > 0 ? (stats.approved / stats.total) * 100 : 0} 
                                className="h-2" 
                              />
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </ScrollReveal>

              {/* Recent Earnings */}
              <ScrollReveal animation="fade-up" delay={0.4}>
                <Card className="bg-card border border-border/60 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      Recent Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {earnings.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No earnings yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {earnings.slice(0, 5).map(earning => (
                          <div key={earning.id} className="flex justify-between items-center p-2 rounded bg-muted/30">
                            <div>
                              <p className="text-sm font-medium">{earning.description || 'Test completion'}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(earning.created_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <span className="text-green-500 font-bold">+${Number(earning.amount).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
