import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Receipt, Download, FileText, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import PageTransition from '@/components/PageTransition';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { paymentService } from '@/services/payment.service';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Payment {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
  status: string;
  plan_type: string | null;
  gateway: string;
  description: string | null;
}

export default function BillingHistoryPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth?redirect=/recruiter/billing');
      return;
    }
    loadPayments();
  }, [user, authLoading, navigate]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getPaymentHistory();
      setPayments(data);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: 'Could not fetch payments logs.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'successful':
      case 'success':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold">Successful</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="font-bold">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-sky-500/10 text-sky-500 border-sky-500/20 font-bold">Refunded</Badge>;
      default:
        return <Badge variant="secondary" className="font-bold">{status}</Badge>;
    }
  };

  const handleInvoiceDownload = (paymentId: string) => {
    window.open(`/recruiter/invoices/${paymentId}`, '_blank');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Background3D />
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-4">
        <PageTransition>
          <div className="container mx-auto max-w-4xl">
            {/* Back Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Back to dashboard
            </button>

            <div className="bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-border/60 bg-secondary/15 flex items-center gap-3">
                <Receipt className="w-5 h-5 text-primary" />
                <div>
                  <h1 className="font-display text-lg font-bold text-foreground">Billing &amp; Payments History</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">View transaction logs and download tax invoices</p>
                </div>
              </div>

              {/* Table */}
              <div className="p-6">
                {payments.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <FileText className="w-10 h-10 text-muted-foreground mx-auto" />
                    <p className="text-sm font-medium text-muted-foreground">No transaction records found</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Transactions will appear here once you purchase custom studies or standard subscription plans.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((p) => (
                          <TableRow key={p.id} className="hover:bg-secondary/20 transition-colors">
                            <TableCell className="font-medium text-xs whitespace-nowrap">
                              {new Date(p.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-sm">
                              {p.description ? p.description.split('|')[0] : (p.plan_type ? `${p.plan_type.toUpperCase()} Plan` : 'Credits Add')}
                            </TableCell>
                            <TableCell className="font-semibold text-foreground text-sm whitespace-nowrap">
                              ₹{p.amount.toLocaleString('en-IN')}
                            </TableCell>
                            <TableCell>{getStatusBadge(p.status)}</TableCell>
                            <TableCell className="text-right">
                              {(p.status === 'successful' || p.status === 'success') && (
                                <button
                                  onClick={() => handleInvoiceDownload(p.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-border bg-card hover:bg-secondary/40 text-foreground transition-all"
                                >
                                  <Download className="w-3.5 h-3.5" /> Invoice <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                </button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </>
  );
}
