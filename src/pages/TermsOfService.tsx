import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Terms of Service | User Ninjas</title>
        <meta name="description" content="Terms of Service for User Ninjas" />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: April 20, 2026</p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using the User Ninjas website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. User Responsibilities</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                As a user of User Ninjas, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the confidentiality of your account information</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Not engage in any unlawful or prohibited activities</li>
                <li>Not attempt to gain unauthorized access to our systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Tester Guidelines</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Testers agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Complete testing tasks accurately and thoroughly</li>
                <li>Provide honest and constructive feedback</li>
                <li>Follow all testing instructions provided</li>
                <li>Respect the confidentiality of unreleased products</li>
                <li>Report issues in a professional manner</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Recruiter Guidelines</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Recruiters agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide clear and accurate project descriptions</li>
                <li>Respect tester privacy and time</li>
                <li>Compensate testers fairly for their work</li>
                <li>Honor all commitments and deadlines</li>
                <li>Not use the platform for unlawful purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                User Ninjas shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to damages for loss of profits, goodwill, use, data, or other intangible losses arising from your use of or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Modifications to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                User Ninjas reserves the right to modify these terms at any time. Your continued use of the service following the posting of revised Terms of Service means that you accept and agree to the changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-foreground font-medium">User Ninjas</p>
                <p className="text-muted-foreground">Email: legal@userninjas.in</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
