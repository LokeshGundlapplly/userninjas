import { Link } from 'react-router-dom';
import NinjaLogo from './NinjaLogo';
import ScrollReveal from './ScrollReveal';
import { ArrowUpRight } from 'lucide-react';

const footerColumns = {
  Product: ['Features', 'Templates', 'Pricing', 'Integrations'],
  Company: ['About', 'Careers', 'Blog', 'Press'],
  Resources: ['Documentation', 'Community', 'Changelog', 'Contact'],
  Legal: ['Privacy', 'Terms', 'Cookies'],
};

const linkMap: Record<string, string> = {
  Features: '/features',
  Templates: '/templates',
  Pricing: '/#pricing',
  Integrations: '/integrations',
  About: '/about',
  Careers: '/careers',
  Blog: '/blog',
  Press: '/press',
  Documentation: '/docs',
  Community: '/community',
  Changelog: '/changelog',
  Contact: '/contact',
  Privacy: '/privacy',
  Terms: '/terms',
  Cookies: '/cookies',
};

export default function Footer() {
  return (
    <footer className="relative bg-[#0F172A] border-t border-slate-800/80 mt-20 overflow-hidden text-slate-400">
      {/* Gradient accent line at top */}
      <div className="gradient-line" />

      {/* Aurora glow backgrounds */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.15] pointer-events-none" />

      <div className="app-shell py-16 relative z-10">
        <ScrollReveal animation="fade-up">
          <div className="grid gap-12 md:grid-cols-6 lg:grid-cols-12">
            {/* Brand column */}
            <div className="md:col-span-3 lg:col-span-4">
              <NinjaLogo className="mb-5" dark />
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6">
                The modern UX research platform. Test with real users, get AI-powered insights, and ship better products — faster.
              </p>
              <div className="flex items-center gap-3">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 hover:bg-gradient-to-br hover:from-primary hover:to-indigo-600 hover:text-white hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 hover:bg-gradient-to-br hover:from-primary hover:to-indigo-600 hover:text-white hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 hover:bg-gradient-to-br hover:from-primary hover:to-indigo-600 hover:text-white hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerColumns).map(([title, links]) => (
              <div key={title} className="md:col-span-1 lg:col-span-2">
                <h4 className="text-sm font-semibold bg-clip-text bg-gradient-to-r from-slate-100 to-slate-200 text-transparent mb-4">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map((label) => (
                    <li key={label} className="flex items-center gap-1.5">
                      <Link
                        to={linkMap[label]}
                        className="group inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors duration-200"
                      >
                        {label}
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 translate-y-0.5 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-200" />
                      </Link>
                      {label === 'Templates' && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider scale-90 origin-left">New</span>
                      )}
                      {label === 'Careers' && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider scale-90 origin-left">Hiring</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <div className="mt-14 pt-8">
          <div className="section-fade-divider mb-8" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} UserNinjas. All rights reserved.
            </p>
            <p className="text-xs text-slate-500">
              Built with care for research teams worldwide.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
