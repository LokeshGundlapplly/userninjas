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
    answer: 'Start with full access to all features on your chosen plan. No credit card required. If you decide to continue after 14 days, simply add your payment details. If not, your account will automatically downgrade to our free tier.',
  },
  {
    question: 'Can I switch between monthly and annual billing?',
    answer: 'Yes! You can switch at any time. When upgrading to annual, you\'ll receive prorated credit for your remaining monthly subscription. When downgrading to monthly, the change takes effect at the end of your annual term.',
  },
  {
    question: 'What types of testers can I access?',
    answer: 'Our global panel includes 120,000+ verified testers from 150+ countries. You can filter by demographics, device type, technical proficiency, industry experience, and custom screening criteria to find the perfect match for your research.',
  },
  {
    question: 'How fast will I receive results?',
    answer: 'Turnaround times depend on your plan: Starter (48 hours), Pro (24 hours), and Enterprise (12 hours). These are guaranteed maximums—most tests complete even faster. Rush options are available for time-sensitive projects.',
  },
  {
    question: 'What\'s included in the analytics dashboard?',
    answer: 'All plans include session recordings, task completion metrics, and user feedback. Pro and Enterprise plans add heatmaps, click tracking, scroll depth analysis, A/B test comparisons, and exportable reports for stakeholder presentations.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Absolutely. Cancel anytime with no penalties or hidden fees. For monthly plans, you\'ll retain access until the end of your billing period. Annual plans can be cancelled for a prorated refund within the first 30 days.',
  },
  {
    question: 'Do you offer discounts for startups or nonprofits?',
    answer: 'Yes! We offer 50% off for verified startups (under 2 years old, less than $1M in funding) and 30% off for registered nonprofits. Contact our sales team with your organization details to apply.',
  },
  {
    question: 'What integrations are available?',
    answer: 'We integrate with popular tools including Slack, Jira, Notion, Figma, and major analytics platforms. Enterprise plans include custom API access and dedicated integration support for your existing workflows.',
  },
];

export default function FAQ() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-3xl">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about User Ninjas
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={0.1}>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-card rounded-lg px-6 border-border/50"
              >
                <AccordionTrigger className="text-left font-medium hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={0.2}>
          <div className="text-center mt-12">
            <p className="text-muted-foreground">
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
