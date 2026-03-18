import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TrustedBy from '@/components/TrustedBy';
import MissionProtocol from '@/components/MissionProtocol';
import Features from '@/components/Features';
import Capabilities from '@/components/Capabilities';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';

export default function Index() {
  return (
    <>
      <Helmet>
        <title>User Ninjas - Elite User Research for Product Teams</title>
        <meta name="description" content="Join 4,000+ elite product teams building better software with stealth-speed insights. Access 120,000+ verified testers from 150+ countries." />
      </Helmet>

      <Background3D />
      <Navbar />
      
      <main>
        <Hero />
        <TrustedBy />
        <MissionProtocol />
        <Features />
        <Capabilities />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>

      <Footer />
    </>
  );
}
