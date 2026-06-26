import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ShieldAlert, Calendar, RefreshCw, Zap, Crown, Ticket } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { paymentService } from '@/services/payment.service';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionManagementPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, subscription, loading: authLoading, refreshProfile } = useAuth();
  
  const [subData, setSubData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth?redirect=/recruiter/subscription');
      return;
    }
    loadSubscription();
  }, [user, authLoading, navigate]);

  const loadSubscription = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getSubscription();
      setSubData(data);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: 'Could not fetch active subscription status.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAutoRenew = async () => {
    if (cancelling || !subData) return;
    setCancelling(true);
    
    // Toggle current cancel_at_period_end state
    const targetState = !subData.cancel_at_period_end;
    
    try {
      await paymentService.cancelSubscription(targetState);
      toast({
        title: targetState ? 'Auto-Renewal Cancelled' : 'Auto-Renewal Reactivated',
        description: targetState 
          ? 'Your plan will remain active until the end of your current cycle.'
          : 'Your subscription will now auto-renew normally.',
      });
      await loadSubscription();
      await refreshProfile();
    } catch (err: any) {
      toast({ title: 'Operation Failed', description: err.message || 'Could not change renewal status.', variant: 'destructive' });
    } finally {
      setCancelling(false);
    }
  };

  const activePlan = subData?.plan_name || profile?.plan_type || 'free';
  
  const PLAN_STYLES: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    free: { label: 'Free Trial Tier', icon: Ticket, color: 'text-slate-400', bg: 'bg-slate-500/10' },
    per_test: { label: 'Pay-Per-Test Plan', icon: Ticket, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    monthly: { label: 'Standard Monthly Tier', icon: Zap, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    yearly: { label: 'Enterprise Yearly Tier', icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  };

  const currentStyle = PLAN_STYLES[activePlan] || PLAN_STYLES.free;
  const PlanIcon = currentStyle.icon;

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
          <div className="container mx-auto max-w-2xl">
            {/* Navigation Header */}
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Back to dashboard
            </button>

            <div className="bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden mb-6">
              {/* Header Banner */}
              <div className="p-8 border-b border-border/60 bg-secondary/15 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl ${currentStyle.bg} flex items-center justify-center shadow`}>
                    <PlanIcon className={`w-7 h-7 ${currentStyle.color}`} />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-extrabold text-foreground">{currentStyle.label}</h1>
                    <p className="text-xs text-muted-foreground mt-1">Manage billing settings & options</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/pricing')}
                  className="rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/95"
                >
                  Change Plan
                </Button>
              </div>

              {/* Status details */}
              <div className="p-8 space-y-6">
                {activePlan === 'free' ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      You are currently on our <strong>Free Trial Plan</strong>. This tier limits you to publishing a maximum of 2 user tests. Upgrade to Professional Standard to unlock unlimited studies, custom screener questions, and automated AI interview analytics.
                    </p>
                  </div>
                ) : subData ? (
                  <div className="space-y-6">
                    {/* Expiry Calendar */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-border bg-secondary/10 flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase block">Start Date</span>
                          <span className="text-sm font-semibold text-foreground">
                            {new Date(subData.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-border bg-secondary/10 flex items-start gap-3">
                        <RefreshCw className="w-5 h-5 text-primary shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase block">Expiry Date</span>
                          <span className="text-sm font-semibold text-foreground">
                            {new Date(subData.expiry_date || subData.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Auto Renewal Warning */}
                    <div className="p-5 rounded-xl border border-border/80 bg-card space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-sm text-foreground">Plan Auto-Renewal</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {subData.cancel_at_period_end 
                              ? 'Your subscription is set to expire. Auto-renewal is off.' 
                              : 'Your subscription will automatically charge and renew.'}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          subData.cancel_at_period_end 
                            ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        }`}>
                          {subData.cancel_at_period_end ? 'Deactivated' : 'Active'}
                        </span>
                      </div>

                      <hr className="border-border/50 my-3" />

                      <div className="flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5 text-warning shrink-0" />
                        <p className="text-xs text-muted-foreground leading-normal">
                          If you cancel auto-renewal, your recruiter dashboard features will stay unlocked until the expiry date, after which your limits revert to standard Free Trial.
                        </p>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button
                          onClick={handleCancelAutoRenew}
                          disabled={cancelling}
                          variant={subData.cancel_at_period_end ? 'outline' : 'destructive'}
                          className="rounded-xl text-xs font-semibold h-9"
                        >
                          {cancelling ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                          ) : null}
                          {subData.cancel_at_period_end ? 'Reactivate Auto-Renewal' : 'Turn Off Auto-Renewal'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">Error loading subscription profile.</p>
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
