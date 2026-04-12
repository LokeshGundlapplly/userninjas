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
  age: number | null;
  gender: string | null;
  location: string | null;
  bio: string | null;
  devices: string[] | null;
  interests: string[] | null;
}

export default function TesterProfile() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
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
          .select('full_name, email, avatar_url, created_at, age, gender, location, bio, devices, interests')
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

      toast({ title: 'Profile updated', description: 'Your demographics have been saved. Match scores will improve!' });
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
      devices: prev.devices.includes(device)
        ? prev.devices.filter(d => d !== device)
        : [...prev.devices, device],
    }));
  };

  const addInterest = () => {
    const interest = editForm.newInterest.trim();
    if (interest && !editForm.interests.includes(interest)) {
      setEditForm(prev => ({
        ...prev,
        interests: [...prev.interests, interest],
        newInterest: '',
      }));
    }
  };

  const removeInterest = (interest: string) => {
    setEditForm(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest),
    }));
  };
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
          {/* Back Navigation */}
          <ScrollReveal animation="fade-up">
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/tester" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>
              </Button>
            </div>
          </ScrollReveal>

          {/* Hero Profile Card */}
          <ScrollReveal animation="fade-up" delay={0.05}>
            <Card className="bg-card border border-border/60 shadow-sm mb-6">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white">
                        {(profile?.full_name || user?.email || 'T').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {completedTests >= 50 ? 'Expert' : completedTests >= 20 ? 'Pro' : completedTests >= 5 ? 'Rising' : 'New'}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-2xl font-display font-bold">{profile?.full_name || 'Tester'}</h1>
                      {ratedSubmissions.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{averageRating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({ratedSubmissions.length} reviews)</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {user?.email} · Member since {profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : 'N/A'}
                      {profile?.location && <> · <MapPin className="h-3 w-3 inline mx-0.5" />{profile.location}</>}
                    </p>
                    {profile?.bio && <p className="text-sm text-muted-foreground italic mb-3 max-w-xl">"{profile.bio}"</p>}

                    {/* Profile completeness */}
                    {(() => {
                      const fields = [profile?.full_name, profile?.age, profile?.gender, profile?.location, profile?.bio, profile?.devices?.length, profile?.interests?.length];
                      const filled = fields.filter(Boolean).length;
                      const pct = Math.round((filled / fields.length) * 100);
                      return (
                        <div className="flex items-center gap-3 max-w-xs">
                          <Progress value={pct} className="flex-1 h-1.5" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{pct}% complete</span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Actions */}
                  <div className="shrink-0">
                    {!editing ? (
                      <Button variant="outline" size="sm" onClick={startEditing}>
                        <Edit className="h-4 w-4 mr-1.5" /> Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                          <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                        <Button size="sm" onClick={saveProfile} disabled={saving}>
                          <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Recruiter Preview Banner */}
          {!editing && (
            <ScrollReveal animation="fade-up" delay={0.08}>
              <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20 shadow-sm mb-6">
                <CardContent className="py-4 px-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0"><User className="h-4 w-4 text-primary" /></div>
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-0.5">Recruiter view of your profile</p>
                      <p className="text-xs text-muted-foreground">This is what recruiters see when matching you to studies. Complete your demographics to appear in more test opportunities.</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile?.devices?.map(d => <Badge key={d} variant="outline" className="text-xs">{d}</Badge>)}
                        {profile?.interests?.slice(0, 4).map(i => <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>)}
                        {profile?.gender && <Badge variant="outline" className="text-xs capitalize">{profile.gender}</Badge>}
                        {profile?.age && <Badge variant="outline" className="text-xs">Age {profile.age}</Badge>}
                        {(!profile?.devices?.length && !profile?.interests?.length && !profile?.gender && !profile?.age) && (
                          <button onClick={startEditing} className="text-xs text-primary hover:underline">Add demographic info →</button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          )}

          {/* Demographics Edit Section */}
          {editing && (
            <ScrollReveal animation="fade-up" delay={0.05}>
              <Card className="bg-card border border-border/60 shadow-sm mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Edit Demographics
                  </CardTitle>
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
                        <Badge key={interest} variant="secondary" className="cursor-pointer" onClick={() => removeInterest(interest)}>
                          {interest} <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          )}

          {/* Demographics Display (when not editing) */}
          {!editing && profile && (profile.age || profile.gender || profile.location || (profile.devices && profile.devices.length > 0) || (profile.interests && profile.interests.length > 0)) && (
            <ScrollReveal animation="fade-up" delay={0.05}>
              <Card className="bg-card border border-border/60 shadow-sm mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Demographics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {profile.age && (
                      <div><p className="text-xs text-muted-foreground">Age</p><p className="font-medium">{profile.age}</p></div>
                    )}
                    {profile.gender && (
                      <div><p className="text-xs text-muted-foreground">Gender</p><p className="font-medium capitalize">{profile.gender}</p></div>
                    )}
                    {profile.location && (
                      <div className="flex items-start gap-1"><MapPin className="h-3 w-3 mt-1 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Location</p><p className="font-medium">{profile.location}</p></div></div>
                    )}
                    {profile.devices && profile.devices.length > 0 && (
                      <div><p className="text-xs text-muted-foreground">Devices</p><div className="flex flex-wrap gap-1 mt-1">{profile.devices.map(d => <Badge key={d} variant="outline" className="text-xs">{d}</Badge>)}</div></div>
                    )}
                  </div>
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="mt-4"><p className="text-xs text-muted-foreground mb-2">Interests</p><div className="flex flex-wrap gap-1">{profile.interests.map(i => <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>)}</div></div>
                  )}
                  {profile.bio && (
                    <div className="mt-4"><p className="text-xs text-muted-foreground mb-1">Bio</p><p className="text-sm">{profile.bio}</p></div>
                  )}
                </CardContent>
              </Card>
            </ScrollReveal>
          )}

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
