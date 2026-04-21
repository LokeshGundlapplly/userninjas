import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import { Helmet } from 'react-helmet-async';
import { Cookie, CheckCircle2, XCircle, ToggleLeft, Settings } from 'lucide-react';

interface CookieType {
  id: string;
  name: string;
  required: boolean;
  description: string;
  examples: string;
  duration: string;
}

const cookieTypes: CookieType[] = [
  {
    id: 'essential',
    name: 'Essential Cookies',
    required: true,
    description: 'These cookies are strictly necessary for the Platform to function. They enable core features such as authentication, security, and session management. The Platform cannot function properly without them.',
    examples: 'Authentication token, CSRF token, session ID, consent preferences',
    duration: 'Session to 1 year',
  },
  {
    id: 'functional',
    name: 'Functional Cookies',
    required: false,
    description: 'These cookies enable enhanced functionality and personalisation. They remember your preferences, settings, and choices to provide a more consistent experience across visits.',
    examples: 'Theme preference (light/dark), language setting, timezone, collapsed sidebar state',
    duration: '1 year',
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    required: false,
    description: 'These cookies collect anonymised information about how you use the Platform. We use this data to understand feature usage, improve the product, and fix bugs. All data is aggregated and cannot be linked to you personally.',
    examples: 'Page views, feature click counts, session duration, error tracking',
    duration: '13 months',
  },
  {
    id: 'marketing',
    name: 'Marketing Cookies',
    required: false,
    description: 'These optional cookies allow us to show you relevant advertising on other websites and measure the effectiveness of our marketing campaigns. We do not share this data with third-party advertisers for their own targeting purposes.',
    examples: 'UTM campaign tracking, conversion pixel, retargeting identifier',
    duration: '90 days',
  },
];

const thirdParties = [
  { name: 'Stripe', purpose: 'Payment processing', policy: 'https://stripe.com/privacy', category: 'Essential' },
  { name: 'Supabase', purpose: 'Database & authentication', policy: 'https://supabase.com/privacy', category: 'Essential' },
  { name: 'Cloudflare', purpose: 'CDN & security', policy: 'https://cloudflare.com/privacypolicy/', category: 'Essential' },
  { name: 'PostHog', purpose: 'Privacy-first analytics', policy: 'https://posthog.com/privacy', category: 'Analytics' },
  { name: 'Sentry', purpose: 'Error monitoring', policy: 'https://sentry.io/privacy/', category: 'Analytics' },
];

export default function Cookies() {
  const [preferences, setPreferences] = useState({ functional: true, analytics: false, marketing: false });

  return (
    <>
      <Helmet>
        <title>Cookie Policy - User Ninjas</title>
        <meta name="description" content="User Ninjas Cookie Policy. Learn about the cookies we use, why we use them, and how to manage your preferences." />
      </Helmet>
      <Background3D />
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-5">
              <Cookie className="w-3.5 h-3.5" /> Legal
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">Cookie Policy</h1>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              We use cookies to make User Ninjas work well, analyse usage, and personalise your experience.
            </p>
            <p className="text-xs text-muted-foreground mt-4">Last updated: April 10, 2026 · Effective: April 10, 2026</p>
          </div>

          {/* Intro */}
          <div className="rounded-2xl bg-card border border-border/60 p-7 mb-10">
            <h2 className="font-display font-bold text-lg mb-3">What are cookies?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently, remember your preferences, and provide reporting information.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              User Ninjas uses both first-party cookies (set by us directly) and third-party cookies (set by partners). You can manage your non-essential cookie preferences below or via your browser settings.
            </p>
          </div>

          {/* Cookie types */}
          <h2 className="font-display text-2xl font-bold mb-6">Types of Cookies We Use</h2>
          <div className="space-y-5 mb-12">
            {cookieTypes.map((type) => (
              <div key={type.id} className="rounded-2xl bg-card border border-border/60 overflow-hidden">
                <div className="flex items-center justify-between p-5 pb-4">
                  <div className="flex items-center gap-3">
                    <Cookie className="w-4 h-4 text-primary" />
                    <h3 className="font-display font-bold">{type.name}</h3>
                    {type.required && (
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">Always Active</span>
                    )}
                  </div>
                  {type.required ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, [type.id]: !prev[type.id as keyof typeof prev] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        preferences[type.id as keyof typeof preferences] ? 'bg-primary' : 'bg-secondary'
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        preferences[type.id as keyof typeof preferences] ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  )}
                </div>
                <div className="px-5 pb-5 border-t border-border/40 pt-4">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{type.description}</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                    <span><strong className="text-foreground/70">Examples:</strong> {type.examples}</span>
                    <span><strong className="text-foreground/70">Duration:</strong> {type.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Preference save */}
          <div className="rounded-2xl bg-primary/5 border border-primary/15 p-6 mb-12 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-primary" />
              <p className="text-sm font-medium">Save your cookie preferences</p>
            </div>
            <button className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              Save Preferences
            </button>
          </div>

          {/* Third parties */}
          <h2 className="font-display text-2xl font-bold mb-6">Third-Party Cookies</h2>
          <div className="rounded-2xl bg-card border border-border/60 overflow-hidden mb-12">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/40">
                  <th className="text-left px-5 py-3 font-semibold">Provider</th>
                  <th className="text-left px-5 py-3 font-semibold">Purpose</th>
                  <th className="text-left px-5 py-3 font-semibold">Category</th>
                  <th className="text-left px-5 py-3 font-semibold">Privacy</th>
                </tr>
              </thead>
              <tbody>
                {thirdParties.map((tp, i) => (
                  <tr key={tp.name} className={i % 2 === 0 ? '' : 'bg-secondary/10'}>
                    <td className="px-5 py-3 font-medium">{tp.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{tp.purpose}</td>
                    <td className="px-5 py-3"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{tp.category}</span></td>
                    <td className="px-5 py-3"><a href={tp.policy} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">View policy</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Managing cookies */}
          <div className="rounded-2xl bg-card border border-border/60 p-7 mb-10">
            <div className="flex items-center gap-3 mb-4">
              <ToggleLeft className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-lg">Managing Cookies via Your Browser</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              You can also control cookies via your browser settings. Note that disabling essential cookies will prevent you from logging in.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'Chrome', url: 'https://support.google.com/chrome/answer/95647' },
                { name: 'Firefox', url: 'https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer' },
                { name: 'Safari', url: 'https://support.apple.com/en-gb/guide/safari/sfri11471/mac' },
                { name: 'Edge', url: 'https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09' },
              ].map(b => (
                <a key={b.name} href={b.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-3 py-2 rounded-xl bg-secondary/50 hover:bg-secondary text-sm font-medium transition-colors text-center">
                  {b.name}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-2xl bg-primary/5 border border-primary/15 p-8 text-center">
            <h3 className="font-display text-lg font-bold mb-2">Cookie questions?</h3>
            <p className="text-sm text-muted-foreground mb-4">Contact our privacy team for any questions about our cookie practices.</p>
            <a href="mailto:privacy@userninjas.in" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              privacy@userninjas.in
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
