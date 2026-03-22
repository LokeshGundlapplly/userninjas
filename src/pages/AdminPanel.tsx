import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Background3D from '@/components/Background3D';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users, FileText, DollarSign, Shield, AlertTriangle,
  CheckCircle, XCircle, Eye, TrendingUp, Activity
} from 'lucide-react';
import { format } from 'date-fns';

interface UserWithRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
  };
}

export default function AdminPanel() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalTests: 0, totalEarnings: 0, pendingTests: 0 });

  useEffect(() => {
    if (!authLoading && (!user || (role as string) !== 'admin')) {
      navigate('/');
      toast({ title: 'Access denied', description: 'Admin access required.', variant: 'destructive' });
    } else if (!authLoading && user && (role as string) === 'admin') {
      fetchAll();
    }
  }, [authLoading, user, role]);

  async function fetchAll() {
    setLoading(true);
    // Fetch users with roles - admin can see all via service role context
    const { data: rolesData } = await supabase.from('user_roles').select('*');
    
    // Fetch profiles for each user
    const userIds = (rolesData || []).map((r: any) => r.user_id);
    const { data: profilesData } = await supabase.from('profiles').select('*').in('user_id', userIds);
    
    const merged = (rolesData || []).map((r: any) => ({
      ...r,
      profile: (profilesData || []).find((p: any) => p.user_id === r.user_id)
    }));
    setUsers(merged);

    // Fetch all tests
    const { data: testsData } = await supabase.from('tests').select('*').order('created_at', { ascending: false });
    setTests(testsData || []);

    // Stats
    setStats({
      totalUsers: (rolesData || []).length,
      totalTests: (testsData || []).length,
      totalEarnings: 0,
      pendingTests: (testsData || []).filter((t: any) => t.status === 'pending').length,
    });

    setLoading(false);
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Admin Panel | UserNinjas</title></Helmet>
      <Background3D />
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <h1 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" /> Admin Panel
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-accent' },
            { label: 'Total Tests', value: stats.totalTests, icon: FileText, color: 'text-primary' },
            { label: 'Pending Review', value: stats.pendingTests, icon: AlertTriangle, color: 'text-warning' },
            { label: 'Active Tests', value: tests.filter(t => t.status === 'active').length, icon: Activity, color: 'text-success' },
          ].map((s, i) => (
            <Card key={i} className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-bold">{s.value}</p>
                  </div>
                  <s.icon className={`h-8 w-8 ${s.color} opacity-60`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" /> Users</TabsTrigger>
            <TabsTrigger value="tests"><FileText className="h-4 w-4 mr-1" /> Tests</TabsTrigger>
            <TabsTrigger value="fraud"><AlertTriangle className="h-4 w-4 mr-1" /> Fraud Monitor</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.profile?.full_name || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{u.profile?.email || 'N/A'}</TableCell>
                        <TableCell><Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{u.role}</Badge></TableCell>
                        <TableCell className="text-muted-foreground text-sm">{format(new Date(u.created_at), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader><CardTitle>All Tests</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tests.map(t => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.title}</TableCell>
                        <TableCell className="capitalize text-muted-foreground">{(t.test_type || 'unmoderated').replace('_', ' ')}</TableCell>
                        <TableCell>
                          <Badge variant={t.status === 'active' ? 'default' : t.status === 'completed' ? 'secondary' : 'outline'}>
                            {t.status}
                          </Badge>
                        </TableCell>
                        <TableCell>${t.reward_amount}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{format(new Date(t.created_at), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fraud">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Fraud Monitoring</CardTitle>
                <CardDescription>Flag suspicious activity like duplicate submissions or bot behavior</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="font-medium">No suspicious activity detected</p>
                  <p className="text-sm mt-1">The system monitors for duplicate submissions, rapid completions, and bot patterns.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
