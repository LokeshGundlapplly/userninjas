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
    question: 'What types of testers can I access?',
    answer: 'Our global panel includes 120,000+ verified testers from 150+ countries. Filter by demographics, device type, technical proficiency, and custom criteria.',
  },
  {
    question: 'How fast will I receive results?',
    answer: 'Turnaround depends on your plan: Starter (48h), Pro (24h), Enterprise (12h). Most tests complete even faster.',
  },
  {
    question: "What's included in the analytics dashboard?",
    answer: 'All plans include session recordings, task completion metrics, and user feedback. Pro and Enterprise add AI summaries, heatmaps, and exportable reports.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: "Absolutely. Cancel anytime with no penalties. You retain access until the end of your billing period.",
  },
  {
    question: 'Do you offer discounts for startups?',
    answer: 'Yes! 50% off for verified startups (under 2 years, less than $1M funding) and 30% off for registered nonprofits.',
  },
];

export default function FAQ() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4 max-w-3xl">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">FAQ</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Common questions
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={100}>
          <Accordion type="single" collapsible className="space-y-2.5">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-xl px-5 border border-border/50 data-[state=open]:border-primary/20 transition-colors"
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
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Still have questions?{' '}
              <a href="/contact" className="text-primary hover:underline font-medium">Contact us</a>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
