import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Wallet, CreditCard, AlertCircle, CheckCircle, ArrowRight,
  Building2, Shield, Loader2, Info,
} from 'lucide-react';
import type { BankDetails } from './BankDetailsDialog';

// ── Types ──────────────────────────────────────────────────

export interface WithdrawalRequest {
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
}

interface WithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  availableBalance: number;
  bankDetails: BankDetails | null;
  onSuccess: (req: WithdrawalRequest) => void;
  onNeedBankDetails: () => void;
}

const MIN_WITHDRAWAL = 20; // $20 USD

function maskAccount(num: string): string {
  if (num.length <= 4) return num;
  return '•'.repeat(num.length - 4) + num.slice(-4);
}

// ── Component ──────────────────────────────────────────────

export default function WithdrawalDialog({
  open, onOpenChange, userId, userEmail,
  availableBalance, bankDetails, onSuccess, onNeedBankDetails,
}: WithdrawalDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const isAmountValid = parsedAmount >= MIN_WITHDRAWAL && parsedAmount <= availableBalance;
  const canSubmit = isAmountValid && !!bankDetails && !submitting;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(val);
  };

  const handleMaxAmount = () => {
    setAmount(availableBalance.toFixed(2));
  };

  const handleSubmit = async () => {
    if (!canSubmit || !bankDetails) return;
    setSubmitting(true);
    try {
      const payload = {
        tester_id: userId,
        amount: parsedAmount,
        status: 'pending',
        bank_name: bankDetails.bank_name,
        account_number: bankDetails.account_number,
        ifsc_code: bankDetails.ifsc_code,
        account_holder_name: bankDetails.account_holder_name,
        id_proof_url: bankDetails.id_proof_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase as any)
        .from('withdrawal_requests')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      // Send confirmation email (non-blocking)
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            to: userEmail,
            subject: '💸 Withdrawal Request Submitted — UserNinjas',
            html: `
              <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0f172a;border-radius:16px;overflow:hidden;">
                <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center;">
                  <div style="font-size:40px;margin-bottom:12px;">💸</div>
                  <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;">Withdrawal Request Submitted</h1>
                  <p style="color:#c4b5fd;margin:8px 0 0;font-size:14px;">We've received your request and are processing it.</p>
                </div>
                <div style="padding:32px;color:#e2e8f0;">
                  <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:20px;margin-bottom:20px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                      <span style="color:#94a3b8;font-size:13px;">Amount Requested</span>
                      <span style="font-size:20px;font-weight:800;color:#34d399;">$${parsedAmount.toFixed(2)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                      <span style="color:#94a3b8;font-size:13px;">Bank</span>
                      <span style="color:#e2e8f0;font-size:13px;">${bankDetails.bank_name}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;">
                      <span style="color:#94a3b8;font-size:13px;">Account</span>
                      <span style="color:#e2e8f0;font-size:13px;font-family:monospace;">${maskAccount(bankDetails.account_number)}</span>
                    </div>
                  </div>
                  <p style="font-size:13px;color:#64748b;line-height:1.7;">
                    Withdrawals are typically processed within <strong style="color:#94a3b8;">2–5 business days</strong>. 
                    You'll receive another email once your withdrawal is approved and paid.
                  </p>
                </div>
                <div style="padding:16px 32px;background:rgba(255,255,255,0.02);text-align:center;font-size:12px;color:#475569;">
                  © ${new Date().getFullYear()} UserNinjas · support@userninjas.com
                </div>
              </div>`,
          },
        });
      } catch { /* email is non-blocking */ }

      toast({
        title: '✅ Withdrawal requested!',
        description: `$${parsedAmount.toFixed(2)} withdrawal is being processed (2–5 business days).`,
      });

      setAmount('');
      onSuccess(data as WithdrawalRequest);
      onOpenChange(false);
    } catch (err: any) {
      console.error('Withdrawal error:', err);
      toast({
        title: 'Request failed',
        description: err.message || 'Could not submit withdrawal request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-0 gap-0 overflow-hidden rounded-3xl border-0"
                     style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Header */}
        <div className="relative overflow-hidden px-7 pt-7 pb-5"
             style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.08) 100%)' }}>
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl bg-emerald-500/15 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
              <Wallet className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white">Request Withdrawal</DialogTitle>
              <DialogDescription className="text-sm text-slate-400 mt-0.5">
                Minimum $20 · Processed in 2–5 business days
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="px-7 py-5 space-y-5">
          {/* Available Balance */}
          <div className="rounded-2xl border border-emerald-500/20 p-4 flex items-center justify-between"
               style={{ background: 'rgba(16,185,129,0.06)' }}>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Available Balance</p>
              <p className="text-3xl font-black text-emerald-400 mt-0.5">${availableBalance.toFixed(2)}</p>
            </div>
            <Wallet className="h-8 w-8 text-emerald-400/30" />
          </div>

          {/* No bank details warning */}
          {!bankDetails && (
            <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5">
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-300">Bank details required</p>
                <p className="text-xs text-slate-400 mt-0.5">Add your bank account before withdrawing.</p>
                <button onClick={() => { onOpenChange(false); onNeedBankDetails(); }}
                  className="mt-2 text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors">
                  Add bank details <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Withdrawal Amount</Label>
              <button onClick={handleMaxAmount}
                className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors">
                Use max (${availableBalance.toFixed(2)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
              <Input value={amount} onChange={handleAmountChange}
                placeholder={`Min $${MIN_WITHDRAWAL}.00`}
                type="text"
                inputMode="decimal"
                className="pl-9 h-12 text-xl font-bold rounded-xl bg-white/4 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50" />
              {parsedAmount > 0 && parsedAmount < MIN_WITHDRAWAL && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Minimum withdrawal is ${MIN_WITHDRAWAL}.00
                </p>
              )}
              {parsedAmount > availableBalance && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Exceeds available balance
                </p>
              )}
              {isAmountValid && (
                <p className="mt-1.5 text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Amount looks good!
                </p>
              )}
            </div>
          </div>

          {/* Bank Details Summary */}
          {bankDetails && (
            <div className="rounded-2xl border border-white/8 p-4 space-y-2.5"
                 style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payment To</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/12 border border-violet-500/20 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{bankDetails.account_holder_name}</p>
                  <p className="text-xs text-slate-400">{bankDetails.bank_name} · {maskAccount(bankDetails.account_number)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-mono text-slate-500 bg-white/4 px-2 py-1 rounded-lg tracking-widest">
                  IFSC: {bankDetails.ifsc_code}
                </span>
                {bankDetails.verified && (
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Processing note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/2 border border-white/6">
            <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Withdrawals are reviewed by our team and processed within <strong className="text-slate-400">2–5 business days</strong>. You'll receive an email confirmation once approved.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 pb-7 pt-2 flex flex-col gap-2">
          <Button onClick={handleSubmit} disabled={!canSubmit}
            className="w-full h-12 text-base font-bold rounded-xl gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all">
            {submitting
              ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting...</>
              : <><CreditCard className="h-5 w-5" /> Submit Withdrawal Request</>}
          </Button>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600">
            <Shield className="h-3 w-3" /> Secured & encrypted
          </div>
          <button onClick={() => onOpenChange(false)}
            className="w-full h-9 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all">
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
