import { Helmet } from 'react-helmet-async';
import ComparePageTemplate, { ComparePageProps } from '@/components/ComparePageTemplate';

const data: ComparePageProps = {
  competitor: 'UXtweak',
  competitorSlug: 'vs-uxtweak',
  tagline: 'User Ninjas vs UXtweak',
  headline: 'All the IA and usability depth of UXtweak — plus AI analysis and a 120K tester panel.',
  subheadline: 'UXtweak excels at tree testing and card sorting. User Ninjas does all that and adds live sessions, richer AI analysis, and a larger global panel.',
  ourPriceLabel: 'From $49/month',
  theirPriceLabel: 'From $80/month',
  ourPriceNote: 'Full platform including AI analysis, managed panel, and video sessions. Free plan available.',
  theirPriceNote: 'Per-study pricing on some plans. Panel access limited. AI features in development.',
  switchNote: 'UXtweak card sort and tree test data exports to CSV — our import tool maps it directly into User Ninjas projects automatically.',
  winReasons: [
    {
      title: 'Larger and more diverse tester panel',
      body: 'UXtweak\'s panel is smaller and less globally diverse. With 120K+ verified testers across all demographics, User Ninjas consistently delivers more representative research samples.',
    },
    {
      title: 'AI analysis from day one',
      body: 'UXtweak provides solid charts and tree metrics. User Ninjas augments every study with AI-generated summaries, theme extraction, and verbatim highlight reels.',
    },
    {
      title: 'Qualitative research — not just IA testing',
      body: 'UXtweak focuses on structural navigation tests. User Ninjas covers the full research lifecycle: interviews, usability testing, prototype feedback, and discovery surveys.',
    },
    {
      title: 'Simpler, more predictable pricing',
      body: 'UXtweak uses a per-study model on several plans. User Ninjas is a flat monthly rate with unlimited studies, recordings, and participants included.',
    },
  ],
  features: [
    {
      category: 'Research Methods',
      features: [
        { name: 'Card sorting (open & closed)', us: true, them: true },
        { name: 'Tree testing', us: true, them: true },
        { name: 'First-click testing', us: true, them: true },
        { name: 'Prototype testing', us: true, them: true },
        { name: 'Moderated sessions', us: true, them: 'Limited' },
        { name: 'User interviews', us: true, them: 'Limited' },
        { name: 'Survey builder', us: true, them: true },
        { name: 'Five-second test', us: true, them: true },
      ],
    },
    {
      category: 'Recruitment & Panel',
      features: [
        { name: 'Managed tester panel', us: '120K+', them: 'Smaller panel' },
        { name: 'Global demographic targeting', us: true, them: 'Limited regions' },
        { name: 'Panel quality screening', us: true, them: 'Basic' },
        { name: 'Bring your own participants', us: true, them: true },
      ],
    },
    {
      category: 'Analysis & AI',
      features: [
        { name: 'AI session summary', us: true, them: false },
        { name: 'Sentiment analysis', us: true, them: false },
        { name: 'Tree test metrics & charts', us: true, them: true },
        { name: 'Heatmaps', us: true, them: true },
        { name: 'Video recording', us: true, them: 'Some plans' },
        { name: 'Transcript search', us: true, them: false },
      ],
    },
    {
      category: 'Plans & Integrations',
      features: [
        { name: 'Free plan', us: true, them: 'Trial only' },
        { name: 'Unlimited studies', us: true, them: 'Plan-dependent' },
        { name: 'API access', us: true, them: 'Enterprise' },
        { name: 'Figma integration', us: true, them: true },
        { name: 'Team workspaces', us: true, them: true },
      ],
    },
  ],
};

export default function CompareVsUXTweak() {
  return (
    <>
      <Helmet>
        <title>User Ninjas vs UXtweak — Full Comparison 2026</title>
        <meta name="description" content="User Ninjas vs UXtweak: feature comparison for card sorting, tree testing, AI analysis, and tester panel quality." />
      </Helmet>
      <ComparePageTemplate {...data} />
    </>
  );
}
