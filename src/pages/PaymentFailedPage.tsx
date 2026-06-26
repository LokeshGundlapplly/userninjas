import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronRight, RefreshCw, MessageSquare } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';

export default function PaymentFailedPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const reason = searchParams.get('reason') || 'Transaction was declined by authorization gateway.';

  return (
    <>
      <Background3D />
      <Navbar />
      <main className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center">
        <PageTransition>
          <div className="container mx-auto max-w-md text-center">
            {/* Animating Alert Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-destructive/10 border border-destructive/30 text-destructive rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-destructive/10">
                <AlertCircle className="w-10 h-10" />
              </div>
            </div>

            <h1 className="font-display text-3xl font-extrabold text-foreground mb-3">
              Payment Failed ⚠️
            </h1>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">
              Unfortunately, your payment transaction could not be completed. No funds were charged.
            </p>

            {/* Error Message Card */}
            <div className="bg-card border border-destructive/20 rounded-2xl p-5 text-left shadow-lg mb-8">
              <span className="font-bold text-xs uppercase tracking-wider text-destructive block mb-2">
                Gateway Failure Reason
              </span>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {reason}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate('/pricing')}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl shadow-lg shadow-primary/10 gap-2 font-bold"
              >
                <RefreshCw className="w-4 h-4" /> Try checkout again <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => navigate('/contact')}
                variant="outline"
                className="w-full h-11 rounded-xl gap-2 font-bold"
              >
                <MessageSquare className="w-4 h-4" /> Contact support team
              </Button>
            </div>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </>
  );
}
