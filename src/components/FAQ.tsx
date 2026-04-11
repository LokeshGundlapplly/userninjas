import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import ScrollReveal from './ScrollReveal';

const faqs = [
  {
    question: 'How does the 14-day free trial work?',
    answer: 'Start with full access to all features on your chosen plan. No credit card required. If you decide to continue after 14 days, simply add your payment details. If not, your account safely expires — no charges, no awkward retention flows.',
  },
  {
    question: 'What types of research studies can I run?',
    answer: 'You can run unmoderated usability tests, moderated interviews, prototype tests, card sorting, tree testing, 5-second tests, click testing, and custom surveys — all from one platform. Each method is designed to answer different research questions and can be combined within a single study.',
  },
  {
    question: 'What types of testers can I access?',
    answer: 'Our global panel includes 120,000+ verified testers from 150+ countries. Filter by 50+ criteria including demographics, device type (desktop/mobile), technical proficiency, job role, income bracket, language, and geography. Every tester is ID-verified and quality-scored before joining the panel.',
  },
  {
    question: 'How fast will I receive results?',
    answer: 'Turnaround depends on your plan: Starter (48h), Pro (24h), Enterprise (12h). Most tests complete even faster — typically within a few hours for popular demographics. AI summaries and insights are auto-generated immediately after each session completes.',
  },
  {
    question: "What's included in the AI analysis?",
    answer: 'Our AI automatically generates: full session transcripts, pain point detection with timestamps, sentiment scores per task, key quote highlights, session summaries, and prioritized recommendations. Pro and Enterprise plans additionally include heatmaps, funnel drop-off analysis, and thematic clustering across sessions.',
  },
  {
    question: 'Can I test Figma prototypes or live URLs?',
    answer: 'Yes to both. You can share any Figma prototype link, InVision prototype, Marvel prototype, or any live URL. Participants can test on desktop, mobile, or tablet devices. We support think-aloud protocols and task-based testing for all formats.',
  },
  {
    question: 'How does participant recruitment work?',
    answer: 'When you create a study, you define your screener criteria. Our AI matches and auto-invites qualifying participants from the panel. Participants complete the screener, and only those who pass are sent to your test. You can also recruit from your own user base by sharing a custom link.',
  },
  {
    question: 'Is User Ninjas compliant with GDPR and privacy regulations?',
    answer: 'Yes. All data is processed in compliance with GDPR, CCPA, and SOC 2 Type II standards. Participant data is anonymized on request, data residency options are available (EU/US), and all sessions are stored encrypted at rest. We offer DPA agreements for enterprise customers.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Absolutely. Cancel anytime with no fees or penalties. You retain full access until the end of your billing period. Export all your data before you go — we make it easy, because we earn your business every single month.',
  },
  {
    question: 'Do you offer discounts for startups or nonprofits?',
    answer: "Yes! 50% off for verified early-stage startups (under 2 years old, under $1M in funding) and 30% off for registered nonprofits and academic institutions. Contact us with documentation and we'll get you set up within 24 hours.",
  },
];

export default function FAQ() {
  return (
    <section className="py-28">
      <div className="container mx-auto px-4 max-w-3xl">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">FAQ</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Common questions, answered
            </h2>
            <p className="text-muted-foreground text-lg">
              Can't find what you're looking for?{' '}
              <Link to="/contact" className="text-primary hover:underline font-medium">Talk to our team →</Link>
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={100}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-2xl px-6 border border-border/50 data-[state=open]:border-primary/25 data-[state=open]:shadow-md transition-all duration-200"
              >
                <AccordionTrigger className="text-left font-semibold text-sm hover:text-primary transition-colors py-5 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
}
