import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import { Helmet } from 'react-helmet-async';
import { FileText, AlertCircle, CreditCard, Globe, Scale, Ban } from 'lucide-react';

const sections = [
  {
    id: 'acceptance',
    icon: FileText,
    title: '1. Acceptance of Terms',
    content: [
      { subtitle: 'Agreement', text: 'By accessing or using User Ninjas ("the Platform"), you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree to these Terms, you must not use the Platform.' },
      { subtitle: 'Eligibility', text: 'You must be at least 18 years old to use User Ninjas. By using the Platform, you represent that you meet this age requirement and have the legal capacity to form a binding contract.' },
      { subtitle: 'Account Types', text: 'The Platform offers two primary account types: Recruiters (companies or individuals who create and fund research tests) and Testers (individuals who complete tests in exchange for compensation). Different terms may apply to each.' },
    ],
  },
  {
    id: 'accounts',
    icon: FileText,
    title: '2. User Accounts',
    content: [
      { subtitle: 'Registration', text: 'You agree to provide accurate, current, and complete information when registering. You are responsible for maintaining the confidentiality of your password and for all activities that occur under your account.' },
      { subtitle: 'Account Security', text: 'You must immediately notify us at security@userninjas.in of any unauthorised use of your account or any other security breach. We are not liable for any loss arising from your failure to safeguard your credentials.' },
      { subtitle: 'One Account Per Person', text: 'Each natural person may hold only one Tester account. Creating multiple tester accounts to claim multiple payouts is a material breach of these Terms and may result in permanent suspension and forfeiture of earnings.' },
      { subtitle: 'Account Termination', text: 'We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or cause harm to other users, with or without prior notice depending on severity.' },
    ],
  },
  {
    id: 'payments',
    icon: CreditCard,
    title: '3. Payments & Compensation',
    content: [
      { subtitle: 'Recruiter Credits', text: 'Recruiters purchase pre-paid credits to fund research tests. Credits are non-refundable except where required by law. Unused credits expire 24 months from purchase date.' },
      { subtitle: 'Tester Payouts', text: 'Testers are compensated for approved sessions as stated in each test\'s description. Payment is typically processed within 5 business days of session approval. Amounts are in USD unless otherwise stated.' },
      { subtitle: 'Rejection Policy', text: 'Recruiters may reject a tester\'s submission within 72 hours for defined quality reasons (incomplete task, non-target user, technical failure). Arbitrary rejection without credible reason is prohibited. Disputes may be escalated to User Ninjas for final arbitration.' },
      { subtitle: 'Taxes', text: 'Testers are responsible for reporting and paying any applicable taxes on earnings. We will issue 1099 forms to US-based testers exceeding IRS thresholds. Recruiters pay applicable VAT/GST based on billing address.' },
      { subtitle: 'Payment Processing', text: 'Payments are processed by Stripe. User Ninjas charges a platform fee of 20% on tester compensation. Full fee schedules are published on our Pricing page.' },
    ],
  },
  {
    id: 'intellectual-property',
    icon: FileText,
    title: '4. Intellectual Property',
    content: [
      { subtitle: 'Platform Ownership', text: 'User Ninjas and its licensors own all intellectual property rights in the Platform, including software, design, trade marks, and content created by User Ninjas. Nothing in these Terms grants you any rights in the Platform except as set out here.' },
      { subtitle: 'Recruiter Content', text: 'Recruiters retain ownership of their research materials, prototypes, and test designs. By uploading content to the Platform, you grant User Ninjas a limited licence to host and display that content to facilitate research sessions.' },
      { subtitle: 'Session Output Ownership', text: 'Raw session recordings and responses are owned jointly by the recruiter (as commissioner) and User Ninjas (as processor). AI-generated summaries, insights, and transcripts are owned by User Ninjas but licensed exclusively to the commissioning recruiter.' },
      { subtitle: 'Tester Consent', text: 'By completing a session, testers grant recruiters and User Ninjas a perpetual licence to use session recordings and responses for the stated research purpose. This is disclosed in the tester consent flow before each session begins.' },
    ],
  },
  {
    id: 'prohibited',
    icon: Ban,
    title: '5. Prohibited Conduct',
    content: [
      { subtitle: 'Fraudulent Activity', text: 'Any form of fraudulent activity — including fake sessions, scripted responses, using automation to complete tests, impersonating other users, or submitting false screening information — is strictly prohibited.' },
      { subtitle: 'Harassment & Abuse', text: 'Users may not harass, intimidate, threaten, or demean other users. Recruiters may not ask testers to perform tasks that are illegal, deceptive, embarrassing, or that violate testers\' dignity.' },
      { subtitle: 'Reverse Engineering', text: 'You may not reverse engineer, decompile, or disassemble any part of the Platform, attempt to derive source code, or circumvent technical access controls.' },
      { subtitle: 'Data Scraping', text: 'Automated scraping, crawling, or harvesting of Platform data is prohibited without our express written consent.' },
      { subtitle: 'Competitive Intelligence', text: 'You may not use User Ninjas to conduct research primarily for the purpose of developing a competing product or service.' },
    ],
  },
  {
    id: 'disclaimers',
    icon: AlertCircle,
    title: '6. Disclaimers & Limitation of Liability',
    content: [
      { subtitle: 'As-Is Service', text: 'The Platform is provided "as is" and "as available" without warranty of any kind, express or implied. We do not warrant that the Platform will be uninterrupted, error-free, or free from viruses or harmful components.' },
      { subtitle: 'Research Validity', text: 'User Ninjas provides tools and tester access but does not guarantee the validity, reliability, or statistical significance of any research outputs. Research design decisions remain the responsibility of the recruiter.' },
      { subtitle: 'Limitation of Liability', text: 'To the fullest extent permitted by law, User Ninjas\' total liability to you for any claim arising from these Terms or your use of the Platform shall not exceed the greater of: (a) amounts you paid us in the prior 3 months, or (b) $100 USD.' },
      { subtitle: 'Consequential Damages', text: 'User Ninjas is not liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, revenue, data, goodwill, or other intangible losses.' },
    ],
  },
  {
    id: 'governing-law',
    icon: Scale,
    title: '7. Governing Law & Disputes',
    content: [
      { subtitle: 'Governing Law', text: 'These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict of law principles, except to the extent that local mandatory law applies in your jurisdiction.' },
      { subtitle: 'Dispute Resolution', text: 'Disputes shall first be attempted to be resolved informally by contacting legal@userninjas.in. If not resolved within 60 days, disputes shall be submitted to binding arbitration under the AAA Commercial Arbitration Rules, except you may bring qualifying claims in small claims court.' },
      { subtitle: 'Class Action Waiver', text: 'You agree to resolve any disputes individually and waive any right to bring or participate in a class-action lawsuit, class-wide arbitration, or any other consolidated action.' },
      { subtitle: 'EU Users', text: 'Consumer protection laws in your local jurisdiction may give you rights that cannot be waived by contract. Nothing in these Terms limits rights you have under applicable EU/EEA consumer protection law.' },
    ],
  },
  {
    id: 'changes',
    icon: Globe,
    title: '8. Changes to Terms',
    content: [
      { subtitle: 'Notification', text: 'We will provide at least 30 days\' notice of material changes to these Terms via email and in-app notification. Minor changes (such as clarifications) may be made without notice.' },
      { subtitle: 'Continued Use', text: 'Your continued use of the Platform after the effective date of revised Terms constitutes acceptance of the new Terms. If you do not agree to the revised Terms, you must stop using the Platform and delete your account.' },
      { subtitle: 'Contact', text: 'Questions about these Terms: legal@userninjas.in. Registered address: User Ninjas, Inc., 2261 Market Street #5039, San Francisco, CA 94114, USA.' },
    ],
  },
];

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms of Service - User Ninjas</title>
        <meta name="description" content="User Ninjas Terms of Service. Read our terms governing accounts, payments, intellectual property, and acceptable use." />
      </Helmet>
      <Background3D />
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-5">
              <FileText className="w-3.5 h-3.5" /> Legal
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">Terms of Service</h1>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Please read these terms carefully before using User Ninjas. They govern your use of our platform.
            </p>
            <p className="text-xs text-muted-foreground mt-4">Last updated: April 10, 2026 · Effective: April 10, 2026</p>
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

          {/* Intro box */}
          <div className="rounded-2xl bg-amber-500/8 border border-amber-500/20 p-5 mb-10">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/80 leading-relaxed">
                <strong>Summary:</strong> User Ninjas connects product teams with real users for UX research. Recruiters pay to run tests; testers get paid to participate. Both parties must act in good faith. Fraudulent behaviour leads to immediate termination. Questions? legal@userninjas.in.
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.id} id={section.id} className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <section.icon className="w-4 h-4 text-primary" />
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
            <h3 className="font-display text-lg font-bold mb-2">Legal questions?</h3>
            <p className="text-sm text-muted-foreground mb-4">Our legal team typically responds within 2 business days.</p>
            <a href="mailto:legal@userninjas.in" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              Email legal@userninjas.in
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
