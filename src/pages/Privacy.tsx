import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import { Helmet } from 'react-helmet-async';
import { Shield, Lock, Eye, Database, Bell, UserCheck } from 'lucide-react';

const sections = [
  {
    id: 'information-we-collect',
    icon: Database,
    title: '1. Information We Collect',
    content: [
      {
        subtitle: 'Account Information',
        text: 'When you create an account, we collect your name, email address, password (hashed), profile photo, and any optional profile details you provide (company, role, location).',
      },
      {
        subtitle: 'Usage Data',
        text: 'We automatically collect information about how you interact with our platform, including pages visited, features used, session duration, device type, browser, operating system, and IP address.',
      },
      {
        subtitle: 'Research Session Data',
        text: 'For recruiters, we collect test configurations, screener criteria, and payout settings. For testers, we collect session recordings, written responses, demographic data, and device information relevant to testing.',
      },
      {
        subtitle: 'Payment Information',
        text: 'Payment transactions are processed by Stripe. We store only tokenised references — we never store your raw card number, CVV, or full banking details.',
      },
      {
        subtitle: 'Communications',
        text: 'Emails, support tickets, and chat messages you send us are retained so we can respond effectively and maintain our quality standards.',
      },
    ],
  },
  {
    id: 'how-we-use',
    icon: Eye,
    title: '2. How We Use Your Information',
    content: [
      { subtitle: 'Platform Operations', text: 'To create and manage your account, facilitate research sessions, process payments, and deliver the core functionality of User Ninjas.' },
      { subtitle: 'AI Analysis', text: 'Session recordings and transcripts are processed by our AI systems to generate insights, sentiment scores, and automated highlights. This processing happens in secure, isolated environments.' },
      { subtitle: 'Product Improvement', text: 'Aggregated, anonymised usage data helps us identify bugs, improve features, and prioritise our product roadmap. We never sell individual-level data.' },
      { subtitle: 'Communications', text: 'We email you for account notifications, session updates, payment confirmations, and (if opted in) product updates and research tips. You can unsubscribe at any time.' },
      { subtitle: 'Legal Compliance', text: 'We may process your data to comply with applicable laws, resolve disputes, or enforce our agreements.' },
    ],
  },
  {
    id: 'data-sharing',
    icon: UserCheck,
    title: '3. Data Sharing & Third Parties',
    content: [
      { subtitle: 'Service Providers', text: 'We share data with trusted sub-processors (Supabase for database hosting, Stripe for payments, OpenAI for AI analysis, Resend for transactional email, Cloudflare for CDN). Each is bound by data processing agreements.' },
      { subtitle: 'Recruiters & Testers', text: 'Testers\' session outputs (recordings, responses) are shared with the recruiter who commissioned the test. Testers\' personally identifiable information is never directly disclosed to recruiters beyond what testers opt to share.' },
      { subtitle: 'Business Transfers', text: 'In the event of a merger, acquisition, or asset sale, user data may be transferred. We will provide notice and ensure equivalent protections are maintained.' },
      { subtitle: 'Law Enforcement', text: 'We may disclose data if required by valid legal process, court order, or government authority, to the extent permitted by law and after notifying you where legally permissible.' },
      { subtitle: 'We Never Sell Data', text: 'User Ninjas does not sell, rent, or trade your personal information to third parties for their own marketing purposes. Period.' },
    ],
  },
  {
    id: 'data-retention',
    icon: Database,
    title: '4. Data Retention',
    content: [
      { subtitle: 'Active Accounts', text: 'We retain your data for as long as your account is active and as needed to provide you services.' },
      { subtitle: 'Deleted Accounts', text: 'Upon account deletion, we purge personal data within 30 days, except where retention is required by law, to resolve disputes, or to enforce our agreements.' },
      { subtitle: 'Session Recordings', text: 'Raw session recordings are retained for 12 months by default. Enterprise customers may configure extended retention up to 36 months. AI-generated summaries and transcripts follow the same schedule.' },
      { subtitle: 'Research Data', text: 'Anonymised, aggregated research insights may be retained indefinitely as they cannot be linked to individual users.' },
    ],
  },
  {
    id: 'your-rights',
    icon: UserCheck,
    title: '5. Your Rights',
    content: [
      { subtitle: 'Access & Portability', text: 'You can request a copy of all personal data we hold about you in a structured, machine-readable format, free of charge, once per 12-month period.' },
      { subtitle: 'Correction', text: 'You can update most of your account information directly in your profile settings. For other corrections, email privacy@userninjas.in.' },
      { subtitle: 'Deletion ("Right to be Forgotten")', text: 'You can request deletion of your account and associated data via Settings → Account → Delete Account, or by emailing privacy@userninjas.in.' },
      { subtitle: 'Objection & Restriction', text: 'Under GDPR, you have the right to object to or restrict certain processing of your data, particularly for direct marketing purposes.' },
      { subtitle: 'CCPA Rights', text: 'California residents have additional rights under the CCPA, including the right to know, delete, and opt out of sale (we do not sell data). Contact privacy@userninjas.in to exercise California rights.' },
    ],
  },
  {
    id: 'cookies',
    icon: Lock,
    title: '6. Cookies & Tracking',
    content: [
      { subtitle: 'Essential Cookies', text: 'Required for authentication, CSRF protection, and basic platform functionality. Cannot be disabled.' },
      { subtitle: 'Analytics Cookies', text: 'We use privacy-respecting analytics (first-party, no cross-site tracking) to understand feature usage. You can opt out in cookie settings.' },
      { subtitle: 'Preference Cookies', text: 'Remember your theme, language, and display preferences.' },
      { subtitle: 'Managing Cookies', text: 'You can manage all non-essential cookies via the cookie banner on first visit or through Settings in your browser. See our Cookie Policy for full details.' },
    ],
  },
  {
    id: 'security',
    icon: Shield,
    title: '7. Security',
    content: [
      { subtitle: 'Encryption', text: 'All data in transit is encrypted with TLS 1.3. Data at rest is encrypted using AES-256. Session recordings are stored in encrypted object storage with access controls.' },
      { subtitle: 'Access Controls', text: 'We apply least-privilege access internally. Only engineers with a specific need can access production data, with full audit logging of such access.' },
      { subtitle: 'SOC 2 Type II', text: 'User Ninjas maintains SOC 2 Type II certification, audited annually by an independent third-party firm.' },
      { subtitle: 'Incident Response', text: 'We maintain an incident response plan. In the event of a data breach, we will notify affected users and relevant authorities within 72 hours as required by GDPR.' },
    ],
  },
  {
    id: 'contact',
    icon: Bell,
    title: '8. Contact & Updates',
    content: [
      { subtitle: 'Privacy Officer', text: 'Questions, requests, or complaints: privacy@userninjas.in. We respond within 30 days for all GDPR/CCPA requests and within 5 business days for general inquiries.' },
      { subtitle: 'Policy Updates', text: 'We will notify you by email and in-app notification at least 30 days before material changes take effect. The date at the top of this page reflects the most recent revision.' },
      { subtitle: 'Supervisory Authority', text: 'EU/EEA residents may lodge a complaint with their local data protection authority if they believe their rights have been infringed.' },
    ],
  },
];

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - User Ninjas</title>
        <meta name="description" content="How User Ninjas collects, uses, and protects your personal data. GDPR, CCPA, and SOC 2 compliant." />
      </Helmet>
      <Background3D />
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-5">
              <Shield className="w-3.5 h-3.5" /> Legal
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">Privacy Policy</h1>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              We take your privacy seriously. Here's exactly what we collect, why, and how you control it.
            </p>
            <p className="text-xs text-muted-foreground mt-4">Last updated: April 10, 2026 · Effective: April 10, 2026</p>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              { icon: Shield, text: 'SOC 2 Type II Certified' },
              { icon: Lock, text: 'GDPR Compliant' },
              { icon: UserCheck, text: 'CCPA Compliant' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/15 text-sm font-medium text-primary">
                <Icon className="w-4 h-4" /> {text}
              </div>
            ))}
          </div>

          {/* Table of contents */}
          <div className="rounded-2xl bg-card border border-border/60 p-6 mb-12">
            <h2 className="font-display font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wider">Table of Contents</h2>
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sections.map(s => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-sm text-primary hover:underline">{s.title}</a>
                </li>
              ))}
            </ol>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.id} id={section.id} className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <section.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-bold">{section.title}</h2>
                </div>
                <div className="space-y-5 pl-12">
                  {section.content.map(item => (
                    <div key={item.subtitle}>
                      <h3 className="font-semibold text-sm mb-1">{item.subtitle}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-14 rounded-2xl bg-primary/5 border border-primary/15 p-8 text-center">
            <h3 className="font-display text-lg font-bold mb-2">Questions about your privacy?</h3>
            <p className="text-sm text-muted-foreground mb-4">Our privacy team is available to answer any questions you have.</p>
            <a href="mailto:privacy@userninjas.in" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              Email privacy@userninjas.in
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
