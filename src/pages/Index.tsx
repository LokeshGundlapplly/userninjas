import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TrustedBy from '@/components/TrustedBy';
import MissionProtocol from '@/components/MissionProtocol';
import Features from '@/components/Features';
import Capabilities from '@/components/Capabilities';
import ComparisonTable from '@/components/ComparisonTable';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import TesterCTA from '@/components/TesterCTA';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import ChatWidget from '@/components/ChatWidget';

export default function Index() {
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
        <Features />
        <Capabilities />
        <ComparisonTable />
        <Testimonials />
        <Pricing />
        <FAQ />
        <TesterCTA />
        <CTA />
      </main>

      <Footer />
    </>
  );
}
