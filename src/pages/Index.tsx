import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import { useSpotlightCards } from '@/hooks/useSpotlightCards';
import Navbar from '@/components/Navbar';
import HeroInteractive from '@/components/HeroInteractive';
import TrustedBy from '@/components/TrustedBy';
import ProblemSection from '@/components/ProblemSection';
import AIWorkflow from '@/components/AIWorkflow';
import ResearchTemplates from '@/components/ResearchTemplates';
import DashboardPreview from '@/components/DashboardPreview';
import InsightsShowcase from '@/components/InsightsShowcase';
import CommandPaletteDemo from '@/components/CommandPaletteDemo';
import EnterpriseFeatures from '@/components/EnterpriseFeatures';
import SecurityHub from '@/components/SecurityHub';
import TestimonialsMarquee from '@/components/TestimonialsMarquee';
import FAQSection from '@/components/FAQSection';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import ChatWidget from '@/components/ChatWidget';
import ScrollProgress from '@/components/ScrollProgress';
import PageTransition from '@/components/PageTransition';

export default function Index() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  useSpotlightCards();

  useEffect(() => {
    if (!loading && user && role) {
      if (role === 'recruiter') navigate('/recruiter', { replace: true });
      else if (role === 'tester') navigate('/tester', { replace: true });
    }
  }, [user, role, loading, navigate]);
  return (
    <>
      <Helmet>
        <title>User Ninjas - AI-Powered User Research Operating System</title>
        <meta name="description" content="Validate decisions, run qualitative AI interviews, and get user insights in minutes. Trusted by product teams globally." />
      </Helmet>

      <Background3D />
      <ScrollProgress />
      <Navbar />
      
      <main>
        <PageTransition>
          <HeroInteractive />
          <TrustedBy />
          <ProblemSection />
          <AIWorkflow />
          <ResearchTemplates />
          <DashboardPreview />
          <InsightsShowcase />
          <CommandPaletteDemo />
          <EnterpriseFeatures />
          <SecurityHub />
          <TestimonialsMarquee />
          <FAQSection />
          <CTA />
        </PageTransition>
      </main>

      <Footer />
      <ChatWidget />
    </>
  );
}
