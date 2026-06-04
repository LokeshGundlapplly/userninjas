import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Building2, CreditCard, Hash, User, Upload, CheckCircle,
  Eye, EyeOff, ShieldCheck, AlertCircle, Loader2,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────

export interface BankDetails {
  id: string;
  tester_id: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  id_proof_url: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

interface BankDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  existing: BankDetails | null;
  onSaved: (details: BankDetails) => void;
}

// ── Validation ─────────────────────────────────────────────

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

function maskAccount(num: string): string {
  if (num.length <= 4) return num;
  return '•'.repeat(num.length - 4) + num.slice(-4);
}

// ── Component ──────────────────────────────────────────────

export default function BankDetailsDialog({
  open, onOpenChange, userId, existing, onSaved,
}: BankDetailsDialogProps) {
  const { toast } = useToast();

  const [form, setForm] = useState({
    account_holder_name: existing?.account_holder_name || '',
    bank_name: existing?.bank_name || '',
    account_number: existing?.account_number || '',
    confirm_account_number: existing?.account_number || '',
    ifsc_code: existing?.ifsc_code || '',
  });
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [idProofPreview, setIdProofPreview] = useState<string | null>(existing?.id_proof_url || null);
  const [showAccNum, setShowAccNum] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  // ── Reset on open ─────────────────────────────────────────
  const handleOpenChange = (val: boolean) => {
    if (val && existing) {
      setForm({
        account_holder_name: existing.account_holder_name,
        bank_name: existing.bank_name,
        account_number: existing.account_number,
        confirm_account_number: existing.account_number,
        ifsc_code: existing.ifsc_code,
      });
      setIdProofPreview(existing.id_proof_url || null);
      setIdProofFile(null);
    }
    onOpenChange(val);
  };

  // ── Field change ──────────────────────────────────────────
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  // ── ID Proof upload ────────────────────────────────────────
  const handleIdProofSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum size is 5MB.', variant: 'destructive' });
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      toast({ title: 'Invalid format', description: 'Upload JPG, PNG, WebP or PDF only.', variant: 'destructive' });
      return;
    }
    setIdProofFile(file);
    if (file.type !== 'application/pdf') {
      const reader = new FileReader();
      reader.onload = ev => setIdProofPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setIdProofPreview('pdf');
    }
    if (e.target) e.target.value = '';
  };

  const uploadIdProof = async (): Promise<string | null> => {
    if (!idProofFile) return idProofPreview;
    setUploadingProof(true);
    try {
      const ext = idProofFile.name.split('.').pop();
      const path = `id-proofs/${userId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('profile-attachments').upload(path, idProofFile, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('profile-attachments').getPublicUrl(path);
      return publicUrl;
    } finally {
      setUploadingProof(false);
    }
  };

  // ── Validation ────────────────────────────────────────────
  const errors: Record<string, string> = {};
  if (!form.account_holder_name.trim() || form.account_holder_name.trim().length < 2)
    errors.account_holder_name = 'Full name is required (min 2 characters)';
  if (!form.bank_name.trim() || form.bank_name.trim().length < 2)
    errors.bank_name = 'Bank name is required';
  if (!form.account_number.match(/^\d{9,18}$/))
    errors.account_number = 'Account number must be 9–18 digits';
  if (form.account_number !== form.confirm_account_number)
    errors.confirm_account_number = 'Account numbers do not match';
  if (!IFSC_REGEX.test(form.ifsc_code.toUpperCase()))
    errors.ifsc_code = 'Invalid IFSC (format: ABCD0123456)';

  const isValid = Object.keys(errors).length === 0;

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      const idProofUrl = await uploadIdProof();

      const payload = {
        tester_id: userId,
        bank_name: form.bank_name.trim(),
        account_number: form.account_number.trim(),
        ifsc_code: form.ifsc_code.toUpperCase().trim(),
        account_holder_name: form.account_holder_name.trim(),
        id_proof_url: idProofUrl,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase as any)
        .from('tester_bank_details')
        .upsert({ ...payload, id: existing?.id }, { onConflict: 'tester_id' })
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Bank details saved!', description: 'Your bank details have been saved securely.' });
      onSaved(data as BankDetails);
      onOpenChange(false);
    } catch (err: any) {
      console.error('Save bank details error:', err);
      toast({ title: 'Save failed', description: err.message || 'Could not save bank details.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden rounded-3xl border-0"
                     style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Header */}
        <div className="relative overflow-hidden px-7 pt-7 pb-5"
             style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(79,70,229,0.08) 100%)' }}>
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl bg-violet-500/15 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white leading-tight">
                {existing ? 'Update Bank Details' : 'Add Bank Details'}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-400 mt-0.5">
                Required for withdrawal. Stored securely and encrypted.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-7 py-5 space-y-4 max-h-[60vh] overflow-y-auto">

          {/* Account Holder Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Account Holder Name *
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input value={form.account_holder_name} onChange={set('account_holder_name')}
                placeholder="Full name as per bank records"
                className="pl-10 h-11 rounded-xl bg-white/4 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50" />
            </div>
            {errors.account_holder_name && (
              <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.account_holder_name}</p>
            )}
          </div>

          {/* Bank Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bank Name *</Label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input value={form.bank_name} onChange={set('bank_name')}
                placeholder="e.g. State Bank of India"
                className="pl-10 h-11 rounded-xl bg-white/4 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50" />
            </div>
            {errors.bank_name && (
              <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.bank_name}</p>
            )}
          </div>

          {/* Account Number */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Number *</Label>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input value={form.account_number} onChange={set('account_number')}
                type={showAccNum ? 'text' : 'password'}
                placeholder="9–18 digit account number"
                maxLength={18}
                className="pl-10 pr-12 h-11 rounded-xl bg-white/4 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50" />
              <button type="button" onClick={() => setShowAccNum(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showAccNum ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.account_number && (
              <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.account_number}</p>
            )}
          </div>

          {/* Confirm Account Number */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm Account Number *</Label>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input value={form.confirm_account_number} onChange={set('confirm_account_number')}
                type="text"
                placeholder="Re-enter account number"
                maxLength={18}
                className="pl-10 h-11 rounded-xl bg-white/4 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50" />
              {form.confirm_account_number && form.account_number === form.confirm_account_number && (
                <CheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
              )}
            </div>
            {errors.confirm_account_number && (
              <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.confirm_account_number}</p>
            )}
          </div>

          {/* IFSC Code */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">IFSC Code *</Label>
            <div className="relative">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input value={form.ifsc_code} onChange={e => setForm(p => ({ ...p, ifsc_code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SBIN0001234"
                maxLength={11}
                className="pl-10 h-11 rounded-xl bg-white/4 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50 font-mono tracking-widest" />
              {form.ifsc_code && IFSC_REGEX.test(form.ifsc_code) && (
                <CheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
              )}
            </div>
            {errors.ifsc_code && (
              <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.ifsc_code}</p>
            )}
            <p className="text-xs text-slate-600">Format: 4 letters + 0 + 6 alphanumeric (e.g. SBIN0001234)</p>
          </div>

          {/* ID Proof Upload */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ID Proof <span className="text-slate-600 normal-case font-normal">(Aadhaar / PAN / Passport — max 5MB)</span>
            </Label>
            <label htmlFor="id-proof-upload"
              className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-white/10 hover:border-violet-500/40 hover:bg-violet-500/5 cursor-pointer transition-all group">
              {idProofPreview && idProofPreview !== 'pdf' ? (
                <img src={idProofPreview} alt="ID Proof" className="max-h-24 rounded-xl object-contain" />
              ) : idProofPreview === 'pdf' ? (
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck className="h-8 w-8 text-violet-400" />
                  <span className="text-sm font-medium">PDF uploaded</span>
                </div>
              ) : (
                <>
                  <Upload className="h-7 w-7 text-slate-500 group-hover:text-violet-400 transition-colors" />
                  <p className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors">Click to upload ID proof</p>
                  <p className="text-xs text-slate-600">JPG, PNG, WebP or PDF</p>
                </>
              )}
              <input id="id-proof-upload" type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden" onChange={handleIdProofSelect} />
            </label>
            {idProofFile && (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5" /> {idProofFile.name} selected
              </p>
            )}
          </div>

          {/* Security note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/3 border border-white/6">
            <ShieldCheck className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Your bank details are stored securely and used only for processing withdrawals. Account numbers are masked in all displays.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 pb-7 pt-2 flex flex-col gap-2">
          <Button onClick={handleSave} disabled={!isValid || saving || uploadingProof}
            className="w-full h-12 text-base font-bold rounded-xl gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20 disabled:opacity-50">
            {saving || uploadingProof
              ? <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</>
              : <><CheckCircle className="h-5 w-5" /> Save Bank Details</>}
          </Button>
          <button onClick={() => onOpenChange(false)}
            className="w-full h-10 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all">
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
