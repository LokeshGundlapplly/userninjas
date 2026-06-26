import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export default function InvoicesPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading: authLoading } = useAuth();
  
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    loadInvoiceData();
  }, [user, authLoading, paymentId, navigate]);

  const loadInvoiceData = async () => {
    if (!paymentId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) throw error;
      setPayment(data);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: 'Could not load invoice data.', variant: 'destructive' });
      navigate('/recruiter/billing');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!payment) return null;

  const date = new Date(payment.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isINR = payment.currency === 'INR' || String(payment.gateway).toLowerCase() === 'razorpay';
  const currencySymbol = isINR ? '₹' : payment.currency === 'USD' ? '$' : payment.currency || '₹';
  const totalAmount = Number(payment.amount);

  let itemDescription = payment.description || (payment.plan_type ? `${payment.plan_type.charAt(0).toUpperCase() + payment.plan_type.slice(1)} Plan` : 'Wallet Credit Top-up');
  let invoiceNumber = `INV-${payment.id.slice(0, 8).toUpperCase()}`;
  let billedToName = profile?.full_name || 'Valued Recruiter';
  let userEmailToDisplay = user?.email || 'N/A';

  // Parse description overrides
  const desc = payment.description || '';
  if (desc && desc.includes('|')) {
    const parts = desc.split('|');
    itemDescription = parts[0].trim();
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].trim();
      if (part.startsWith('Name:')) {
        billedToName = part.substring(5).trim();
      } else if (part.startsWith('Email:')) {
        userEmailToDisplay = part.substring(6).trim();
      } else if (part.startsWith('Request ID:')) {
        invoiceNumber = part.substring(11).trim();
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 print:bg-white print:py-0 print:px-0">
      {/* Control Panel (Hidden in printing) */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Button
          variant="outline"
          onClick={() => navigate('/recruiter/billing')}
          className="gap-2 rounded-xl text-slate-700 bg-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to billing
        </Button>
        <Button
          onClick={handlePrint}
          className="gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold"
        >
          <Printer className="w-4 h-4" /> Print Invoice
        </Button>
      </div>

      {/* Invoice Document Wrapper */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none print:rounded-none">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center p-2 shadow-md">
              <img src="/logo.png" alt="UserNinjas" className="h-full w-full object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none">UserNinjas</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 mt-1 block">Tax Invoice / Receipt</span>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/15 px-4 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider inline-block mb-1.5 uppercase">
              {invoiceNumber}
            </div>
            <p className="text-xs opacity-90">Date: {date}</p>
          </div>
        </div>

        <div className="p-8">
          {/* Addresses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-8 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1.5 mb-3">
                Billed From (Seller)
              </h3>
              <div className="text-sm text-slate-600 space-y-1">
                <strong className="text-slate-900 text-base block font-bold mb-1">UserNinjas Technologies Pvt. Ltd.</strong>
                <p>102, Innovation Hub, Phase 2</p>
                <p>HITEC City, Hyderabad</p>
                <p>Telangana - 500081, India</p>
                <p>Email: workside367@gmail.com</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1.5 mb-3">
                Billed To (Buyer)
              </h3>
              <div className="text-sm text-slate-600 space-y-1">
                <strong className="text-slate-900 text-base block font-bold mb-1">{billedToName}</strong>
                <p>Email: {userEmailToDisplay}</p>
                {profile?.company && profile.company !== 'N/A' && <p>Company: {profile.company}</p>}
                {profile?.location && profile.location !== 'N/A' && <p>Location: {profile.location}</p>}
              </div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b-2 border-slate-200">
                <th className="py-3 px-4">Item &amp; Description</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Tax Rate</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 text-sm">
                <td className="py-4 px-4">
                  <div className="font-bold text-slate-900">{itemDescription}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {payment.plan_type ? 'Premium Subscription' : 'Wallet Credit Purchase'}
                  </div>
                </td>
                <td className="py-4 px-4 text-right">{currencySymbol}{totalAmount.toFixed(2)}</td>
                <td className="py-4 px-4 text-center">1</td>
                <td className="py-4 px-4 text-right">0%</td>
                <td className="py-4 px-4 text-right font-bold text-slate-900">{currencySymbol}{totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals box */}
          <div className="flex justify-end mb-8">
            <div className="w-64 bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-2.5 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{currencySymbol}{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (0% Nil)</span>
                <span>{currencySymbol}0.00</span>
              </div>
              <div className="flex justify-between font-black text-indigo-600 text-lg border-t border-dashed border-slate-200 pt-3">
                <span>Grand Total</span>
                <span>{currencySymbol}{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Status stamp */}
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-sm">
            <span>✔</span>
            <span>PAYMENT {payment.status.toUpperCase()}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-6 text-center text-xs text-slate-400 leading-relaxed">
          <p>This is a computer-generated tax invoice and does not require a physical signature.</p>
          <p className="mt-1">
            Thank you for choosing <a href="https://userninjas.in" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">UserNinjas</a>!
          </p>
        </div>
      </div>
    </div>
  );
}
