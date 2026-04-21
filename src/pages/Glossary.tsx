import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import ScrollReveal from '@/components/ScrollReveal';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Search, ChevronRight } from 'lucide-react';

interface Term {
  term: string;
  definition: string;
  category?: string;
}

const glossaryData: Record<string, Term[]> = {
  A: [
    { term: 'A/B Testing', definition: 'A method of comparing two versions of a product or feature (A and B) with real users to determine which performs better against a specific metric. Also known as split testing.', category: 'Quantitative' },
    { term: 'Affinity Mapping', definition: 'A bottom-up synthesis method where researchers group observations, ideas, or data points into clusters based on natural relationships and patterns to identify themes.', category: 'Analysis' },
    { term: 'Axial Coding', definition: 'A qualitative data analysis technique from grounded theory where researchers identify relationships between codes by examining conditions, actions, and consequences.', category: 'Analysis' },
  ],
  B: [
    { term: 'Baseline Usability Study', definition: 'An initial usability evaluation conducted before a redesign or product launch to establish benchmark performance metrics for comparison in future studies.', category: 'Testing' },
    { term: 'Think-Aloud Protocol', definition: 'A data-collection method where participants verbally narrate their thoughts, actions, and feelings as they complete tasks during a usability session.', category: 'Methods' },
  ],
  C: [
    { term: 'Card Sorting', definition: 'A UX research method in which participants organise topics or items into groups that make sense to them. Used to inform information architecture and navigation design.', category: 'Methods' },
    { term: 'Click Testing', definition: 'A method that presents users with a design and asks them where they would click to complete a task. Reveals navigation assumptions and label effectiveness.', category: 'Methods' },
    { term: 'Cognitive Walkthrough', definition: 'An expert evaluation method where evaluators step through tasks from the user\'s perspective to identify usability problems, particularly for new or infrequent users.', category: 'Evaluation' },
    { term: 'Contextual Inquiry', definition: 'A user research method combining observation and interviewing where the researcher observes participants in their natural environment while they perform real tasks.', category: 'Methods' },
  ],
  D: [
    { term: 'Desirability Testing', definition: 'A research technique that assesses users\' emotional and aesthetic responses to a design by asking them to choose adjectives that best describe their experience.', category: 'Testing' },
    { term: 'Diary Study', definition: 'A longitudinal research method in which participants self-report experiences, behaviours, and thoughts over an extended period using structured daily or event-triggered entries.', category: 'Methods' },
  ],
  E: [
    { term: 'Eye Tracking', definition: 'A biometric research technique that records where users look on a screen, producing heatmaps and gaze paths that reveal attention patterns and visual hierarchy effectiveness.', category: 'Biometric' },
    { term: 'Error Rate', definition: 'A usability metric measuring how often participants make mistakes when completing a task. High error rates indicate design confusion or poor feedback.', category: 'Metrics' },
  ],
  F: [
    { term: 'First Click Testing', definition: 'A research method measuring the first place a participant clicks when trying to complete a task. Studies show that users who click correctly first complete tasks at much higher rates.', category: 'Testing' },
    { term: 'Formative Research', definition: 'Research conducted during development to shape and improve a design. Typically iterative and diagnostic, focusing on identifying problems rather than measuring performance.', category: 'Research Types' },
  ],
  G: [
    { term: 'Guerrilla UX Testing', definition: 'Informal, low-cost usability testing conducted in public spaces with recruited participants. Quick and inexpensive, but lacks precision in participant targeting.', category: 'Testing' },
  ],
  H: [
    { term: 'Heuristic Evaluation', definition: 'An expert usability review where evaluators examine an interface against established usability principles (heuristics) to identify design problems.', category: 'Evaluation' },
    { term: 'Heat Map', definition: 'A data visualisation technique using colour gradients to show where users focus attention (eye tracking), click, scroll, or move their cursor on a page.', category: 'Analysis' },
  ],
  I: [
    { term: 'Information Architecture (IA)', definition: 'The structural design of shared information environments, including how content is organised, labelled, searched, and navigated. Influences how easily users find information.', category: 'Design' },
    { term: 'Iterative Design', definition: 'A design methodology based on continuously improving a design through repeated cycles of prototyping, testing, and refinement based on user feedback.', category: 'Process' },
  ],
  J: [
    { term: 'Jobs-to-be-Done (JTBD)', definition: 'A theory of user motivation that focuses on the "job" a user is trying to accomplish rather than demographic attributes. Used to understand progress-driving motivations.', category: 'Frameworks' },
  ],
  K: [
    { term: 'KPI (Key Performance Indicator)', definition: 'Measurable metrics used to evaluate success of research goals, such as task completion rate, time-on-task, error rate, or System Usability Scale (SUS) scores.', category: 'Metrics' },
  ],
  L: [
    { term: 'Lean UX', definition: 'A design approach that emphasises collaboration, rapid iteration, and validated learning over extensive up-front documentation. Closely aligned with Agile development.', category: 'Process' },
    { term: 'Likert Scale', definition: 'A psychometric scale commonly used in questionnaires where respondents indicate their level of agreement or satisfaction on a 5 or 7-point scale.', category: 'Measurement' },
  ],
  M: [
    { term: 'Moderated Testing', definition: 'A usability testing format where a researcher (moderator) guides participants through tasks in real time, asking follow-up questions and observing reactions live.', category: 'Testing' },
    { term: 'Mental Model', definition: 'A user\'s internal representation of how something works, formed from prior experiences and expectations. When designs match users\' mental models, they feel intuitive.', category: 'Cognitive' },
  ],
  N: [
    { term: 'Net Promoter Score (NPS)', definition: 'A loyalty metric that asks one question: "How likely are you to recommend this to a friend?" Responses classify users as Promoters (9–10), Passives (7–8), or Detractors (0–6).', category: 'Metrics' },
    { term: 'Needfinding', definition: 'A user research process focused on discovering user needs, motivations, and frustrations through observation, interviews, and empathetic engagement.', category: 'Methods' },
  ],
  O: [
    { term: 'Open Card Sort', definition: 'A card sorting variant where participants create their own category names and group items freely, revealing their natural mental model for organising content.', category: 'Methods' },
  ],
  P: [
    { term: 'Persona', definition: 'A semi-fictional character representing a segment of target users, synthesised from real research data. Used to communicate user needs and guide design decisions.', category: 'Frameworks' },
    { term: 'Prototype Testing', definition: 'Evaluating user interactions with a prototype — ranging from paper sketches to high-fidelity Figma/InVision mockups — before building the production product.', category: 'Testing' },
  ],
  Q: [
    { term: 'Qualitative Research', definition: 'Research methods that collect non-numerical data to understand user behaviours, motivations, and mental models. Examples: interviews, observations, diary studies.', category: 'Research Types' },
    { term: 'Quantitative Research', definition: 'Research methods that collect numerical data to measure and compare user behaviours at scale. Examples: surveys, A/B tests, analytics analysis, task metrics.', category: 'Research Types' },
  ],
  R: [
    { term: 'Remote Usability Testing', definition: 'Usability testing conducted when participants and researchers are in different locations, either moderated (via video call) or unmoderated (via testing platform like User Ninjas).', category: 'Testing' },
    { term: 'Research Repository', definition: 'A centralised, searchable store of all past research artefacts, insights, recordings, and findings. Promotes reuse and prevents duplicate research.', category: 'Process' },
  ],
  S: [
    { term: 'Screener', definition: 'A set of qualifying questions used during tester recruitment to ensure participants match specific criteria (demographics, behaviour, experience) required for a study.', category: 'Recruitment' },
    { term: 'System Usability Scale (SUS)', definition: 'A standardised 10-item questionnaire that measures perceived usability. Scores above 68 indicate above-average usability. The industry\'s most widely cited usability metric.', category: 'Metrics' },
    { term: 'Sentiment Analysis', definition: 'Automated processing of verbal or textual data to identify emotional tone — positive, negative, or neutral — in participant responses using NLP models.', category: 'Analysis' },
  ],
  T: [
    { term: 'Task Completion Rate', definition: 'The percentage of users who successfully complete a defined task. A core usability metric — typically 78%+ is considered acceptable for critical task flows.', category: 'Metrics' },
    { term: 'Think-Aloud Protocol', definition: 'A data-collection technique where participants narrate their thoughts aloud as they complete tasks, providing insight into thought processes and confusion points.', category: 'Methods' },
    { term: 'Tree Testing', definition: 'A technique for evaluating the findability of topics in a website by asking participants to navigate a text-only hierarchy (tree) to find specific items.', category: 'Methods' },
  ],
  U: [
    { term: 'Unmoderated Testing', definition: 'Remote usability testing where participants complete tasks without a live moderator. Responses are recorded automatically and analysed after the session.', category: 'Testing' },
    { term: 'User Journey Map', definition: 'A visualisation of the entire experience a user has with a product or service, from initial awareness through post-use reflection, highlighting touchpoints and emotions.', category: 'Frameworks' },
    { term: 'Usability', definition: 'The extent to which a product can be used by specified users to achieve specified goals with effectiveness, efficiency, and satisfaction in a specified context (ISO 9241-11).', category: 'Core Concepts' },
  ],
  V: [
    { term: 'Voice of the Customer (VoC)', definition: 'Research programmes that capture customers\' spoken and unspoken expectations through surveys, interviews, and feedback analysis to guide product development.', category: 'Methods' },
  ],
  W: [
    { term: 'Wizard of Oz Testing', definition: 'A prototyping technique where a human manually simulates system responses in real time to test a concept before the technology exists, creating the illusion of a working system.', category: 'Methods' },
  ],
};

