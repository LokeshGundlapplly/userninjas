import { Helmet } from 'react-helmet-async';
import ComparePageTemplate, { ComparePageProps } from '@/components/ComparePageTemplate';

const data: ComparePageProps = {
  competitor: 'Playbook UX',
  competitorSlug: 'vs-playbook',
  tagline: 'User Ninjas vs Playbook UX',
  headline: 'Playbook is great for quick first impressions. User Ninjas gives you the full picture.',
  subheadline: 'Go beyond five-second tests and click maps. Get moderated sessions, a managed tester panel, and AI-powered insight reports.',
  ourPriceLabel: 'From $49/month',
  theirPriceLabel: 'From $99/month',
  ourPriceNote: 'Moderated + unmoderated, AI analysis, 120K+ panel included. Free plan available.',
  theirPriceNote: 'Mainly unmoderated quick tests. No video sessions, no managed panel, no AI analysis.',
  switchNote: 'Your Playbook screeners, questions, and participant lists export cleanly into User Ninjas. Import takes under 10 minutes with our guided template converter.',
  winReasons: [
    {
      title: 'Moderated sessions, not just click tests',
      body: 'Playbook UX specialises in quick guerrilla tests — five-second tests, first-click maps, preference tests. User Ninjas adds full moderated video sessions for deeper qualitative insight.',
    },
    {
      title: 'A managed tester panel with real demographics',
      body: 'Playbook relies on your own links to find participants. User Ninjas provides instant access to 120K+ screened testers filtered by age, role, device, country, and more.',
    },
    {
      title: 'AI analysis that goes beyond bar charts',
      body: 'Playbook presents click data and preference percentages. User Ninjas layers AI-generated themes, sentiment analysis, and actionable next steps on every study.',
    },
    {
      title: 'Better question logic and branching',
      body: 'User Ninjas supports advanced branching logic, conditional skip, screener qualification, and multi-modal task types — far beyond Playbook\'s basic question builder.',
    },
  ],
  features: [
    {
      category: 'Research Methods',
      features: [
        { name: 'Five-second test', us: true, them: true },
        { name: 'First-click testing', us: true, them: true },
        { name: 'Preference test', us: true, them: true },
        { name: 'Moderated live sessions', us: true, them: false },
        { name: 'User interviews', us: true, them: false },
        { name: 'Card sorting / tree testing', us: true, them: 'Limited' },
        { name: 'Prototype testing', us: true, them: 'Basic' },
        { name: 'Survey builder', us: true, them: true },
      ],
    },
    {
      category: 'Recruitment & Panel',
      features: [
        { name: 'Managed panel', us: '120K+', them: 'None' },
        { name: 'Demographic targeting', us: true, them: false },
        { name: 'Bring your own participants', us: true, them: true },
        { name: 'Tester quality screening', us: true, them: false },
      ],
    },
    {
      category: 'Analysis',
      features: [
        { name: 'Click heatmaps', us: true, them: true },
        { name: 'AI session summary', us: true, them: false },
        { name: 'Sentiment analysis', us: true, them: false },
        { name: 'Video recording + replay', us: true, them: false },
        { name: 'Searchable transcripts', us: true, them: false },
        { name: 'Branching / conditional logic', us: true, them: 'Basic' },
      ],
    },
    {
      category: 'Plans & Integrations',
      features: [
        { name: 'Free plan', us: true, them: 'Trial only' },
        { name: 'Figma integration', us: true, them: true },
        { name: 'API access', us: true, them: false },
        { name: 'Team collaboration', us: true, them: 'Basic' },
      ],
    },
  ],
};

export default function CompareVsPlaybook() {
  return (
    <>
      <Helmet>
        <title>User Ninjas vs Playbook UX (Lyssna) — Full Comparison 2026</title>
        <meta name="description" content="User Ninjas vs Playbook UX: which UX research tool gives you deeper insights? Feature comparison, pricing, and tester panel analysis." />
      </Helmet>
      <ComparePageTemplate {...data} />
    </>
  );
}
