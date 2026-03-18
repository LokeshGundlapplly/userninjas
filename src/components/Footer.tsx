import { Link } from 'react-router-dom';
import NinjaLogo from './NinjaLogo';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'For Clients', href: '/#for-clients' },
    { label: 'Integrations', href: '/#' },
  ],
  Resources: [
    { label: 'Documentation', href: '/#' },
    { label: 'FAQs', href: '/#' },
    { label: 'API Reference', href: '/#' },
    { label: 'Blog', href: '/#' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/#' },
    { label: 'Legal', href: '/#' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border/40 py-14 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Logo & Description */}
          <div className="col-span-2">
            <NinjaLogo className="mb-4" />
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Elite user research for product teams that move fast. Get insights in hours, not weeks.
            </p>
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
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} User Ninjas. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
