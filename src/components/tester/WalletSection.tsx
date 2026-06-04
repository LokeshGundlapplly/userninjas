import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Wallet, TrendingUp, Clock, CheckCircle, XCircle,
  ArrowDownCircle, Building2, Edit2, Plus, RefreshCw,
  AlertCircle, ChevronRight, Activity, DollarSign, Shield,
} from 'lucide-react';
import BankDetailsDialog, { type BankDetails } from './BankDetailsDialog';
import WithdrawalDialog, { type WithdrawalRequest } from './WithdrawalDialog';

// ── Types ──────────────────────────────────────────────────

interface WalletSectionProps {
  userId: string;
  userEmail: string;
  totalEarnings: number; // from earnings table (paid status)
}

// ── Helpers ────────────────────────────────────────────────

function maskAccount(num: string): string {
  if (num.length <= 4) return '•'.repeat(4) + num.slice(-4);
  return '•'.repeat(num.length - 4) + num.slice(-4);
}

function StatusPill({ status }: { status: WithdrawalRequest['status'] }) {
  const map = {
    pending:  { icon: Clock,        label: 'Pending',  cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    approved: { icon: CheckCircle,  label: 'Approved', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    rejected: { icon: XCircle,      label: 'Rejected', cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
    paid:     { icon: CheckCircle,  label: 'Paid',     cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  }[status];
  const Icon = map.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${map.cls}`}>
      <Icon className="h-3 w-3" />{map.label}
    </span>
  );
}

const MIN_WITHDRAWAL = 20;

// ── Main Component ─────────────────────────────────────────

export default function WalletSection({ userId, userEmail, totalEarnings }: WalletSectionProps) {
  const { toast } = useToast();

  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  // ── Fetch data ─────────────────────────────────────────
  const fetchWalletData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch bank details
      const { data: bankData } = await (supabase as any)
        .from('tester_bank_details')
        .select('*')
        .eq('tester_id', userId)
        .maybeSingle();
      setBankDetails(bankData || null);

      // Fetch withdrawal requests
      const { data: reqData } = await (supabase as any)
        .from('withdrawal_requests')
        .select('*')
        .eq('tester_id', userId)
        .order('created_at', { ascending: false });
      setWithdrawalRequests((reqData as WithdrawalRequest[]) || []);
    } catch (err) {
      console.error('WalletSection fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchWalletData(); }, [fetchWalletData]);

  // ── Computed ──────────────────────────────────────────
  const totalWithdrawn = withdrawalRequests
    .filter(r => ['paid', 'approved', 'pending'].includes(r.status))
    .reduce((s, r) => s + Number(r.amount), 0);
  const availableBalance = Math.max(0, totalEarnings - totalWithdrawn);
  const paidOut = withdrawalRequests
    .filter(r => r.status === 'paid')
    .reduce((s, r) => s + Number(r.amount), 0);
  const pendingWithdrawals = withdrawalRequests
    .filter(r => r.status === 'pending')
    .reduce((s, r) => s + Number(r.amount), 0);
  const progressToThreshold = Math.min(100, (availableBalance / MIN_WITHDRAWAL) * 100);
  const canWithdraw = availableBalance >= MIN_WITHDRAWAL;

  // ── Render ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-2xl bg-white/4 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Hero Balance Card ── */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 p-8"
           style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.06) 100%)' }}>
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl bg-emerald-500/15 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-3xl bg-green-500/10 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest text-emerald-500/70 uppercase">Available Balance</p>
                <p className="text-5xl font-black text-emerald-400 leading-none mt-1">
                  ${availableBalance.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Progress to threshold */}
            {!canWithdraw && (
              <div className="space-y-2 max-w-sm">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" /> Progress to withdrawal threshold
                  </span>
                  <span className="text-white font-bold">${availableBalance.toFixed(2)} / ${MIN_WITHDRAWAL}</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/6 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-700"
                       style={{ width: `${progressToThreshold}%` }} />
                </div>
                <p className="text-xs text-slate-500">
                  Earn ${(MIN_WITHDRAWAL - availableBalance).toFixed(2)} more to unlock withdrawal
                </p>
              </div>
            )}
          </div>

          {/* Withdraw CTA */}
          <div className="shrink-0 space-y-2">
            <Button
              onClick={() => setWithdrawDialogOpen(true)}
              disabled={!canWithdraw}
              className={`h-12 px-8 text-sm font-bold rounded-2xl gap-2 transition-all
                ${canWithdraw
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:scale-[1.02]'
                  : 'bg-white/6 text-slate-500 border border-white/10 cursor-not-allowed'}`}>
              <ArrowDownCircle className="h-4 w-4" />
              {canWithdraw ? 'Withdraw Funds' : `Need $${MIN_WITHDRAWAL} min`}
            </Button>
            {pendingWithdrawals > 0 && (
              <p className="text-xs text-yellow-400 text-right flex items-center gap-1 justify-end">
                <Clock className="h-3 w-3" /> ${pendingWithdrawals.toFixed(2)} pending
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Earned',    value: `$${totalEarnings.toFixed(2)}`,   icon: DollarSign,       color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/15' },
          { label: 'Total Paid Out',  value: `$${paidOut.toFixed(2)}`,         icon: CheckCircle,      color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/15' },
          { label: 'Pending',         value: `$${pendingWithdrawals.toFixed(2)}`, icon: Clock,        color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/15' },
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

      {/* ── Bank Details Card ── */}
      <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Building2 className="h-4 w-4 text-violet-400" /> Bank Account
          </h3>
          <Button size="sm" variant="ghost"
            onClick={() => setBankDialogOpen(true)}
            className="h-8 gap-1.5 text-xs text-violet-400 hover:text-white hover:bg-white/8 rounded-lg">
            {bankDetails ? <><Edit2 className="h-3 w-3" /> Edit</> : <><Plus className="h-3 w-3" /> Add Bank Details</>}
          </Button>
        </div>

        {bankDetails ? (
          <div className="px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/12 border border-violet-500/20 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-violet-400" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-base font-bold text-white">{bankDetails.account_holder_name}</p>
                  {bankDetails.verified ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="h-2.5 w-2.5" /> Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> Pending Verification
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400">{bankDetails.bank_name}</p>
                <div className="flex items-center gap-3 flex-wrap mt-2">
                  <span className="text-xs font-mono text-slate-500 bg-white/4 px-2 py-1 rounded-lg tracking-wider">
                    {maskAccount(bankDetails.account_number)}
                  </span>
                  <span className="text-xs font-mono text-slate-500 bg-white/4 px-2 py-1 rounded-lg tracking-wider">
                    IFSC: {bankDetails.ifsc_code}
                  </span>
                </div>
              </div>
            </div>
            {bankDetails.id_proof_url && (
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <Shield className="h-3.5 w-3.5 text-emerald-500/60" />
                <span>ID proof uploaded</span>
                <a href={bankDetails.id_proof_url} target="_blank" rel="noreferrer"
                   className="text-violet-400 hover:text-violet-300 flex items-center gap-0.5 transition-colors">
                  View <ChevronRight className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-4">
              <Building2 className="h-7 w-7 text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-white">No bank account added</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Add your bank details to enable withdrawals. Your information is stored securely.
            </p>
            <Button size="sm" onClick={() => setBankDialogOpen(true)}
              className="mt-5 gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-violet-500/15">
              <Plus className="h-3.5 w-3.5" /> Add Bank Details
            </Button>
          </div>
        )}
      </div>

      {/* ── Withdrawal History ── */}
      <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-violet-400" /> Withdrawal History
          </h3>
          <button onClick={fetchWalletData}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/6">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        {withdrawalRequests.length === 0 ? (
          <div className="py-14 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-4">
              <ArrowDownCircle className="h-7 w-7 text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-white">No withdrawals yet</p>
            <p className="text-xs text-slate-500 mt-1">Your withdrawal history will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/4">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-3"
                 style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Request Details</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Amount</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</span>
            </div>

            {withdrawalRequests.map(req => (
              <div key={req.id} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-6 py-4 hover:bg-white/2 transition-colors">
                <div>
                  <p className="text-sm font-medium text-white">
                    Withdrawal to {req.bank_name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span className="font-mono">{maskAccount(req.account_number)}</span>
                    <span>·</span>
                    <span>{new Date(req.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </p>
                  {req.admin_note && req.status === 'rejected' && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {req.admin_note}
                    </p>
                  )}
                  {req.paid_at && (
                    <p className="text-xs text-emerald-400/70 mt-0.5">
                      Paid {new Date(req.paid_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-white">${Number(req.amount).toFixed(2)}</span>
                </div>
                <div><StatusPill status={req.status} /></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Dialogs ── */}
      <BankDetailsDialog
        open={bankDialogOpen}
        onOpenChange={setBankDialogOpen}
        userId={userId}
        existing={bankDetails}
        onSaved={(details) => {
          setBankDetails(details);
          toast({ title: 'Bank details saved', description: 'You can now request withdrawals.' });
        }}
      />

      <WithdrawalDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        userId={userId}
        userEmail={userEmail}
        availableBalance={availableBalance}
        bankDetails={bankDetails}
        onSuccess={(req) => {
          setWithdrawalRequests(prev => [req, ...prev]);
        }}
        onNeedBankDetails={() => setBankDialogOpen(true)}
      />
    </div>
  );
}
