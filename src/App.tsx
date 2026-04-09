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
