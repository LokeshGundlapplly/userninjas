import { Check, X, Minus } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const competitors = ['User Ninjas', 'UserTesting', 'Userlytics', 'Trymata'];

const comparisons = [
  { feature: 'Starting Price', values: ['$49/mo', '$200+/mo', '$149/mo', '$100/mo'] },
  { feature: 'Avg. Turnaround', values: ['24 hours', '3-5 days', '2-3 days', '2-3 days'] },
  { feature: 'AI-Powered Insights', values: [true, true, false, false] },
  { feature: 'Video Recordings', values: [true, true, true, true] },
  { feature: 'Simple Dashboard', values: [true, false, false, false] },
  { feature: 'In-Browser Recording', values: [true, false, false, false] },
  { feature: 'Custom Tester Targeting', values: [true, true, true, false] },
  { feature: 'Free Trial (No CC)', values: [true, false, true, true] },
  { feature: 'Recruiter-Friendly UX', values: [true, false, false, false] },
  { feature: 'Survey Builder', values: [true, true, false, false] },
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span className="text-sm font-medium">{value}</span>;
  }
  if (value) {
    return <Check className="w-4 h-4 text-success mx-auto" />;
  }
  return <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
}

export default function ComparisonTable() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Compare</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              See how we stack up
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Faster turnaround, lower pricing, simpler UI, and a better experience.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={150}>
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Feature</th>
                  {competitors.map((name, i) => (
                    <th key={name} className={`py-4 px-4 text-center text-sm font-display font-bold ${
                      i === 0 ? 'text-primary' : 'text-foreground'
                    }`}>
                      {i === 0 && <div className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-1">★</div>}
                      <div>{name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, rowIndex) => (
                  <tr key={row.feature} className={`border-t border-border/40 ${rowIndex % 2 === 0 ? 'bg-secondary/20' : ''}`}>
                    <td className="py-3.5 px-4 text-sm text-foreground">{row.feature}</td>
                    {row.values.map((value, i) => (
                      <td key={i} className={`py-3.5 px-4 text-center ${i === 0 ? 'bg-primary/5' : ''}`}>
                        <CellValue value={value} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
