import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { useEffect, ReactNode, useLayoutEffect } from "react";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useChatEscalationNotifier } from "@/hooks/useChatEscalation";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import FeaturesPage from "./pages/FeaturesPage";
import About from "./pages/About";
import TesterDashboard from "./pages/TesterDashboard";
import TesterProfile from "./pages/TesterProfile";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import CompleteProfile from "./pages/CompleteProfile";
import VerifyEmail from "./pages/VerifyEmail";
import CreateTest from "./pages/CreateTest";
import SurveyBuilder from "./pages/SurveyBuilder";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import OAuthConsent from "./pages/OAuthConsent";
// Legal
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
// Product
import Integrations from "./pages/Integrations";
import Changelog from "./pages/Changelog";
// Resources
import Blog from "./pages/Blog";
import Templates from "./pages/Templates";
import Docs from "./pages/Docs";
import Glossary from "./pages/Glossary";
import Community from "./pages/Community";
// Company
import Careers from "./pages/Careers";
import Press from "./pages/Press";
// Compare
import Compare from "./pages/Compare";
import CompareVsMaze from "./pages/CompareVsMaze";
import CompareVsUserTesting from "./pages/CompareVsUserTesting";
import CompareVsPlaybook from "./pages/CompareVsPlaybook";
import CompareVsUXTweak from "./pages/CompareVsUXTweak";
import CompareVsLookback from "./pages/CompareVsLookback";

const queryClient = new QueryClient();

function ChatEscalationListener() {
  useChatEscalationNotifier();
  return null;
}

// Intercept confirmation links BEFORE routing to ensure they always go to /verify-email
// Intercept recovery links BEFORE routing to ensure they always go to /reset-password
// This runs at app initialization to catch the redirect
if (typeof window !== 'undefined') {
  // Check for confirmation token in hash or query params
  const hasConfirmationToken = window.location.hash.includes('access_token') && 
                               window.location.hash.includes('type=signup');
  const hasRecoveryToken = window.location.hash.includes('access_token') && 
                           window.location.hash.includes('type=recovery');
  const url = new URL(window.location.href);
  const hasRedirectParam = url.searchParams.has('redirect_to');

  if (hasRecoveryToken) {
    console.log('✓ Recovery token detected at app load, routing to /reset-password');
    // Remove redirect_to parameter if present
    if (hasRedirectParam) {
      url.searchParams.delete('redirect_to');
      window.history.replaceState({}, document.title, url.toString());
    }
    // Ensure we're on /reset-password
    if (!window.location.pathname.includes('/reset-password')) {
      window.location.pathname = '/reset-password';
    }
  } else if (hasConfirmationToken) {
    console.log('✓ Confirmation token detected at app load, routing to /verify-email');
    // Remove redirect_to parameter if present
    if (hasRedirectParam) {
      url.searchParams.delete('redirect_to');
      window.history.replaceState({}, document.title, url.toString());
    }
    // Ensure we're on /verify-email
    if (!window.location.pathname.includes('/verify-email')) {
      window.location.pathname = '/verify-email';
    }
  } else if (hasRedirectParam) {
    // Remove stray redirect_to parameters
    console.log('✓ Removing stray redirect_to parameter');
    url.searchParams.delete('redirect_to');
    window.history.replaceState({}, document.title, url.toString());
  }
}

// Protect dashboard routes - redirect to verify-email if password not set
function ProtectedDashboardRoute({ children }: { children: ReactNode }) {
  const { user, loading, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery token - if present, don't redirect (user is resetting password)
    const hasRecoveryToken = window.location.hash.includes('type=recovery') && 
                             window.location.hash.includes('access_token');
    
    if (hasRecoveryToken) {
      console.log('Recovery token detected in protected route, preventing redirect to reset-password');
      navigate('/reset-password', { replace: true });
      return;
    }

    // First check for confirmation token - this takes priority
    const hasConfirmationToken = window.location.hash.includes('access_token') && 
                                 window.location.hash.includes('type=signup');
    
    if (hasConfirmationToken) {
      console.log('Confirmation token found in protected route, redirecting to /verify-email');
      navigate('/verify-email', { replace: true });
      return;
    }

    if (loading) return;

    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    // Admin users bypass email verification check - they can access directly
    if (role === 'admin') {
      console.log('Admin user detected, allowing access to admin routes');
      return;
    }

    // Check if user has verified their email (either via Supabase built-in or custom metadata)
    const userMetadata = user.user_metadata || {};
    const isGoogleOAuth = user.app_metadata?.provider === 'google';
    const isLinkedInOAuth = user.app_metadata?.provider === 'linkedin_oidc';
    const emailVerified = userMetadata.email_verified === true || !!user.email_confirmed_at || isGoogleOAuth || isLinkedInOAuth;

    if (!emailVerified) {
      console.log('Email not verified, redirecting to /verify-email');
      // Redirect to verify email to set password first
      navigate('/verify-email', { replace: true });
    }
  }, [user, loading, role, navigate]);

  if (loading || !user) return null;
  return <>{children}</>;
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ChatEscalationListener />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/complete-profile" element={<ProtectedDashboardRoute><CompleteProfile /></ProtectedDashboardRoute>} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/oauth/consent" element={<OAuthConsent />} />
              <Route path="/tester" element={<ProtectedDashboardRoute><TesterDashboard /></ProtectedDashboardRoute>} />
              <Route path="/tester/profile" element={<ProtectedDashboardRoute><TesterProfile /></ProtectedDashboardRoute>} />
              <Route path="/recruiter" element={<ProtectedDashboardRoute><RecruiterDashboard /></ProtectedDashboardRoute>} />
              <Route path="/recruiter/create-test" element={<ProtectedDashboardRoute><CreateTest /></ProtectedDashboardRoute>} />
              <Route path="/recruiter/surveys" element={<ProtectedDashboardRoute><SurveyBuilder /></ProtectedDashboardRoute>} />
              <Route path="/admin" element={<ProtectedDashboardRoute><AdminPanel /></ProtectedDashboardRoute>} />
              <Route path="/reset-password" element={<ResetPassword />} />
              {/* Legal */}
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              {/* Product */}
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/changelog" element={<Changelog />} />
              {/* Resources */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/glossary" element={<Glossary />} />
              <Route path="/community" element={<Community />} />
              {/* Company */}
              <Route path="/careers" element={<Careers />} />
              <Route path="/press" element={<Press />} />
              {/* Compare */}
              <Route path="/compare" element={<Compare />} />
              <Route path="/compare/vs-maze" element={<CompareVsMaze />} />
              <Route path="/compare/vs-usertesting" element={<CompareVsUserTesting />} />
              <Route path="/compare/vs-playbook" element={<CompareVsPlaybook />} />
              <Route path="/compare/vs-uxtweak" element={<CompareVsUXTweak />} />
              <Route path="/compare/vs-lookback" element={<CompareVsLookback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
  </ThemeProvider>
);

export default App;
