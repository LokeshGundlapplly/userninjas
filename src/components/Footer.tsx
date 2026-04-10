import { useState } from 'react';
import { Link } from 'react-router-dom';
import NinjaLogo from './NinjaLogo';
import { Twitter, Linkedin, Github, Mail, Shield, Award, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Research Methods', href: '/#research-methods' },
    { label: 'Integrations', href: '/integrations' },
    { label: 'Changelog', href: '/changelog' },
  ],
  Resources: [
    { label: 'UX Research Blog', href: '/blog' },
    { label: 'Templates Library', href: '/templates' },
    { label: 'Research Glossary', href: '/glossary' },
    { label: 'Community', href: '/community' },
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/docs' },
  ],
  Compare: [
    { label: 'vs Maze', href: '/compare/vs-maze' },
    { label: 'vs UserTesting', href: '/compare/vs-usertesting' },
    { label: 'vs Playbook UX', href: '/compare/vs-playbook' },
    { label: 'vs UXtweak', href: '/compare/vs-uxtweak' },
    { label: 'vs Lookback', href: '/compare/vs-lookback' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press Kit', href: '/press' },
    { label: 'Legal', href: '/privacy' },
  ],
  Account: [
    { label: 'Sign Up Free', href: '/auth' },
    { label: 'Login', href: '/auth' },
    { label: 'Recruiter Dashboard', href: '/recruiter' },
    { label: 'Tester Dashboard', href: '/tester' },
    { label: 'Join as Tester', href: '/auth' },
  ],
};

const trustBadges = [
  { icon: Shield, label: 'SOC 2 Type II' },
  { icon: Lock, label: 'GDPR Compliant' },
  { icon: Award, label: 'G2 Leader 2026' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="border-t border-border/30 pt-16 pb-8">
      <div className="container mx-auto px-4">

        {/* Newsletter bar */}
        <div className="rounded-2xl bg-card border border-border/50 p-6 md:p-8 mb-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="font-display font-bold text-base mb-1">Stay sharp on UX research</h3>
            <p className="text-sm text-muted-foreground">Weekly tips, templates, and research case studies. No spam, ever.</p>
          </div>
          {subscribed ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">✓</span>
              You're subscribed!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email"
                required
                className="flex-1 md:w-64 h-10 px-4 rounded-xl bg-background border border-border/60 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              />
              <Button type="submit" size="sm" className="h-10 px-5 rounded-xl gap-1.5 shrink-0">
                Subscribe <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-7 gap-10 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2">
            <NinjaLogo className="mb-5" />
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-5">
              The fastest, most affordable way to test your product with real users and get actionable insights in hours, not weeks.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/60 text-xs text-muted-foreground">
                  <badge.icon className="w-3 h-3 text-primary shrink-0" />
                  {badge.label}
                </div>
              ))}
            </div>

            <div className="flex gap-2.5">
              {[
                { Icon: Twitter, href: '#', label: 'Twitter' },
                { Icon: Linkedin, href: '#', label: 'LinkedIn' },
                { Icon: Github, href: '#', label: 'GitHub' },
                { Icon: Mail, href: 'mailto:hello@userninjas.io', label: 'Email' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-sm mb-4 text-foreground">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors link-underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} User Ninjas. All rights reserved. Built for research-driven product teams.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
