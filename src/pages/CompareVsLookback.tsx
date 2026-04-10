import { Helmet } from 'react-helmet-async';
import ComparePageTemplate, { ComparePageProps } from '@/components/ComparePageTemplate';

const data: ComparePageProps = {
  competitor: 'Lookback',
  competitorSlug: 'vs-lookback',
  tagline: 'User Ninjas vs Lookback',
  headline: 'Lookback is a great recorder. User Ninjas is a complete research platform.',
  subheadline: 'Lookback excels at live moderated sessions. User Ninjas adds tester recruitment, AI analysis, unmoderated tests, and 3x better value.',
  ourPriceLabel: 'From $49/month',
  theirPriceLabel: 'From $149/month',
  ourPriceNote: 'Includes recruitment, unmoderated tests, AI analysis, and screen recording. Free plan available.',
  theirPriceNote: 'Session recording focused. No tester recruitment. No unmoderated tests. No AI analysis.',
  switchNote: 'Lookback session recordings export as MP4 files. Our onboarding team can bulk-import your previous sessions into User Ninjas for AI re-analysis at no extra cost.',
  winReasons: [
    {
      title: 'Built-in tester recruitment — no extra tool needed',
      body: 'Lookback requires you to source your own participants via email or external panels. User Ninjas puts a 120K+ tester panel one click away — no extra fee, no separate vendor.',
    },
    {
      title: 'Unmoderated tests as well as moderated',
      body: 'Lookback focuses exclusively on live sessions. User Ninjas supports unmoderated recorded tasks, surveys, prototype tests, and card sorts — all in one platform.',
    },
    {
      title: 'AI analysis, not just raw recordings',
      body: 'Lookback stores your recordings and provides a transcript. User Ninjas processes each session with AI to produce summaries, themes, sentiment scores, and next-step recommendations.',
    },
    {
      title: '3x less expensive for comparable session volume',
      body: 'Lookback\'s pricing is competitive for session recording, but once you add participant sourcing costs and the missing analysis layer, User Ninjas is typically 60–70% cheaper all-in.',
    },
  ],
  features: [
    {
      category: 'Research Methods',
      features: [
        { name: 'Moderated live sessions', us: true, them: true },
        { name: 'Unmoderated recorded tasks', us: true, them: false },
        { name: 'User interviews', us: true, them: true },
        { name: 'Prototype testing', us: true, them: false },
        { name: 'Card sorting / surveys', us: true, them: false },
        { name: 'Screen recording', us: true, them: true },
      ],
    },
    {
      category: 'Recruitment & Panel',
      features: [
        { name: 'Managed tester panel', us: '120K+', them: 'None' },
        { name: 'Built-in participant recruiting', us: true, them: false },
        { name: 'Demographic filtering', us: true, them: false },
        { name: 'Bring your own participants', us: true, them: true },
        { name: 'Screener questions', us: true, them: 'Limited' },
      ],
    },
    {
      category: 'AI & Analysis',
      features: [
        { name: 'AI session summary', us: true, them: false },
        { name: 'Auto-transcription', us: true, them: true },
        { name: 'Sentiment analysis', us: true, them: false },
        { name: 'Theme clustering', us: true, them: false },
        { name: 'Highlight reels', us: true, them: true },
        { name: 'Transcript search', us: true, them: true },
        { name: 'Action item generation', us: true, them: false },
      ],
    },
    {
      category: 'Plans & Integrations',
      features: [
        { name: 'Free plan', us: true, them: false },
        { name: 'Month-to-month billing', us: true, them: true },
        { name: 'API access', us: true, them: false },
        { name: 'Figma integration', us: true, them: false },
        { name: 'Slack notifications', us: true, them: 'Limited' },
        { name: 'Team workspaces', us: true, them: true },
      ],
    },
  ],
};

export default function CompareVsLookback() {
  return (
    <>
      <Helmet>
        <title>User Ninjas vs Lookback — Full Comparison 2026</title>
        <meta name="description" content="User Ninjas vs Lookback: full feature comparison for UX research sessions, AI analysis, tester recruitment, and pricing." />
      </Helmet>
      <ComparePageTemplate {...data} />
    </>
  );
}
