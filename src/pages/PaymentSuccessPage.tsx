import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, LayoutDashboard, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const plan = searchParams.get('plan') || 'Premium';
  const orderId = searchParams.get('order_id') || 'N/A';
  const amount = searchParams.get('amount') || '0';

  const planNames: Record<string, string> = {
    per_test: 'Pay-Per-Test Plan',
    monthly: 'Standard Monthly Subscription',
    yearly: 'Enterprise Yearly Subscription',
  };

  const displayName = planNames[plan] || plan;

  return (
    <>
      <Background3D />
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center">
        <PageTransition>
          <div className="container mx-auto max-w-md text-center">
            {/* Animating Check Circle */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            </div>

            <h1 className="font-display text-3xl font-extrabold text-foreground mb-3">
              Payment Successful! 🎉
            </h1>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">
              Your transaction has been securely processed and signature verified. Premium features are now unlocked!
            </p>

            {/* Receipt Summary Card */}
            <div className="bg-card border border-border/80 rounded-2xl p-6 text-left shadow-lg space-y-4 mb-8">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/50">
                Receipt Overview
              </h3>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subscription Tier</span>
                <span className="font-semibold text-foreground">{displayName}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction Amount</span>
                <span className="font-semibold text-primary">₹{Number(amount).toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Subscription ID</span>
                <span className="font-mono text-foreground truncate max-w-[180px]">{orderId}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl shadow-lg shadow-primary/10 gap-2 font-bold"
              >
                <LayoutDashboard className="w-4 h-4" /> Go to Dashboard <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => navigate('/recruiter/create-test')}
                variant="outline"
                className="w-full h-11 rounded-xl gap-2 font-bold"
              >
                <FileText className="w-4 h-4" /> Create new UX study
              </Button>
            </div>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </>
  );
}
