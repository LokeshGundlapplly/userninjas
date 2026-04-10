import { Check, X } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const competitors = ['User Ninjas', 'UserTesting', 'Userlytics', 'Trymata'];

const comparisons = [
  { feature: 'Starting Price', values: ['$49/mo', '$200+/mo', '$149/mo', '$100/mo'] },
  { feature: 'Avg. Turnaround', values: ['<24 hours', '3–5 days', '2–3 days', '2–3 days'] },
  { feature: 'AI-Powered Insights', values: [true, true, false, false] },
  { feature: 'Video Recordings', values: [true, true, true, true] },
  { feature: 'Simple Dashboard', values: [true, false, false, false] },
  { feature: 'In-Browser Recording', values: [true, false, false, false] },
  { feature: 'Custom Tester Targeting', values: [true, true, true, false] },
  { feature: 'Free Trial (No CC)', values: [true, false, true, true] },
  { feature: 'Recruiter-Friendly UX', values: [true, false, false, false] },
  { feature: 'Survey Builder', values: [true, true, false, false] },
];

function CellValue({ value, highlight }: { value: boolean | string; highlight?: boolean }) {
  if (typeof value === 'string') {
    return <span className={`text-sm font-semibold ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</span>;
  }
  if (value) {
    return (
      <div className="flex justify-center">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${highlight ? 'bg-primary text-primary-foreground' : 'bg-accent/15 text-accent'}`}>
          <Check className="w-3 h-3" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <X className="w-4 h-4 text-muted-foreground/30" />
    </div>
  );
}

export default function ComparisonTable() {
  return (
    <section className="py-28 bg-secondary/10">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">Why User Ninjas</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
              See how we{' '}
              <span className="text-gradient">stack up</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Faster turnaround, lower pricing, simpler UI — and the only platform with AI analysis built in from day one.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={150}>
          <div className="max-w-4xl mx-auto rounded-2xl border border-border/50 bg-card overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40 bg-secondary/30">
                    <th className="text-left py-5 px-5 text-sm font-semibold text-muted-foreground w-48">Feature</th>
                    {competitors.map((name, i) => (
                      <th key={name} className={`py-5 px-5 text-center ${i === 0 ? 'bg-primary/8' : ''}`}>
                        {i === 0 ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-wider">
                              ★ Best
                            </span>
                            <span className="font-display text-sm font-bold text-primary">{name}</span>
                          </div>
                        ) : (
                          <span className="font-display text-sm font-medium text-muted-foreground">{name}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((row, rowIndex) => (
                    <tr
                      key={row.feature}
                      className="border-t border-border/30 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="py-3.5 px-5 text-sm font-medium text-foreground">{row.feature}</td>
                      {row.values.map((value, i) => (
                        <td key={i} className={`py-3.5 px-5 text-center ${i === 0 ? 'bg-primary/5' : ''}`}>
                          <CellValue value={value} highlight={i === 0} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
