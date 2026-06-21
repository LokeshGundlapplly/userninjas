import { useState, useEffect, useRef, useCallback } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users, FileText, Shield, AlertTriangle, Activity, MessageCircle, Send, ArrowLeft, X as XIcon,
  TrendingUp, DollarSign, CheckCircle, Clock, Zap, BarChart3, Eye, Search, Filter, Download,
  Edit, Trash2, Eye as EyeIcon, Star, Award, Briefcase, Target, PlusCircle, Settings, RefreshCw,
  ArrowUpRight, ArrowDownRight, ExternalLink, Ticket, Mail, Tag, StickyNote,
  CreditCard, Wallet, Receipt
} from 'lucide-react';
import { format } from 'date-fns';
import { generateInvoiceHTML, type PaymentRecord } from '@/components/recruiter/RecruiterPaymentsPanel';

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

interface TestData {
  id: string;
  title: string;
  description: string | null;
  recruiter_id: string;
  status: string;
  reward_amount: number;
  estimated_duration: number;
  created_at: string;
  recruiter?: { full_name: string | null; email: string | null };
  max_testers?: number;
  current_testers?: number;
}

interface SubmissionData {
  id: string;
  test_id: string;
  tester_id: string;
  status: string;
  rating: number | null;
  submitted_at: string;
  tests?: { title: string; reward_amount: number };
  profiles?: { full_name: string | null };
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

interface UserStats {
  user_id: string;
  profile?: { full_name: string | null; email: string | null };
  tests_created?: number;
  submissions_completed?: number;
  average_rating?: number;
  total_spent?: number;
  earnings?: number;
}

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  issue: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  conversation_id: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminPanel() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [tests, setTests] = useState<TestData[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    totalRecruiters: 0,
    totalTesters: 0,
    totalTests: 0, 
    totalEarnings: 0, 
    pendingTests: 0,
    activeTests: 0,
    escalatedChats: 0,
    avgTestRating: 0,
    openTickets: 0,
    totalRevenueINR: 0,
    totalRevenueUSD: 0,
  });

  // Payments State
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [paymentGatewayFilter, setPaymentGatewayFilter] = useState<string>('all');
  const [paymentPlanFilter, setPaymentPlanFilter] = useState<string>('all');

  // Manual Invoice dialog form states
  const [manualInvoiceOpen, setManualInvoiceOpen] = useState(false);
  const [manualInvoiceUserId, setManualInvoiceUserId] = useState('');
  const [manualInvoiceAmount, setManualInvoiceAmount] = useState('');
  const [manualInvoiceCurrency, setManualInvoiceCurrency] = useState('INR');
  const [manualInvoicePlanType, setManualInvoicePlanType] = useState('none');
  const [manualInvoiceGateway, setManualInvoiceGateway] = useState('manual');
  const [manualInvoiceStatus, setManualInvoiceStatus] = useState('successful');
  const [manualInvoiceDate, setManualInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [manualInvoiceDescription, setManualInvoiceDescription] = useState('');
  const [savingManualInvoice, setSavingManualInvoice] = useState(false);

  // Ticket state
  const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('open');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketNotesInput, setTicketNotesInput] = useState('');
  const [updatingTicket, setUpdatingTicket] = useState(false);

  // Filter & Search
  const [activeTab, setActiveTab] = useState('overview');
  const [chatFilter, setChatFilter] = useState<'all' | 'escalated' | 'active' | 'closed'>('escalated');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'recruiter' | 'tester'>('all');
  const [testSearchQuery, setTestSearchQuery] = useState('');
  const [testStatusFilter, setTestStatusFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['overview', 'tests', 'users', 'recruiting', 'testing', 'chats', 'tickets', 'payments'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Chat state
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [convoMessages, setConvoMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [editingTest, setEditingTest] = useState<TestData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ title: '', description: '', reward_amount: '', status: '' });
  const [error, setError] = useState<string | null>(null);

  // Define fetchConversations first (used by fetchAll)
  const fetchConversations = useCallback(async () => {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching conversations:', error);
    } else {
      console.log('✓ Loaded conversations:', data?.length || 0);
      setConversations(data as ChatConversation[] || []);
    }
  }, []);

  // Define fetchAll BEFORE useEffect that uses it
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch users with roles
      const { data: rolesData, error: rolesError } = await supabase.from('user_roles').select('*');
      if (rolesError) {
        console.error('❌ Error fetching roles:', rolesError);
        console.error('Full error details:', JSON.stringify(rolesError, null, 2));
        toast({ title: 'Error', description: `Failed to load roles: ${rolesError.message}`, variant: 'destructive' });
        setUsers([]);
      } else {
        const userIds = (rolesData || []).map((r: any) => r.user_id);
        const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('*').in('user_id', userIds);
        
        if (profilesError) {
          console.error('❌ Error fetching profiles:', profilesError);
        }
        
        const merged = (rolesData || []).map((r: any) => ({
          ...r,
          profile: (profilesData || []).find((p: any) => p.user_id === r.user_id)
        }));
        setUsers(merged);
        console.log('✓ Loaded users:', merged.length);
      }

      // Fetch tests
      const { data: testsData, error: testsError } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (testsError) {
        console.error('❌ Error fetching tests:', testsError);
        console.error('Full error details:', JSON.stringify(testsError, null, 2));
        setTests([]);
      } else {
        console.log('✓ Loaded tests:', testsData?.length || 0);
        const { data: profilesData } = await supabase.from('profiles').select('*');
        // Enrich tests with recruiter info
        const enrichedTests = (testsData || []).map((t: any) => ({
          ...t,
          recruiter: (profilesData || []).find((p: any) => p.user_id === t.recruiter_id) || null
        }));
        setTests(enrichedTests as TestData[]);
      }

      // Fetch submissions with test relations
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('test_submissions')
        .select('*, tests(title, reward_amount)')
        .order('created_at', { ascending: false });
      
      if (submissionsError) {
        console.error('❌ Error fetching submissions:', submissionsError);
        console.error('Full error details:', JSON.stringify(submissionsError, null, 2));
        setSubmissions([]);
      } else {
        console.log('✓ Loaded submissions:', submissionsData?.length || 0);
        setSubmissions(submissionsData as SubmissionData[] || []);
      }

      // Fetch conversations
      await fetchConversations();

      // Fetch support tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ticketsError) {
        console.error('❌ Error fetching tickets:', ticketsError);
      } else {
        console.log('✓ Loaded tickets:', ticketsData?.length || 0);
        setTickets(ticketsData as SupportTicket[] || []);
      }

      // Fetch payments
      setLoadingPayments(true);
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });
      
      let fetchedPayments: PaymentRecord[] = [];
      if (paymentsError) {
        console.error('❌ Error fetching payments:', paymentsError);
      } else {
        fetchedPayments = (paymentsData as PaymentRecord[]) || [];
        setPayments(fetchedPayments);
        console.log('✓ Loaded payments:', fetchedPayments.length);
      }
      setLoadingPayments(false);

      // Calculate stats
      const totalRecruiters = (rolesData || []).filter((r: any) => r.role === 'recruiter').length;
      const totalTesters = (rolesData || []).filter((r: any) => r.role === 'tester').length;
      const activeTests = (testsData || []).filter((t: any) => t.status === 'active').length;
      const avgRating = (submissionsData || []).filter((s: any) => s.rating).length > 0
        ? ((submissionsData || []).reduce((sum: number, s: any) => sum + (s.rating || 0), 0) / 
           (submissionsData || []).filter((s: any) => s.rating).length).toFixed(1)
        : 0;

      const { data: escalatedChats } = await supabase
        .from('chat_conversations')
        .select('id', { count: 'exact' })
        .eq('status', 'escalated');

      const successfulPayments = fetchedPayments.filter(p => p.status === 'successful');
      const totalRevenueINR = successfulPayments.filter(p => p.currency === 'INR').reduce((sum, p) => sum + Number(p.amount), 0);
      const totalRevenueUSD = successfulPayments.filter(p => p.currency === 'USD').reduce((sum, p) => sum + Number(p.amount), 0);

      setStats({
        totalUsers: (rolesData || []).length,
        totalRecruiters,
        totalTesters,
        totalTests: (testsData || []).length,
        totalEarnings: 0,
        pendingTests: (testsData || []).filter((t: any) => t.status === 'pending').length,
        activeTests,
        escalatedChats: escalatedChats?.length || 0,
        avgTestRating: parseFloat(avgRating as string),
        openTickets: (ticketsData || []).filter((t: any) => t.status === 'open' || t.status === 'in_progress').length,
        totalRevenueINR,
        totalRevenueUSD,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Fatal error in fetchAll:', errorMsg, error);
      setError(`Failed to load admin data: ${errorMsg}`);
      toast({ title: 'Error', description: `Failed to load admin data: ${errorMsg}`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast, fetchConversations]);

  useEffect(() => {
    if (!authLoading && (!user || (role as string) !== 'admin')) {
      navigate('/');
      toast({ title: 'Access denied', description: 'Admin access required.', variant: 'destructive' });
    } else if (!authLoading && user && (role as string) === 'admin') {
      fetchAll();
    }
  }, [authLoading, user, role, navigate, toast, fetchAll]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convoMessages]);

  // sendReply function and other handlers follow

  const openConversation = async (id: string) => {
    setSelectedConvo(id);
    setLoadingMessages(true);
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });
    setConvoMessages(data || []);
    setLoadingMessages(false);
  };

  const sendReply = async () => {
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
  };

  const closeConversation = async (id: string) => {
    await supabase.from('chat_conversations').update({ status: 'closed' }).eq('id', id);
    toast({ title: 'Conversation closed' });
    await fetchConversations();
    if (selectedConvo === id) {
      setSelectedConvo(null);
      setConvoMessages([]);
    }
  };

  const handleUpdateTest = async () => {
    if (!editingTest) return;
    const { error } = await supabase
      .from('tests')
      .update({
        title: editFormData.title || editingTest.title,
        description: editFormData.description || editingTest.description,
        reward_amount: editFormData.reward_amount ? parseFloat(editFormData.reward_amount) : editingTest.reward_amount,
        status: editFormData.status || editingTest.status,
      })
      .eq('id', editingTest.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Test updated successfully' });
      setEditDialogOpen(false);
      setEditingTest(null);
      fetchAll();
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure? This will delete the test and all related submissions.')) return;
    const { error } = await supabase.from('tests').delete().eq('id', testId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Test deleted' });
      fetchAll();
    }
  };

  const handleCreateManualInvoice = async () => {
    if (!manualInvoiceUserId) {
      toast({ title: 'Error', description: 'Please select a recruiter', variant: 'destructive' });
      return;
    }
    if (!manualInvoiceAmount || parseFloat(manualInvoiceAmount) <= 0) {
      toast({ title: 'Error', description: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }
    setSavingManualInvoice(true);
    try {
      const amount = parseFloat(manualInvoiceAmount);
      const isSub = manualInvoicePlanType !== 'none';
      
      let description = manualInvoiceDescription.trim();
      if (!description) {
        if (isSub) {
          const planLabel = manualInvoicePlanType.charAt(0).toUpperCase() + manualInvoicePlanType.slice(1);
          description = `Manual invoice – ${planLabel} Subscription`;
        } else {
          description = `Manual invoice – Wallet Top-up (${manualInvoiceCurrency === 'INR' ? '₹' : '$'}${amount.toLocaleString('en-IN')})`;
        }
      }

      // 1. Insert payment record
      const paymentPayload = {
        user_id: manualInvoiceUserId,
        amount,
        currency: manualInvoiceCurrency,
        gateway: manualInvoiceGateway,
        status: manualInvoiceStatus,
        plan_type: isSub ? manualInvoicePlanType : null,
        description,
        created_at: new Date(manualInvoiceDate).toISOString()
      };

      const { data: newPayment, error: paymentError } = await supabase
        .from('payments')
        .insert(paymentPayload)
        .select()
        .single();

      if (paymentError) throw paymentError;

      // 2. If successful status, apply effects to subscription or wallet
      if (manualInvoiceStatus === 'successful') {
        if (isSub) {
          // Calculate active test and invite limits
          let testLimit = 2;
          let inviteLimit = 25;
          let durationDays = 30;

          if (manualInvoicePlanType === 'per_test') {
            testLimit = 1;
            inviteLimit = 50;
            durationDays = 30;
          } else if (manualInvoicePlanType === 'monthly') {
            testLimit = 5;
            inviteLimit = 200;
            durationDays = 30;
          } else if (manualInvoicePlanType === 'yearly') {
            testLimit = 99999;
            inviteLimit = 3000;
            durationDays = 365;
          }

          const startDate = new Date(manualInvoiceDate);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + durationDays);

          // Upsert subscription
          const { error: subError } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: manualInvoiceUserId,
              plan_type: manualInvoicePlanType,
              payment_status: 'success',
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
              is_valid: true,
              tests_created: 0,
              invites_sent: 0,
              active_test_limit: testLimit,
              invite_limit: inviteLimit,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

          if (subError) throw subError;

          // Update profile
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              plan_type: manualInvoicePlanType,
              study_limit: testLimit,
              subscription_status: 'active',
              subscription_end: endDate.toISOString()
            })
            .eq('user_id', manualInvoiceUserId);

          if (profileError) throw profileError;

        } else {
          // Wallet Top-up: Increment balance
          const { data: profData, error: fetchErr } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('user_id', manualInvoiceUserId)
            .single();

          if (fetchErr) throw fetchErr;

          const currentBalance = (profData as any)?.wallet_balance || 0;
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              wallet_balance: currentBalance + amount
            })
            .eq('user_id', manualInvoiceUserId);

          if (profileError) throw profileError;
        }
      }

      toast({ title: 'Success', description: 'Manual payment & invoice generated successfully' });
      setManualInvoiceOpen(false);
      // Reset form
      setManualInvoiceUserId('');
      setManualInvoiceAmount('');
      setManualInvoicePlanType('none');
      setManualInvoiceGateway('manual');
      setManualInvoiceStatus('successful');
      setManualInvoiceDate(format(new Date(), 'yyyy-MM-dd'));
      setManualInvoiceDescription('');
      
      // Refresh statistics
      fetchAll();
    } catch (err: any) {
      console.error('❌ Error saving manual invoice:', err);
      toast({ title: 'Error generating invoice', description: err.message, variant: 'destructive' });
    } finally {
      setSavingManualInvoice(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment record? This will not revert profile subscription or wallet balance changes.')) return;
    try {
      const { error } = await supabase.from('payments').delete().eq('id', paymentId);
      if (error) throw error;
      toast({ title: 'Success', description: 'Payment record deleted' });
      fetchAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDownloadInvoice = (payment: PaymentRecord) => {
    const recruiterUser = users.find(u => u.user_id === payment.user_id);
    const html = generateInvoiceHTML(payment, recruiterUser?.profile?.email || 'in.gundlapplly@gmail.com', recruiterUser?.profile);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) win.onload = () => { win.print(); };
  };

  // Filters
  const filteredPayments = payments.filter(p => {
    const matchesSearch = !paymentSearchQuery || 
                          p.id.toLowerCase().includes(paymentSearchQuery.toLowerCase()) ||
                          p.description?.toLowerCase().includes(paymentSearchQuery.toLowerCase()) ||
                          users.find(u => u.user_id === p.user_id)?.profile?.full_name?.toLowerCase().includes(paymentSearchQuery.toLowerCase()) ||
                          users.find(u => u.user_id === p.user_id)?.profile?.email?.toLowerCase().includes(paymentSearchQuery.toLowerCase());
    
    const matchesStatus = paymentStatusFilter === 'all' || p.status === paymentStatusFilter;
    const matchesGateway = paymentGatewayFilter === 'all' || p.gateway === paymentGatewayFilter;
    
    let matchesType = true;
    if (paymentPlanFilter !== 'all') {
      if (paymentPlanFilter === 'credits') {
        matchesType = !p.plan_type;
      } else {
        matchesType = p.plan_type === paymentPlanFilter;
      }
    }

    return matchesSearch && matchesStatus && matchesGateway && matchesType;
  });

  const filteredUsers = users.filter(u => {
    const matchesSearch = !userSearchQuery || u.profile?.full_name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                         u.profile?.email?.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredTests = tests.filter(t => {
    const matchesSearch = !testSearchQuery || t.title.toLowerCase().includes(testSearchQuery.toLowerCase());
    const matchesStatus = testStatusFilter === 'all' || t.status === testStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredConvos = conversations.filter(c => {
    if (chatFilter === 'all') return true;
    return c.status === chatFilter;
  });

  const filteredTickets = tickets.filter(t => {
    if (ticketFilter === 'all') return true;
    return t.status === ticketFilter;
  });

  const handleUpdateTicket = async (ticketId: string, status: string, notes?: string) => {
    setUpdatingTicket(true);
    const { error } = await supabase
      .from('support_tickets')
      .update({ status, ...(notes !== undefined ? { resolution_notes: notes } : {}) })
      .eq('id', ticketId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Ticket updated' });
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: status as SupportTicket['status'], resolution_notes: notes ?? t.resolution_notes } : t));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: status as SupportTicket['status'], resolution_notes: notes ?? prev.resolution_notes } : null);
      }
    }
    setUpdatingTicket(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background pt-24 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
              <div className="h-10 bg-secondary/50 rounded w-64 animate-pulse"></div>
              <div className="h-4 bg-secondary/30 rounded w-48 animate-pulse"></div>
            </div>
            <div className="h-10 bg-secondary/50 rounded w-24 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-28 bg-card rounded-xl border border-border/50 animate-pulse"></div>
            ))}
          </div>
          <div className="h-12 bg-card/50 rounded-lg w-full mb-6 border border-border/50 animate-pulse"></div>
          <div className="h-[400px] bg-card rounded-xl border border-border/50 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!user || role !== 'admin') return null;
  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Admin Dashboard | User Ninjas</title></Helmet>
      <Background3D />
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        {/* Error Banner */}
        {error && (
          <Card className="mb-6 border-red-500/50 bg-red-500/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-red-600">Error Loading Admin Data</p>
                  <p className="text-sm text-red-600/80 mt-1">{error}</p>
                  <p className="text-xs text-red-600/60 mt-2">Check browser console (F12) for more details.</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setError(null)}
                  className="h-6 w-6 p-0 flex-shrink-0"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              Admin Control Center
            </h1>
            <p className="text-muted-foreground">Manage platform, users, tests, and communications</p>
          </div>
          <Button onClick={fetchAll} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+12%' },
            { label: 'Recruiters', value: stats.totalRecruiters, icon: Briefcase, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: '+5%' },
            { label: 'Testers', value: stats.totalTesters, icon: Target, color: 'text-cyan-500', bg: 'bg-cyan-500/10', trend: '+18%' },
            { label: 'Active Tests', value: stats.activeTests, icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10', trend: '+3%' },
            { label: 'Escalated', value: stats.escalatedChats, icon: AlertTriangle, color: stats.escalatedChats > 0 ? 'text-red-500' : 'text-muted-foreground', bg: stats.escalatedChats > 0 ? 'bg-red-500/10' : 'bg-secondary', trend: stats.escalatedChats > 0 ? 'ACTION' : 'GOOD' },
            { label: 'Open Tickets', value: stats.openTickets, icon: Ticket, color: stats.openTickets > 0 ? 'text-orange-500' : 'text-muted-foreground', bg: stats.openTickets > 0 ? 'bg-orange-500/10' : 'bg-secondary', trend: stats.openTickets > 0 ? 'PENDING' : 'CLEAR' },
          ].map((stat, i) => (
            <Card key={i} className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden hover:border-border transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <Badge variant="secondary" className="text-[10px]">{stat.trend}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); window.location.hash = val; }} className="w-full">
          <TabsList className="mb-6 bg-card/50 border border-border/50 p-1 flex-wrap gap-1">
            <TabsTrigger value="overview" className="gap-2"><Eye className="h-4 w-4" />Overview</TabsTrigger>
            <TabsTrigger value="tests" className="gap-2"><FileText className="h-4 w-4" />Tests & Postings</TabsTrigger>
            <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" />Users</TabsTrigger>
            <TabsTrigger value="recruiting" className="gap-2"><Briefcase className="h-4 w-4" />Recruiter Hub</TabsTrigger>
            <TabsTrigger value="testing" className="gap-2"><Target className="h-4 w-4" />Tester Hub</TabsTrigger>
            <TabsTrigger value="chats" className="gap-2 relative"><MessageCircle className="h-4 w-4" />Support
              {stats.escalatedChats > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-[10px]">{stats.escalatedChats}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-2 relative"><Ticket className="h-4 w-4" />Tickets
              {stats.openTickets > 0 && (
                <Badge className="ml-2 h-5 px-1.5 text-[10px] bg-orange-500 text-white">{stats.openTickets}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2"><CreditCard className="h-4 w-4" />Payments & Invoices</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Platform Health */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" /> Platform Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Test Completion Rate</span>
                        <span className="text-sm font-bold text-primary">68%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-gradient-to-r from-primary to-primary/60 h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">User Engagement</span>
                        <span className="text-sm font-bold text-green-500">82%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-500 to-green-500/60 h-2 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Test Quality (Avg Rating)</span>
                        <span className="text-sm font-bold text-amber-500">{stats.avgTestRating}/5</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-500/60 h-2 rounded-full" style={{ width: `${(stats.avgTestRating / 5) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="outline" size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" /> Create Test
                  </Button>
                  <Button className="w-full justify-start" variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-2" /> Add User
                  </Button>
                  <Button className="w-full justify-start" variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" /> Export Report
                  </Button>
                  <Button className="w-full justify-start" variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" /> Settings
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {submissions.slice(0, 5).map((sub, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{sub.tests?.title || 'Test'}</p>
                          <p className="text-xs text-muted-foreground">{sub.tester_id.slice(0, 8)}…</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{sub.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TESTS & POSTINGS TAB */}
          <TabsContent value="tests" className="space-y-6">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" /> All Tests & Postings
                    </CardTitle>
                    <CardDescription>Manage all tests from all recruiters</CardDescription>
                  </div>
                  <Button className="gap-2"><PlusCircle className="h-4 w-4" />New Test</Button>
                </div>
                
                <div className="flex gap-3 mt-4 flex-wrap">
                  <div className="flex-1 min-w-52 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search tests..." 
                      value={testSearchQuery}
                      onChange={(e) => setTestSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={testStatusFilter} onValueChange={(val: any) => setTestStatusFilter(val)}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Recruiter</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reward</TableHead>
                        <TableHead>Submissions</TableHead>
                        <TableHead>Avg Rating</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTests.map(test => {
                        const testSubs = submissions.filter(s => s.test_id === test.id);
                        const avgRating = testSubs.filter(s => s.rating).length > 0
                          ? (testSubs.reduce((sum, s) => sum + (s.rating || 0), 0) / testSubs.filter(s => s.rating).length).toFixed(1)
                          : '—';
                        
                        return (
                          <TableRow key={test.id} className="hover:bg-secondary/30">
                            <TableCell className="font-medium max-w-xs truncate">{test.title}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{test.recruiter?.full_name || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant={test.status === 'active' ? 'default' : test.status === 'completed' ? 'secondary' : 'outline'}>
                                {test.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-green-600">${test.reward_amount}</TableCell>
                            <TableCell className="text-center">{testSubs.length}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                {avgRating}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{format(new Date(test.created_at), 'MMM d, yy')}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingTest(test);
                                    setEditFormData({
                                      title: test.title,
                                      description: test.description || '',
                                      reward_amount: test.reward_amount.toString(),
                                      status: test.status
                                    });
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteTest(test.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users" className="space-y-6">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" /> User Management
                  </CardTitle>
                  <CardDescription>Manage all users on the platform</CardDescription>
                </div>
                
                <div className="flex gap-3 mt-4 flex-wrap">
                  <div className="flex-1 min-w-52 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search users..." 
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={userRoleFilter} onValueChange={(val: any) => setUserRoleFilter(val)}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="recruiter">Recruiters</SelectItem>
                      <SelectItem value="tester">Testers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map(u => (
                        <TableRow key={u.id} className="hover:bg-secondary/30">
                          <TableCell className="font-medium">{u.profile?.full_name || 'N/A'}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{u.profile?.email || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={u.role === 'admin' ? 'default' : u.role === 'recruiter' ? 'secondary' : 'outline'} className="capitalize">
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{format(new Date(u.created_at), 'MMM d, yyyy')}</TableCell>
                          <TableCell><Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">Active</Badge></TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost">
                              <EyeIcon className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RECRUITER HUB TAB */}
          <TabsContent value="recruiting" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recruiter Stats */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base">Recruiter Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Recruiters</p>
                    <p className="text-3xl font-bold">{stats.totalRecruiters}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tests Created</p>
                    <p className="text-3xl font-bold">{tests.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Tests</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeTests}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Test Performance */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Top Performing Recruiters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from(new Set(tests.map(t => t.recruiter_id))).slice(0, 5).map((recruiterId) => {
                      const recruiterTests = tests.filter(t => t.recruiter_id === recruiterId);
                      const recruiterSubs = submissions.filter(s => recruiterTests.find(t => t.id === s.test_id));
                      const recruiter = recruiterTests[0]?.recruiter;
                      return (
                        <div key={recruiterId} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{recruiter?.full_name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{recruiterTests.length} tests • {recruiterSubs.length} submissions</p>
                          </div>
                          <Badge variant="secondary">{((recruiterSubs.length / (recruiterTests.length * 1)) * 100).toFixed(0)}%</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TESTER HUB TAB */}
          <TabsContent value="testing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tester Stats */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base">Tester Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Testers</p>
                    <p className="text-3xl font-bold">{stats.totalTesters}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Submissions</p>
                    <p className="text-3xl font-bold">{submissions.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg Quality</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.avgTestRating}/5</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quality Metrics */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Top Quality Testers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from(new Set(submissions.map(s => s.tester_id))).slice(0, 5).map((testerId) => {
                      const testerSubs = submissions.filter(s => s.tester_id === testerId);
                      const avgRating = testerSubs.filter(s => s.rating).length > 0
                        ? (testerSubs.reduce((sum, s) => sum + (s.rating || 0), 0) / testerSubs.filter(s => s.rating).length).toFixed(1)
                        : '0';
                      return (
                        <div key={testerId} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                              <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">{testerId.slice(0, 12)}…</p>
                              <p className="text-xs text-muted-foreground">{testerSubs.length} submissions</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs font-bold">{avgRating}/5</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* CHATS TAB */}
          <TabsContent value="chats">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[700px]">
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
                        {f === 'escalated' && stats.escalatedChats > 0 && (
                          <Badge variant="destructive" className="ml-1 h-4 px-1 text-[9px]">{stats.escalatedChats}</Badge>
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
                          {c.visitor_name && <span className="text-xs font-medium truncate">{c.visitor_name}</span>}
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                          {format(new Date(c.updated_at), 'HH:mm')}
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
                            {conversations.find(c => c.id === selectedConvo)?.visitor_email || 'No email'}
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
                        <div className="text-center py-8 text-muted-foreground animate-pulse">Loading...</div>
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
                            placeholder="Reply..."
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

          {/* TICKETS TAB */}
          <TabsContent value="tickets" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[600px]">
              {/* Ticket list */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm lg:col-span-1 flex flex-col overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Ticket className="h-4 w-4 text-orange-500" /> Support Tickets</CardTitle>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {(['open', 'in_progress', 'resolved', 'closed', 'all'] as const).map(f => (
                      <Button
                        key={f}
                        size="sm"
                        variant={ticketFilter === f ? 'default' : 'outline'}
                        className="text-xs h-7 capitalize"
                        onClick={() => setTicketFilter(f)}
                      >
                        {f.replace('_', ' ')}
                        {f === 'open' && stats.openTickets > 0 && (
                          <Badge className="ml-1 h-4 px-1 text-[9px] bg-orange-500">{stats.openTickets}</Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredTickets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <Ticket className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      No {ticketFilter} tickets
                    </div>
                  ) : filteredTickets.map(ticket => (
                    <button
                      key={ticket.id}
                      onClick={() => { setSelectedTicket(ticket); setTicketNotesInput(ticket.resolution_notes || ''); }}
                      className={`w-full text-left rounded-xl p-3 transition-colors ${
                        selectedTicket?.id === ticket.id
                          ? 'bg-primary/10 border border-primary/30'
                          : 'hover:bg-secondary/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant={ticket.priority === 'urgent' ? 'destructive' : ticket.priority === 'high' ? 'default' : 'secondary'}
                            className="text-[9px] h-4 px-1.5 capitalize"
                          >
                            {ticket.priority}
                          </Badge>
                          <Badge
                            variant={ticket.status === 'open' ? 'outline' : ticket.status === 'resolved' ? 'secondary' : 'outline'}
                            className={`text-[9px] h-4 px-1.5 capitalize ${
                              ticket.status === 'open' ? 'border-orange-400 text-orange-600' :
                              ticket.status === 'in_progress' ? 'border-blue-400 text-blue-600' :
                              ticket.status === 'resolved' ? 'border-green-400 text-green-600' : ''
                            }`}
                          >
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <span className="text-[9px] text-muted-foreground whitespace-nowrap ml-1">
                          {format(new Date(ticket.created_at), 'MMM d HH:mm')}
                        </span>
                      </div>
                      <p className="text-xs font-medium truncate">{ticket.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{ticket.email}</p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{ticket.issue}</p>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Ticket detail */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm lg:col-span-2 flex flex-col overflow-hidden">
                {selectedTicket ? (
                  <>
                    <CardHeader className="pb-3 border-b border-border/40">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-orange-500" />
                            Ticket #{selectedTicket.id.slice(0, 8)}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Submitted {format(new Date(selectedTicket.created_at), 'PPpp')}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Badge variant={selectedTicket.priority === 'urgent' ? 'destructive' : 'secondary'} className="capitalize">
                            {selectedTicket.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                      {/* Contact info */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-secondary/30">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Users className="h-3 w-3" /> Name
                          </p>
                          <p className="text-sm font-medium">{selectedTicket.name}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/30">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Mail className="h-3 w-3" /> Email
                          </p>
                          <a href={`mailto:${selectedTicket.email}`} className="text-sm font-medium text-primary hover:underline">
                            {selectedTicket.email}
                          </a>
                        </div>
                      </div>

                      {/* Issue */}
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Tag className="h-3 w-3" /> Issue
                        </p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedTicket.issue}</p>
                      </div>

                      {/* Status update */}
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Update Status</Label>
                        <div className="flex gap-2 flex-wrap">
                          {(['open', 'in_progress', 'resolved', 'closed'] as const).map(s => (
                            <Button
                              key={s}
                              size="sm"
                              variant={selectedTicket.status === s ? 'default' : 'outline'}
                              className="text-xs h-7 capitalize"
                              onClick={() => handleUpdateTicket(selectedTicket.id, s)}
                              disabled={updatingTicket || selectedTicket.status === s}
                            >
                              {s.replace('_', ' ')}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Resolution notes */}
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                          <StickyNote className="h-3 w-3" /> Resolution Notes
                        </Label>
                        <Textarea
                          value={ticketNotesInput}
                          onChange={(e) => setTicketNotesInput(e.target.value)}
                          placeholder="Add notes about how this was resolved..."
                          className="h-24 text-sm"
                        />
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={() => handleUpdateTicket(selectedTicket.id, selectedTicket.status, ticketNotesInput)}
                          disabled={updatingTicket}
                        >
                          Save Notes
                        </Button>
                      </div>

                      {/* Linked conversation */}
                      {selectedTicket.conversation_id && (
                        <div className="p-3 rounded-lg bg-secondary/30">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Linked Conversation</p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 gap-1"
                            onClick={() => { setActiveTab('chats'); }}
                          >
                            <MessageCircle className="h-3 w-3" /> View Chat
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Ticket className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">Select a ticket</p>
                      <p className="text-sm mt-1">Choose a support ticket to view details and update status</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* PAYMENTS & INVOICES TAB */}
          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <Card className="border-border/50 bg-card/85 backdrop-blur-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue (INR)</p>
                    <h3 className="text-2xl font-bold mt-1 text-emerald-400">₹{stats.totalRevenueINR.toLocaleString('en-IN')}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/15">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/85 backdrop-blur-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue (USD)</p>
                    <h3 className="text-2xl font-bold mt-1 text-violet-400">${stats.totalRevenueUSD.toLocaleString('en-US')}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/15">
                    <DollarSign className="h-5 w-5 text-violet-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/85 backdrop-blur-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Invoices</p>
                    <h3 className="text-2xl font-bold mt-1 text-blue-400">{payments.length}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/15">
                    <Receipt className="h-5 w-5 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/85 backdrop-blur-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Subscriptions</p>
                    <h3 className="text-2xl font-bold mt-1 text-amber-500">
                      {users.filter(u => u.profile?.plan_type && u.profile.plan_type !== 'free').length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/15">
                    <Zap className="h-5 w-5 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" /> Recruiter Invoices & Payments
                    </CardTitle>
                    <CardDescription>View transaction histories and record manual payments</CardDescription>
                  </div>
                  <Button onClick={() => setManualInvoiceOpen(true)} className="gap-2 shrink-0">
                    <PlusCircle className="h-4 w-4" /> Create Manual Invoice
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <div className="relative col-span-1 sm:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search by Invoice ID, description, or recruiter..." 
                      value={paymentSearchQuery}
                      onChange={(e) => setPaymentSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                    <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="successful">Successful</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={paymentPlanFilter} onValueChange={setPaymentPlanFilter}>
                    <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="credits">Credits Top-up</SelectItem>
                      <SelectItem value="per_test">Pay-Per-Test</SelectItem>
                      <SelectItem value="monthly">Standard (Monthly)</SelectItem>
                      <SelectItem value="yearly">Enterprise (Yearly)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent>
                <ScrollArea className="h-[600px]">
                  {filteredPayments.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                      <Receipt className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="font-semibold text-lg">No payments found</p>
                      <p className="text-sm mt-1">Try resetting the filters or record a manual transaction.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice ID / Date</TableHead>
                          <TableHead>Recruiter</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Gateway</TableHead>
                          <TableHead style={{ textAlign: 'right' }}>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPayments.map(p => {
                          const recruiter = users.find(u => u.user_id === p.user_id);
                          const isINR = p.currency === 'INR';
                          const symbol = isINR ? '₹' : '$';
                          
                          return (
                            <TableRow key={p.id} className="hover:bg-secondary/30">
                              <TableCell>
                                <div className="font-mono text-xs font-semibold text-white">INV-{p.id.slice(0, 8).toUpperCase()}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(p.created_at), 'MMM d, yyyy HH:mm')}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-sm">{recruiter?.profile?.full_name || 'Unknown Recruiter'}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{recruiter?.profile?.email || 'N/A'}</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1 items-start">
                                  <Badge variant="outline" className={`text-[10px] uppercase font-bold ${
                                    p.plan_type === 'monthly' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
                                    p.plan_type === 'yearly' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                    p.plan_type === 'per_test' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  }`}>
                                    {p.plan_type ? p.plan_type.replace('_', ' ') : 'Credits'}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground max-w-[180px] truncate" title={p.description || ''}>
                                    {p.description || 'Wallet Credit Top-up'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize text-xs font-medium bg-slate-500/5 text-slate-300 border-slate-800">
                                  {p.gateway}
                                </Badge>
                              </TableCell>
                              <TableCell style={{ textAlign: 'right' }} className="font-semibold text-white">
                                {symbol}{Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`capitalize font-semibold text-xs py-0.5 px-2 rounded-full border ${
                                  p.status === 'successful' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  p.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                  'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                  {p.status}
                                </Badge>
                              </TableCell>
                              <TableCell style={{ textAlign: 'right' }}>
                                <div className="flex gap-1.5 justify-end">
                                  {p.status === 'successful' && (
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => handleDownloadInvoice(p)}
                                      title="Print/Download Invoice"
                                      className="h-8 w-8 p-0"
                                    >
                                      <Download className="h-3.5 w-3.5 text-slate-400 hover:text-white" />
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => handleDeletePayment(p.id)}
                                    title="Delete Transaction"
                                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Test Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-sm border-border/50">
          <DialogHeader>
            <DialogTitle>Edit Test</DialogTitle>
            <DialogDescription>Modify test details and settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                placeholder="Test title"
              />
            </div>
            <div>
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Test description"
                className="h-24"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-reward">Reward ($)</Label>
                <Input
                  id="edit-reward"
                  type="number"
                  value={editFormData.reward_amount}
                  onChange={(e) => setEditFormData({ ...editFormData, reward_amount: e.target.value })}
                  placeholder="Amount"
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editFormData.status} onValueChange={(val) => setEditFormData({ ...editFormData, status: val })}>
                  <SelectTrigger id="edit-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateTest}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Manual Invoice Dialog */}
      <Dialog open={manualInvoiceOpen} onOpenChange={setManualInvoiceOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-sm border-border/50 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" /> Create Manual Invoice
            </DialogTitle>
            <DialogDescription>Record a manual invoice and provision access features or credits to a recruiter.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Select Recruiter *</Label>
              <Select value={manualInvoiceUserId} onValueChange={setManualInvoiceUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a recruiter..." />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.role === 'recruiter' || u.profile?.email === 'in.gundlapplly@gmail.com').length === 0 ? (
                    <div className="text-center py-2 text-sm text-muted-foreground">No recruiters found</div>
                  ) : (
                    users
                      .filter(u => u.role === 'recruiter' || u.profile?.email === 'in.gundlapplly@gmail.com')
                      .map(u => (
                        <SelectItem key={u.user_id} value={u.user_id}>
                          {u.profile?.full_name || 'No Name'} ({u.profile?.email || 'N/A'})
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input 
                  type="number" 
                  min="0.01" 
                  step="0.01" 
                  value={manualInvoiceAmount} 
                  onChange={e => setManualInvoiceAmount(e.target.value)} 
                  placeholder="0.00" 
                />
              </div>

              <div className="space-y-2">
                <Label>Currency *</Label>
                <Select value={manualInvoiceCurrency} onValueChange={setManualInvoiceCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Invoice Type / Plan *</Label>
                <Select value={manualInvoicePlanType} onValueChange={setManualInvoicePlanType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Wallet Credits Top-up</SelectItem>
                    <SelectItem value="per_test">Pay-Per-Test Plan</SelectItem>
                    <SelectItem value="monthly">Standard (Monthly) Plan</SelectItem>
                    <SelectItem value="yearly">Enterprise (Yearly) Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Date *</Label>
                <Input 
                  type="date" 
                  value={manualInvoiceDate} 
                  onChange={e => setManualInvoiceDate(e.target.value)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Method / Gateway *</Label>
                <Select value={manualInvoiceGateway} onValueChange={setManualInvoiceGateway}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash / Cheque</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="razorpay">Razorpay</SelectItem>
                    <SelectItem value="other">Other / Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status *</Label>
                <Select value={manualInvoiceStatus} onValueChange={setManualInvoiceStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="successful">Paid (Successful)</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description / Invoice Remarks</Label>
              <Textarea 
                value={manualInvoiceDescription} 
                onChange={e => setManualInvoiceDescription(e.target.value)} 
                placeholder="Remarks, invoice details, PO numbers, reference keys, or custom item line names..." 
                className="h-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setManualInvoiceOpen(false)}
              disabled={savingManualInvoice}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateManualInvoice}
              disabled={savingManualInvoice || !manualInvoiceUserId || !manualInvoiceAmount}
            >
              {savingManualInvoice ? 'Generating...' : 'Save & Issue Invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
