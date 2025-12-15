import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import { Helmet } from 'react-helmet-async';

const stats = [
  { value: '120K+', label: 'Verified Testers' },
  { value: '150+', label: 'Countries' },
  { value: '4,000+', label: 'Product Teams' },
  { value: '99.9%', label: 'Uptime' },
];

export default function About() {
  return (
    <>
      <Helmet>
        <title>About - User Ninjas</title>
        <meta name="description" content="Learn about User Ninjas - the elite user research platform trusted by 4,000+ product teams worldwide." />
      </Helmet>

      <Background3D />
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
              About User Ninjas
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're on a mission to make user research accessible, fast, and actionable for product teams of all sizes.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center p-6 rounded-2xl bg-card border border-border opacity-0 animate-fade-in"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <p className="font-display text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Story */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-2xl border border-border p-8 md:p-12 opacity-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <h2 className="font-display text-2xl font-bold mb-6">Our Story</h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground space-y-4">
                <p>
                  User Ninjas was founded with a simple belief: every product team deserves access to real user insights, without the enterprise price tag or lengthy timelines.
                </p>
                <p>
                  We built a platform that connects researchers with our global panel of over 120,000 verified testers, enabling teams to gather actionable feedback in hours instead of weeks.
                </p>
                <p>
                  Our AI-powered analysis tools automatically extract sentiment, generate highlights, and surface the insights that matter most—so you can focus on building products people love.
                </p>
                <p>
                  Today, we're trusted by 4,000+ product teams at companies of all sizes, from ambitious startups to Fortune 500 enterprises.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
