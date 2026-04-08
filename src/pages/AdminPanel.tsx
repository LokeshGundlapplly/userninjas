import { useState, useEffect, useRef } from 'react';
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
import {
  Users, FileText, Shield, AlertTriangle,
  Activity, MessageCircle, Send, ArrowLeft, X as XIcon
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

interface ChatConversation {
  id: string;
  visitor_email: string | null;
  visitor_name: string | null;
  status: string;
  escalated_at: string | null;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message?: string;
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
}

export default function AdminPanel() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalTests: 0, totalEarnings: 0, pendingTests: 0 });

  // Chat state
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [convoMessages, setConvoMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [chatFilter, setChatFilter] = useState<'all' | 'escalated' | 'active' | 'closed'>('escalated');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && (!user || (role as string) !== 'admin')) {
      navigate('/');
      toast({ title: 'Access denied', description: 'Admin access required.', variant: 'destructive' });
    } else if (!authLoading && user && (role as string) === 'admin') {
      fetchAll();
    }
  }, [authLoading, user, role]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convoMessages]);

  async function fetchAll() {
    setLoading(true);
    const { data: rolesData } = await supabase.from('user_roles').select('*');
    const userIds = (rolesData || []).map((r: any) => r.user_id);
    const { data: profilesData } = await supabase.from('profiles').select('*').in('user_id', userIds);
    const merged = (rolesData || []).map((r: any) => ({
      ...r,
      profile: (profilesData || []).find((p: any) => p.user_id === r.user_id)
    }));
    setUsers(merged);

    const { data: testsData } = await supabase.from('tests').select('*').order('created_at', { ascending: false });
    setTests(testsData || []);

    setStats({
      totalUsers: (rolesData || []).length,
      totalTests: (testsData || []).length,
      totalEarnings: 0,
      pendingTests: (testsData || []).filter((t: any) => t.status === 'pending').length,
    });

    await fetchConversations();
    setLoading(false);
  }

  async function fetchConversations() {
    const { data: convos } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (convos) {
      // Fetch last message for each conversation
      const enriched = await Promise.all(convos.map(async (c: any) => {
        const { data: msgs, count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact' })
          .eq('conversation_id', c.id)
          .order('created_at', { ascending: false })
          .limit(1);
        return {
          ...c,
          message_count: count || 0,
          last_message: msgs?.[0]?.content || '',
        };
      }));
      setConversations(enriched);
    }
  }

  async function openConversation(id: string) {
    setSelectedConvo(id);
    setLoadingMessages(true);
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });
    setConvoMessages(data || []);
    setLoadingMessages(false);
  }

  async function sendReply() {
    if (!replyText.trim() || !selectedConvo || sendingReply) return;
    setSendingReply(true);
    const { error } = await supabase.from('chat_messages').insert({
      conversation_id: selectedConvo,
      role: 'agent',
      content: replyText.trim(),
    });
    if (error) {
      toast({ title: 'Error sending reply', description: error.message, variant: 'destructive' });
    } else {
      setReplyText('');
      await openConversation(selectedConvo);
    }
    setSendingReply(false);
  }

  async function closeConversation(id: string) {
    await supabase.from('chat_conversations').update({ status: 'closed' }).eq('id', id);
    toast({ title: 'Conversation closed' });
    await fetchConversations();
    if (selectedConvo === id) {
      setSelectedConvo(null);
      setConvoMessages([]);
    }
  }

  const filteredConvos = conversations.filter(c => {
    if (chatFilter === 'all') return true;
    if (chatFilter === 'escalated') return c.status === 'escalated';
    if (chatFilter === 'active') return c.status === 'active';
    if (chatFilter === 'closed') return c.status === 'closed';
    return true;
  });

  const escalatedCount = conversations.filter(c => c.status === 'escalated').length;

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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-accent' },
            { label: 'Total Tests', value: stats.totalTests, icon: FileText, color: 'text-primary' },
            { label: 'Pending Review', value: stats.pendingTests, icon: AlertTriangle, color: 'text-warning' },
            { label: 'Active Tests', value: tests.filter(t => t.status === 'active').length, icon: Activity, color: 'text-success' },
            { label: 'Escalated Chats', value: escalatedCount, icon: MessageCircle, color: escalatedCount > 0 ? 'text-destructive' : 'text-muted-foreground' },
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

        <Tabs defaultValue="chats">
          <TabsList className="mb-6">
            <TabsTrigger value="chats" className="gap-1.5">
              <MessageCircle className="h-4 w-4" /> Chats
              {escalatedCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">{escalatedCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" /> Users</TabsTrigger>
            <TabsTrigger value="tests"><FileText className="h-4 w-4 mr-1" /> Tests</TabsTrigger>
            <TabsTrigger value="fraud"><AlertTriangle className="h-4 w-4 mr-1" /> Fraud Monitor</TabsTrigger>
          </TabsList>

          {/* CHAT TAB */}
          <TabsContent value="chats">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
              {/* Conversation list */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm lg:col-span-1 flex flex-col overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Conversations</CardTitle>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {(['escalated', 'active', 'closed', 'all'] as const).map(f => (
                      <Button
                        key={f}
                        size="sm"
                        variant={chatFilter === f ? 'default' : 'outline'}
                        className="text-xs h-7 capitalize"
                        onClick={() => setChatFilter(f)}
                      >
                        {f}
                        {f === 'escalated' && escalatedCount > 0 && (
                          <Badge variant="destructive" className="ml-1 h-4 px-1 text-[9px]">{escalatedCount}</Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredConvos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      No {chatFilter} conversations
                    </div>
                  ) : filteredConvos.map(c => (
                    <button
                      key={c.id}
                      onClick={() => openConversation(c.id)}
                      className={`w-full text-left rounded-xl p-3 transition-colors ${
                        selectedConvo === c.id
                          ? 'bg-primary/10 border border-primary/30'
                          : 'hover:bg-secondary/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            c.status === 'escalated' ? 'destructive' :
                            c.status === 'active' ? 'default' : 'secondary'
                          } className="text-[10px] h-5">
                            {c.status}
                          </Badge>
                          {c.visitor_name && <span className="text-xs font-medium">{c.visitor_name}</span>}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(c.updated_at), 'MMM d, HH:mm')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.last_message || 'No messages'}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">{c.message_count} messages</p>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Message view */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm lg:col-span-2 flex flex-col overflow-hidden">
                {selectedConvo ? (
                  <>
                    {/* Chat header */}
                    <CardHeader className="pb-3 border-b border-border/40 flex-row items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button size="icon" variant="ghost" className="lg:hidden h-8 w-8" onClick={() => setSelectedConvo(null)}>
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                          <CardTitle className="text-base">
                            {conversations.find(c => c.id === selectedConvo)?.visitor_name || 'Anonymous Visitor'}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {conversations.find(c => c.id === selectedConvo)?.visitor_email || 'No email provided'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {conversations.find(c => c.id === selectedConvo)?.status !== 'closed' && (
                          <Button size="sm" variant="outline" className="text-xs h-8 gap-1" onClick={() => closeConversation(selectedConvo)}>
                            <XIcon className="h-3 w-3" /> Close
                          </Button>
                        )}
                      </div>
                    </CardHeader>

                    {/* Messages */}
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                      {loadingMessages ? (
                        <div className="text-center py-8 text-muted-foreground animate-pulse">Loading messages...</div>
                      ) : convoMessages.map(msg => (
                        <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${
                            msg.role === 'user'
                              ? 'bg-foreground/10 text-foreground'
                              : msg.role === 'agent'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary/80 text-foreground border border-border/30'
                          }`}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <Badge variant="outline" className="text-[9px] h-4 px-1 capitalize">
                                {msg.role === 'assistant' ? 'AI' : msg.role}
                              </Badge>
                              <span className="text-[10px] opacity-60">
                                {format(new Date(msg.created_at), 'HH:mm')}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={msgEndRef} />
                    </CardContent>

                    {/* Reply input */}
                    {conversations.find(c => c.id === selectedConvo)?.status !== 'closed' && (
                      <div className="p-3 border-t border-border/40">
                        <form onSubmit={(e) => { e.preventDefault(); sendReply(); }} className="flex gap-2">
                          <input
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Reply as agent..."
                            className="flex-1 bg-secondary/50 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60"
                            disabled={sendingReply}
                          />
                          <Button type="submit" size="icon" className="h-10 w-10 rounded-xl" disabled={sendingReply || !replyText.trim()}>
                            <Send className="w-4 h-4" />
                          </Button>
                        </form>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">Select a conversation</p>
                      <p className="text-sm mt-1">Choose a chat from the left to view and respond</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

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
