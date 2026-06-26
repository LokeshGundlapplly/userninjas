import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck, CreditCard, ChevronRight, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { paymentService } from '@/services/payment.service';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window { Razorpay: any; }
}

const PLAN_META: Record<string, { name: string; priceINR: number; description: string }> = {
  per_test: {
    name: 'Pay-Per-Test (A La Carte)',
    priceINR: 999,
    description: '1 Custom Research Test limit · Valid 30 days',
  },
  monthly: {
    name: 'Standard (Monthly Subscription)',
    priceINR: 2999,
    description: '5 Active Research Tests limit · Up to 200 invites / month',
  },
  yearly: {
    name: 'Enterprise (Yearly Subscription)',
    priceINR: 30590,
    description: 'Unlimited Research Tests limit · Up to 3,000 invites / year',
  },
};

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, refreshProfile } = useAuth();
  
  const planKey = searchParams.get('plan') as 'per_test' | 'monthly' | 'yearly';
  const planDetails = PLAN_META[planKey || ''];

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const checkoutInitiated = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    if (!planKey || !planDetails) {
      setErrorMessage('No valid subscription plan selected.');
      return;
    }
  }, [user, authLoading, planKey, navigate, planDetails]);

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (loading || !user || !planKey || !planDetails) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please verify your connection.');
      }

      // 2. Call backend to create Razorpay Order
      const orderRes = await paymentService.createOrder(planKey);
      
      const { razorpayOrderId, amount, currency } = orderRes;

      // 3. Initialize checkout script options
      // Retrieve direct Key ID or fallback key
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_Sx5YIPbX0SGPU4';

      const options = {
        key: keyId,
        amount: amount.toString(),
        currency: currency || 'INR',
        name: 'UserNinjas',
        description: `Upgrade to ${planDetails.name}`,
        image: 'https://userninjas.in/logo.png',
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          setLoading(true);
          try {
            toast({
              title: 'Verification In Progress',
              description: 'Verifying signature on server, please do not close window.',
            });

            // 4. Securely verify signature on backend Express server
            const verifyRes = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            await refreshProfile();
            
            // Redirect to Success page
            navigate(
              `/payment/success?order_id=${verifyRes.subscription.id}&amount=${planDetails.priceINR}&plan=${planKey}`
            );
          } catch (verifyErr: any) {
            console.error('Payment verification failed:', verifyErr);
            navigate(`/payment/failed?reason=${encodeURIComponent(verifyErr.message || 'Payment verification failed')}`);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          email: user.email || '',
        },
        theme: {
          color: '#6366f1', // Indigo theme color
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        loggerError('Payment failed during checkout callback', response.error);
        navigate(`/payment/failed?reason=${encodeURIComponent(response.error.description || 'Payment transaction failed')}`);
      });

      rzp.open();
    } catch (err: any) {
      console.error('Checkout initialization failed:', err);
      setErrorMessage(err.message || 'Could not initiate checkout transaction.');
      setLoading(false);
    }
  };

  function loggerError(msg: string, err: any) {
    console.error(`[CHECKOUT_ERROR] ${msg}`, err);
  }

  if (authLoading) {
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
            {/* Back to Pricing */}
            <button
              onClick={() => navigate('/pricing')}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Back to pricing
            </button>

            {/* Main Billing Card */}
            <div className="bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-border/60 bg-secondary/10 flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-primary" />
                <h1 className="font-display text-lg font-bold">Billing Order Checkout</h1>
              </div>

              <div className="p-6 space-y-6">
                {errorMessage ? (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {errorMessage}
                  </div>
                ) : planDetails ? (
                  <>
                    {/* Selected Plan Details */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-start pb-4 border-b border-border/50">
                        <div>
                          <h2 className="font-bold text-base text-foreground">{planDetails.name}</h2>
                          <p className="text-xs text-muted-foreground mt-1">{planDetails.description}</p>
                        </div>
                        <span className="font-display font-extrabold text-xl">
                          ₹{planDetails.priceINR.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Calculations */}
                      <div className="space-y-2.5 text-sm pt-2">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal</span>
                          <span>₹{planDetails.priceINR.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>CGST (0% Nil)</span>
                          <span>₹0.00</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>SGST (0% Nil)</span>
                          <span>₹0.00</span>
                        </div>
                        <div className="flex justify-between font-bold text-base text-foreground pt-3 border-t border-dashed border-border/60">
                          <span>Total Amount Due</span>
                          <span className="text-primary">
                            ₹{planDetails.priceINR.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Trust Seals */}
                    <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Your payment transaction is fully secure. Signature keys are validated server-side using secure cryptographic methods.
                      </p>
                    </div>

                    {/* Submit Checkout */}
                    <Button
                      onClick={handleCheckout}
                      disabled={loading}
                      className="w-full h-11 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl shadow-lg shadow-primary/10 gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Verifying Order Details...
                        </>
                      ) : (
                        <>
                          Proceed to Payment <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-10">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Resolving checkout details...</p>
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
