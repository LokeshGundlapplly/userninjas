import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import ScrollReveal from './ScrollReveal';

const faqs = [
  {
    question: 'How does the 14-day free trial work?',
    answer: 'Start with full access to all features on your chosen plan. No credit card required. If you decide to continue after 14 days, simply add your payment details.',
  },
  {
    question: 'Can I switch between monthly and annual billing?',
    answer: "Yes! You can switch at any time. When upgrading to annual, you'll receive prorated credit for your remaining monthly subscription.",
  },
  {
    question: 'What types of testers can I access?',
    answer: 'Our global panel includes 120,000+ verified testers from 150+ countries. Filter by demographics, device type, technical proficiency, and custom criteria.',
  },
  {
    question: 'How fast will I receive results?',
    answer: 'Turnaround depends on your plan: Starter (48h), Pro (24h), Enterprise (12h). Most tests complete even faster.',
  },
  {
    question: "What's included in the analytics dashboard?",
    answer: 'All plans include session recordings, task completion metrics, and user feedback. Pro and Enterprise add heatmaps, click tracking, and exportable reports.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: "Absolutely. Cancel anytime with no penalties. For monthly plans, you retain access until the end of your billing period.",
  },
  {
    question: 'Do you offer discounts for startups?',
    answer: 'Yes! 50% off for verified startups (under 2 years, less than $1M funding) and 30% off for registered nonprofits.',
  },
  {
    question: 'What integrations are available?',
    answer: 'We integrate with Slack, Jira, Notion, Figma, and major analytics platforms. Enterprise includes custom API access.',
  },
];

export default function FAQ() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">FAQ</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Common questions
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about User Ninjas.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={100}>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-xl px-6 border border-border/60 data-[state=open]:border-primary/20 transition-colors"
              >
                <AccordionTrigger className="text-left font-medium text-sm hover:text-primary transition-colors py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={200}>
          <div className="text-center mt-10">
            <p className="text-sm text-muted-foreground">
              Still have questions?{' '}
              <a href="/contact" className="text-primary hover:underline font-medium">
                Contact our team
              </a>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
