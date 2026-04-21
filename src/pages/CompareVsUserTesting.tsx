import { Helmet } from 'react-helmet-async';
import ComparePageTemplate, { ComparePageProps } from '@/components/ComparePageTemplate';

const data: ComparePageProps = {
  competitor: 'UserTesting',
  competitorSlug: 'vs-usertesting',
  tagline: 'User Ninjas vs UserTesting',
  headline: 'Enterprise-quality UX research at 90% less cost — and with results in hours, not days.',
  subheadline: 'UserTesting is the legacy market leader. User Ninjas delivers the same panel quality with modern AI analysis, faster turnaround, and transparent pricing.',
  ourPriceLabel: 'From $49/month',
  theirPriceLabel: '$2,500–$30,000+/year',
  ourPriceNote: 'All features included. No annual contracts. Cancel anytime. Free plan available forever.',
  theirPriceNote: 'Annual contract required. Per-credit pricing. Hidden fees for additional seats and features.',
  switchNote: 'Our migration team transfers your test templates, screener logic, and participant panels within 48 hours — free of charge. No disruption to ongoing research.',
  winReasons: [
    {
      title: '90% lower cost for equivalent research',
      body: 'UserTesting charges $30,000+/year for enterprise access. User Ninjas starts at $49/month with no annual commitment and full feature access from day one.',
    },
    {
      title: 'Results in under 2 hours',
      body: 'UserTesting typically takes 1–5 business days to deliver completed sessions. With our pre-vetted panel and automated tasking, most studies complete in under 2 hours.',
    },
    {
      title: 'AI analysis that eliminates manual reviews',
      body: 'UserTesting provides raw recordings with basic transcripts. User Ninjas adds AI summaries, theme clustering, sentiment scores, and action items for each session automatically.',
    },
    {
      title: 'No enterprise lock-in or hidden fees',
      body: 'UserTesting requires annual contracts, seats-based pricing, and add-ons. User Ninjas is month-to-month with all features included in every plan.',
    },
  ],
  features: [
    {
      category: 'Research Methods',
      features: [
        { name: 'Moderated sessions', us: true, them: true },
        { name: 'Unmoderated tests', us: true, them: true },
        { name: 'User interviews', us: true, them: true },
        { name: 'Card sorting', us: true, them: 'Add-on' },
        { name: 'Prototype testing', us: true, them: 'Limited' },
        { name: 'Survey builder', us: true, them: true },
      ],
    },
    {
      category: 'Panel & Recruitment',
      features: [
        { name: 'Managed tester panel', us: '120K+', them: '1M+ (self-sourced)' },
        { name: 'Panel quality guarantee', us: true, them: 'Reported issues' },
        { name: 'Demographic targeting', us: true, them: true },
        { name: 'B2B participant targeting', us: true, them: 'Enterprise only' },
        { name: 'Bring your own participants', us: true, them: true },
      ],
    },
    {
      category: 'AI & Analysis',
      features: [
        { name: 'Auto session summary', us: true, them: 'Basic' },
        { name: 'AI sentiment analysis', us: true, them: false },
        { name: 'Theme clustering', us: true, them: false },
        { name: 'Action item generation', us: true, them: false },
        { name: 'Searchable transcripts', us: true, them: true },
        { name: 'Highlight reels', us: true, them: true },
      ],
    },
    {
      category: 'Pricing & Contract',
      features: [
        { name: 'Free plan', us: true, them: false },
        { name: 'Month-to-month billing', us: true, them: false },
        { name: 'Annual contract required', us: false, them: true },
        { name: 'Transparent pricing', us: true, them: false },
        { name: 'API access', us: true, them: 'Enterprise' },
      ],
    },
  ],
};

export default function CompareVsUserTesting() {
  return (
    <>
      <Helmet>
        <title>User Ninjas vs UserTesting — Full Comparison 2026</title>
        <meta name="description" content="User Ninjas vs UserTesting: is UserTesting worth 30x the price? An honest feature comparison with pricing and panel quality analysis." />
      </Helmet>
      <ComparePageTemplate {...data} />
    </>
  );
}
