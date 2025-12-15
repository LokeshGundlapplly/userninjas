import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';
import NinjaLogo from './NinjaLogo';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'For Clients', href: '/#for-clients' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Integrations', href: '/#' },
  ],
  Resources: [
    { label: 'Documentation', href: '/#' },
    { label: 'FAQs', href: '/#' },
    { label: 'API Reference', href: '/#' },
    { label: 'Community', href: '/#' },
    { label: 'Blog', href: '/#' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/#' },
    { label: 'Legal', href: '/#' },
    { label: 'Contact', href: '/contact' },
  ],
};

const contactInfo = [
  { icon: MapPin, text: 'Hyderabad, Hightech city 5006167' },
  { icon: Mail, text: 'support@userninjas.com' },
  { icon: Phone, text: '+91 9618495013' },
];

export default function Footer() {
  return (
    <footer className="bg-secondary/50 border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <NinjaLogo className="mb-4" />
            <p className="text-sm text-muted-foreground">
              Elite user research for product teams that move fast.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-bold mb-4">{title}</h4>
              <ul className="space-y-3">
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

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold mb-4">Contact</h4>
            <ul className="space-y-3">
              {contactInfo.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <item.icon className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 User Ninjas. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
