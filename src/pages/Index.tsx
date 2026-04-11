import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TrustedBy from '@/components/TrustedBy';
import MissionProtocol from '@/components/MissionProtocol';
import ResearchMethods from '@/components/ResearchMethods';
import Features from '@/components/Features';
import ProductDemo from '@/components/ProductDemo';
import Capabilities from '@/components/Capabilities';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import ComparisonTable from '@/components/ComparisonTable';
import FAQ from '@/components/FAQ';
import TesterCTA from '@/components/TesterCTA';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import ChatWidget from '@/components/ChatWidget';

export default function Index() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && role) {
      if (role === 'recruiter') navigate('/recruiter', { replace: true });
      else if (role === 'tester') navigate('/tester', { replace: true });
    }
  }, [user, role, loading, navigate]);
  return (
    <>
      <Helmet>
        <title>User Ninjas - Test Your Product with Real Users | UX Testing Platform</title>
        <meta name="description" content="Test your product with real users and get insights in hours. Video recordings, AI-powered analysis, and targeted recruitment. Trusted by 500+ companies." />
      </Helmet>

      <Background3D />
      <Navbar />
      
      <main>
        <Hero />
        <TrustedBy />
        <MissionProtocol />
        <ResearchMethods />
        <Features />
        <ProductDemo />
        <Capabilities />
        <Testimonials />
        <Pricing />
        <ComparisonTable />
        <FAQ />
        <TesterCTA />
        <CTA />
      </main>

      <Footer />
      <ChatWidget />
    </>
  );
}