const categoryColors: Record<string, string> = {
  Methods: 'bg-primary/8 text-primary',
  Testing: 'bg-emerald-500/10 text-emerald-600',
  Analysis: 'bg-violet-500/10 text-violet-600',
  Metrics: 'bg-amber-500/10 text-amber-600',
  Evaluation: 'bg-blue-500/10 text-blue-600',
  Frameworks: 'bg-rose-500/10 text-rose-600',
  'Research Types': 'bg-teal-500/10 text-teal-600',
  Recruitment: 'bg-orange-500/10 text-orange-600',
  'Core Concepts': 'bg-indigo-500/10 text-indigo-600',
};

export default function Glossary() {
  const [search, setSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const letters = Object.keys(glossaryData).sort();

  const filtered = letters.reduce<Record<string, Term[]>>((acc, letter) => {
    const terms = glossaryData[letter].filter(t =>
      t.term.toLowerCase().includes(search.toLowerCase()) || t.definition.toLowerCase().includes(search.toLowerCase())
    );
    if (terms.length > 0 && (!activeLetter || letter === activeLetter)) {
      acc[letter] = terms;
    }
    return acc;
  }, {});

  const totalTerms = Object.values(glossaryData).flat().length;

  return (
    <>
      <Helmet>
        <title>UX Research Glossary - User Ninjas</title>
        <meta name="description" content="The definitive UX research glossary. Clear definitions for every term in user research, usability, and product design." />
      </Helmet>
      <Background3D />
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-5">
                <BookOpen className="w-3.5 h-3.5" /> Resources
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                UX Research <span className="text-gradient">Glossary</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-2">
                Clear, expert definitions for {totalTerms}+ research, design, and usability terms.
              </p>
            </div>
          </ScrollReveal>

          <div className="max-w-4xl mx-auto">
            {/* Search */}
            <ScrollReveal animation="fade-up" delay={100}>
              <div className="relative mb-6">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search terms..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-card border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </ScrollReveal>

            {/* Alphabet nav */}
            <ScrollReveal animation="fade-up" delay={120}>
              <div className="flex flex-wrap gap-1.5 mb-10">
                <button
                  onClick={() => setActiveLetter(null)}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${!activeLetter ? 'bg-primary text-primary-foreground' : 'bg-secondary/60 text-muted-foreground hover:bg-secondary'}`}
                >
                  All
                </button>
                {letters.map(l => (
                  <button
                    key={l}
                    onClick={() => setActiveLetter(activeLetter === l ? null : l)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${activeLetter === l ? 'bg-primary text-primary-foreground' : 'bg-secondary/60 text-muted-foreground hover:bg-secondary'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </ScrollReveal>

            {/* Terms */}
            <div className="space-y-10">
              {Object.entries(filtered).map(([letter, terms]) => (
                <div key={letter} id={`letter-${letter}`}>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-display font-bold text-lg text-primary-foreground">{letter}</span>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>
                  <div className="space-y-4">
                    {terms.map(term => (
                      <div key={term.term} className="p-5 rounded-xl bg-card border border-border/60 hover:border-primary/20 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-display font-bold text-base">{term.term}</h3>
                          {term.category && (
                            <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[term.category] ?? 'bg-secondary text-muted-foreground'}`}>
                              {term.category}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{term.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(filtered).length === 0 && (
                <p className="text-center text-muted-foreground py-12">No terms found for "{search}".</p>
              )}
            </div>

            {/* Suggest a term */}
            <ScrollReveal animation="fade-up">
              <div className="mt-14 rounded-2xl bg-card border border-border/60 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">Missing a term?</h3>
                  <p className="text-sm text-muted-foreground">Suggest a UX term you'd like added to the glossary.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0">
                  Suggest a term <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
