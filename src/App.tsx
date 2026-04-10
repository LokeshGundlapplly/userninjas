import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { useChatEscalationNotifier } from "@/hooks/useChatEscalation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import FeaturesPage from "./pages/FeaturesPage";
import About from "./pages/About";
import TesterDashboard from "./pages/TesterDashboard";
import TesterProfile from "./pages/TesterProfile";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import ResetPassword from "./pages/ResetPassword";
import CreateTest from "./pages/CreateTest";
import SurveyBuilder from "./pages/SurveyBuilder";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
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
              <Route path="/contact" element={<Contact />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/tester" element={<TesterDashboard />} />
              <Route path="/tester/profile" element={<TesterProfile />} />
              <Route path="/recruiter" element={<RecruiterDashboard />} />
              <Route path="/recruiter/create-test" element={<CreateTest />} />
              <Route path="/recruiter/surveys" element={<SurveyBuilder />} />
              <Route path="/admin" element={<AdminPanel />} />
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
