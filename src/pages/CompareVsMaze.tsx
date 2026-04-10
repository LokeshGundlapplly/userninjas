import { Helmet } from 'react-helmet-async';
import ComparePageTemplate, { ComparePageProps } from '@/components/ComparePageTemplate';

const data: ComparePageProps = {
  competitor: 'Maze',
  competitorSlug: 'vs-maze',
  tagline: 'User Ninjas vs Maze',
  headline: 'All the prototype testing power of Maze — plus a 120K tester panel, live video sessions, and AI analysis.',
  subheadline: 'Maze is great for quick prototype clicks. User Ninjas adds real users, qualitative depth, and AI-powered insights.',
  ourPriceLabel: 'From $49/month',
  theirPriceLabel: '$166–$600+/month',
  ourPriceNote: 'Includes tester panel, unlimited recordings, and AI analysis. Free plan available.',
  theirPriceNote: 'Per-study pricing adds up fast. Panel testers charged separately. No free tier.',
  switchNote: 'Import your Maze questions directly into User Ninjas in minutes. Our onboarding team helps migrate your templates and participant data free of charge.',
  winReasons: [
    {
      title: 'Real users — not just prototype clicks',
      body: 'Maze tracks taps and time-on-task, but User Ninjas captures the full session: screen recording, audio, facial expressions, and AI-summarised verbatim insights.',
    },
    {
      title: '120K+ verified testers ready to go',
      body: 'Stop relying on your own networks. Our managed tester panel gives you targeted participants filtered by role, device, demographics, and prior experience in minutes.',
    },
    {
      title: 'AI analysis that actually saves time',
      body: 'Every session auto-generates a written summary, key themes, sentiment score, and prioritised action list — no post-processing, no manual note-taking.',
    },
    {
      title: '70% lower cost per study',
      body: 'Maze charges per study plus participant fees. User Ninjas bundles unlimited studies, recordings, and participants into one flat monthly rate.',
    },
  ],
  features: [
    {
      category: 'Research Methods',
      features: [
        { name: 'Prototype testing', us: true, them: true },
        { name: 'Moderated live sessions', us: true, them: false },
        { name: 'Unmoderated recorded tasks', us: true, them: true },
        { name: 'User interviews', us: true, them: false },
        { name: 'Card sorting', us: true, them: 'Limited' },
        { name: 'Survey builder', us: true, them: true },
        { name: 'Tree testing', us: true, them: false },
      ],
    },
    {
      category: 'Tester Management',
      features: [
        { name: 'Managed tester panel', us: '120K+', them: 'None' },
        { name: 'Demographic filtering', us: true, them: false },
        { name: 'Previous participant history', us: true, them: false },
        { name: 'Bring your own participants', us: true, them: true },
        { name: 'Panel quality guarantee', us: true, them: false },
      ],
    },
    {
      category: 'AI & Analysis',
      features: [
        { name: 'Auto session summary', us: true, them: false },
        { name: 'Sentiment analysis', us: true, them: false },
        { name: 'AI theme clustering', us: true, them: false },
        { name: 'Click heatmaps', us: true, them: true },
        { name: 'Screen recording + replay', us: true, them: 'Limited' },
        { name: 'Searchable transcripts', us: true, them: false },
      ],
    },
    {
      category: 'Integrations & Pricing',
      features: [
        { name: 'Figma integration', us: true, them: true },
        { name: 'Slack / Jira notifications', us: true, them: 'Slack only' },
        { name: 'API access', us: true, them: 'Enterprise' },
        { name: 'Free plan', us: true, them: false },
        { name: 'Month-to-month billing', us: true, them: false },
      ],
    },
  ],
};

export default function CompareVsMaze() {
  return (
    <>
      <Helmet>
        <title>User Ninjas vs Maze — Full Comparison 2026</title>
        <meta name="description" content="User Ninjas vs Maze: detailed feature comparison, pricing, and why 4,000+ teams chose User Ninjas for their UX research." />
      </Helmet>
      <ComparePageTemplate {...data} />
    </>
  );
}
