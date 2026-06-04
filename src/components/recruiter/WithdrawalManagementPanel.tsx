import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  CheckCircle, XCircle, Clock, DollarSign, Download,
  RefreshCw, Eye, Building2, User, Search,
  ChevronRight, Activity, AlertCircle, Loader2,
  Banknote, Shield,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────

interface WithdrawalRequest {
  id: string;
  tester_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  id_proof_url: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  // joined
  tester_email?: string;
  tester_name?: string;
}

type FilterTab = 'all' | 'pending' | 'approved' | 'paid' | 'rejected';

// ── Helpers ────────────────────────────────────────────────

function maskAccount(num: string): string {
  if (!num || num.length <= 4) return num;
  return '•'.repeat(num.length - 4) + num.slice(-4);
}

function StatusPill({ status }: { status: WithdrawalRequest['status'] }) {
  const map = {
    pending:  { icon: Clock,       label: 'Pending',  cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    approved: { icon: CheckCircle, label: 'Approved', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    rejected: { icon: XCircle,     label: 'Rejected', cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
    paid:     { icon: CheckCircle, label: 'Paid',     cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  }[status];
  const Icon = map.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${map.cls}`}>
      <Icon className="h-3 w-3" />{map.label}
    </span>
  );
}

function downloadCSV(rows: WithdrawalRequest[]) {
  const headers = ['ID', 'Tester Email', 'Tester Name', 'Amount', 'Bank', 'Account (masked)', 'IFSC', 'Status', 'Requested On', 'Paid On', 'Admin Note'];
  const data = rows.map(r => [
    r.id.slice(0, 8).toUpperCase(),
    r.tester_email || '',
    r.tester_name || r.account_holder_name,
    `$${Number(r.amount).toFixed(2)}`,
    r.bank_name,
    maskAccount(r.account_number),
    r.ifsc_code,
    r.status,
    new Date(r.created_at).toLocaleDateString(),
    r.paid_at ? new Date(r.paid_at).toLocaleDateString() : '',
    r.admin_note || '',
  ]);
  const csv = [headers, ...data].map(row => row.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `withdrawals_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ── Main Component ─────────────────────────────────────────

export default function WithdrawalManagementPanel() {
  const { toast } = useToast();

  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Reject dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<WithdrawalRequest | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  // Detail viewer
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<WithdrawalRequest | null>(null);

  // ── Fetch ──────────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich with tester profile info
      const enriched = await Promise.all((data || []).map(async (req: WithdrawalRequest) => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', req.tester_id)
            .maybeSingle();
          return {
            ...req,
            tester_name: (profile as any)?.full_name || null,
            tester_email: (profile as any)?.email || null,
          };
        } catch {
          return req;
        }
      }));

      setRequests(enriched);
    } catch (err) {
      console.error('Fetch withdrawal requests error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // ── Actions ────────────────────────────────────────────

  const updateStatus = async (
    req: WithdrawalRequest,
    newStatus: WithdrawalRequest['status'],
    adminNote?: string,
  ) => {
    setProcessingId(req.id);
    try {
      const patch: Record<string, any> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (adminNote !== undefined) patch.admin_note = adminNote;
      if (newStatus === 'paid') patch.paid_at = new Date().toISOString();

      const { error } = await (supabase as any)
        .from('withdrawal_requests')
        .update(patch)
        .eq('id', req.id);

      if (error) throw error;

      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, ...patch } : r));

      // Send status update email to tester
      try {
        const statusMessages: Record<string, { subject: string; emoji: string; body: string }> = {
          approved: {
            subject: '✅ Withdrawal Approved — UserNinjas',
            emoji: '✅',
            body: `Your withdrawal of <strong style="color:#34d399;">$${Number(req.amount).toFixed(2)}</strong> has been <strong>approved</strong> and will be processed to your bank account within 1–2 business days.`,
          },
          rejected: {
            subject: '❌ Withdrawal Rejected — UserNinjas',
            emoji: '❌',
            body: `Unfortunately, your withdrawal request of <strong>$${Number(req.amount).toFixed(2)}</strong> has been <strong>rejected</strong>.${adminNote ? `<br/><br/><strong>Reason:</strong> ${adminNote}` : ''}<br/><br/>Please contact support if you have questions.`,
          },
          paid: {
            subject: '💸 Withdrawal Paid — UserNinjas',
            emoji: '💸',
            body: `Your withdrawal of <strong style="color:#34d399;">$${Number(req.amount).toFixed(2)}</strong> has been <strong>paid</strong> to your bank account (${maskAccount(req.account_number)}). Please allow 1–2 business days for the funds to reflect.`,
          },
        };

        const msg = statusMessages[newStatus];
        if (msg && req.tester_email) {
          await supabase.functions.invoke('send-email', {
            body: {
              to: req.tester_email,
              subject: msg.subject,
              html: `
                <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0f172a;border-radius:16px;overflow:hidden;">
                  <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center;">
                    <div style="font-size:40px;margin-bottom:12px;">${msg.emoji}</div>
                    <h1 style="color:#fff;margin:0;font-size:20px;font-weight:800;">Withdrawal ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</h1>
                  </div>
                  <div style="padding:28px 32px;color:#e2e8f0;">
                    <p style="font-size:14px;line-height:1.7;">${msg.body}</p>
                  </div>
                  <div style="padding:16px 32px;background:rgba(255,255,255,0.02);text-align:center;font-size:12px;color:#475569;">
                    © ${new Date().getFullYear()} UserNinjas · support@userninjas.com
                  </div>
                </div>`,
            },
          });
        }
      } catch { /* non-blocking */ }

      toast({
        title: `Request ${newStatus}`,
        description: `Withdrawal ${newStatus} and notification sent to tester.`,
      });

      if (rejectDialogOpen) { setRejectDialogOpen(false); setRejectNote(''); setRejectTarget(null); }
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (req: WithdrawalRequest) => {
    setRejectTarget(req);
    setRejectNote('');
    setRejectDialogOpen(true);
  };

  // ── Filtered + Searched ────────────────────────────────
  const filtered = requests.filter(r => {
    const matchTab = filterTab === 'all' || r.status === filterTab;
    const q = search.toLowerCase();
    const matchSearch = !q
      || (r.tester_email || '').toLowerCase().includes(q)
      || (r.tester_name || '').toLowerCase().includes(q)
      || r.bank_name.toLowerCase().includes(q)
      || r.account_holder_name.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  // ── Stats ──────────────────────────────────────────────
  const stats = {
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    paid:     requests.filter(r => r.status === 'paid').reduce((s, r) => s + Number(r.amount), 0),
    total:    requests.length,
  };

  const TABS: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'all',      label: 'All',      count: requests.length },
    { key: 'pending',  label: 'Pending',  count: requests.filter(r => r.status === 'pending').length },
    { key: 'approved', label: 'Approved', count: requests.filter(r => r.status === 'approved').length },
    { key: 'paid',     label: 'Paid',     count: requests.filter(r => r.status === 'paid').length },
    { key: 'rejected', label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length },
  ];

  // ── Render ────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: stats.total,              icon: Activity,    color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/15' },
          { label: 'Pending',        value: stats.pending,            icon: Clock,       color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/15' },
          { label: 'Approved',       value: stats.approved,           icon: CheckCircle, color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/15' },
          { label: 'Total Paid Out', value: `$${stats.paid.toFixed(2)}`, icon: Banknote, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/15' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`rounded-2xl border ${stat.border} ${stat.bg} p-5 space-y-2.5`}>
              <div className={`w-8 h-8 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</p>
                <p className={`text-xl font-black mt-0.5 ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-white/8 bg-white/3 flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setFilterTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${filterTab === t.key ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filterTab === t.key ? 'bg-violet-500/30 text-violet-300' : 'bg-white/8 text-slate-500'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9 h-9 text-sm rounded-xl bg-white/4 border-white/10 text-white placeholder:text-slate-600" />
          </div>
          <button onClick={fetchRequests}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white border border-white/8 hover:border-white/15 bg-white/3 hover:bg-white/6 transition-all">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => downloadCSV(filtered)} disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white border border-white/8 hover:border-white/15 bg-white/3 hover:bg-white/6 transition-all disabled:opacity-40">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-white/6"
             style={{ background: 'rgba(255,255,255,0.03)' }}>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tester / Bank</span>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount</span>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</span>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</span>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-white/4 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-4">
              <DollarSign className="h-7 w-7 text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-white">No withdrawal requests</p>
            <p className="text-xs text-slate-500 mt-1">
              {filterTab !== 'all' ? `No ${filterTab} requests found` : 'No withdrawal requests yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/4">
            {filtered.map(req => (
              <div key={req.id} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center px-6 py-4 hover:bg-white/2 transition-colors">
                {/* Tester / Bank info */}
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/12 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <User className="h-3.5 w-3.5 text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {req.tester_name || req.account_holder_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{req.tester_email || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-9">
                    <Building2 className="h-3 w-3 text-slate-600 shrink-0" />
                    <span className="text-xs text-slate-500 truncate">{req.bank_name}</span>
                    <span className="text-[10px] font-mono text-slate-600 bg-white/4 px-1.5 py-0.5 rounded">
                      {maskAccount(req.account_number)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 ml-9">
                    {new Date(req.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {req.paid_at && ` · Paid ${new Date(req.paid_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}`}
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <p className="text-base font-black text-white">${Number(req.amount).toFixed(2)}</p>
                </div>

                {/* Status */}
                <div><StatusPill status={req.status} /></div>

                {/* Actions */}
                <div className="flex items-center gap-2 justify-end flex-wrap">
                  {/* View details */}
                  <button onClick={() => { setDetailItem(req); setDetailOpen(true); }}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/8 transition-all"
                    title="View details">
                    <Eye className="h-3.5 w-3.5" />
                  </button>

                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(req, 'approved')}
                        disabled={processingId === req.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50">
                        {processingId === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectDialog(req)}
                        disabled={processingId === req.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50">
                        <XCircle className="h-3 w-3" /> Reject
                      </button>
                    </>
                  )}

                  {req.status === 'approved' && (
                    <button
                      onClick={() => updateStatus(req, 'paid')}
                      disabled={processingId === req.id}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all disabled:opacity-50">
                      {processingId === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <DollarSign className="h-3 w-3" />}
                      Mark Paid
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Reject Dialog ── */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl border border-white/8 p-0 overflow-hidden"
                       style={{ background: '#0F172A' }}>
          <DialogHeader className="px-6 pt-6 pb-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/12 border border-red-500/20 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white">Reject Withdrawal</DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5">
                  Optionally provide a reason for the tester.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="px-6 py-4 space-y-3">
            {rejectTarget && (
              <div className="p-3 rounded-xl bg-white/3 border border-white/6 text-sm">
                <span className="text-slate-400">Amount:</span>{' '}
                <span className="text-white font-bold">${Number(rejectTarget.amount).toFixed(2)}</span>
                {' · '}
                <span className="text-slate-400">Tester:</span>{' '}
                <span className="text-white">{rejectTarget.tester_email || rejectTarget.account_holder_name}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Rejection Reason <span className="text-slate-600 normal-case font-normal">(optional)</span>
              </Label>
              <Input value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                placeholder="e.g. Incomplete bank details, invalid IFSC..."
                className="h-10 rounded-xl bg-white/4 border-white/10 text-white placeholder:text-slate-600" />
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 flex gap-2">
            <Button variant="ghost" onClick={() => setRejectDialogOpen(false)}
              className="flex-1 h-10 rounded-xl text-slate-400 hover:text-white border border-white/8">
              Cancel
            </Button>
            <Button onClick={() => rejectTarget && updateStatus(rejectTarget, 'rejected', rejectNote)}
              disabled={processingId === rejectTarget?.id}
              className="flex-1 h-10 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 font-semibold">
              {processingId === rejectTarget?.id
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <><XCircle className="h-4 w-4 mr-1.5" />Reject Request</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Detail Dialog ── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl border border-white/8 p-0 overflow-hidden"
                       style={{ background: '#0F172A' }}>
          <DialogHeader className="px-7 pt-7 pb-0">
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="h-5 w-5 text-violet-400" /> Withdrawal Details
            </DialogTitle>
          </DialogHeader>
          {detailItem && (
            <div className="px-7 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Request ID', detailItem.id.slice(0, 8).toUpperCase()],
                  ['Amount', `$${Number(detailItem.amount).toFixed(2)}`],
                  ['Status', ''],
                  ['Submitted', new Date(detailItem.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })],
                  ['Account Holder', detailItem.account_holder_name],
                  ['Bank', detailItem.bank_name],
                  ['Account No.', maskAccount(detailItem.account_number)],
                  ['IFSC Code', detailItem.ifsc_code],
                ].map(([label, value]) => (
                  <div key={label} className="space-y-0.5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{label}</p>
                    {label === 'Status'
                      ? <StatusPill status={detailItem.status} />
                      : <p className={`text-sm font-medium text-white ${label === 'IFSC Code' || label === 'Account No.' ? 'font-mono' : ''}`}>{value}</p>
                    }
                  </div>
                ))}
              </div>

              {detailItem.tester_email && (
                <div className="p-3 rounded-xl bg-white/3 border border-white/6 space-y-0.5">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Tester</p>
                  <p className="text-sm text-white">{detailItem.tester_name || '—'}</p>
                  <p className="text-xs text-slate-400">{detailItem.tester_email}</p>
                </div>
              )}

              {detailItem.id_proof_url && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                  <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-emerald-300">ID Proof Uploaded</p>
                  </div>
                  <a href={detailItem.id_proof_url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors shrink-0">
                    View <ChevronRight className="h-3 w-3" />
                  </a>
                </div>
              )}

              {detailItem.admin_note && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-white/3 border border-white/6">
                  <AlertCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Admin Note</p>
                    <p className="text-sm text-slate-300">{detailItem.admin_note}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="px-7 pb-7">
            <Button onClick={() => setDetailOpen(false)}
              className="w-full h-10 rounded-xl bg-white/6 hover:bg-white/10 text-slate-300 text-sm font-medium">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
