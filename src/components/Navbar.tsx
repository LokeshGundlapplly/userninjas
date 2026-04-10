import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import NinjaLogo from './NinjaLogo';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { href: '/#how-it-works', label: 'How it Works' },
  { href: '/features', label: 'Features' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const recruiterNavLinks = [
  { href: '/recruiter', label: 'Overview' },
  { href: '/recruiter#tests', label: 'My Tests' },
  { href: '/recruiter#submissions', label: 'Submissions' },
  { href: '/recruiter#analytics', label: 'Analytics' },
];

const testerNavLinks = [
  { href: '/tester', label: 'Overview' },
  { href: '/tester#available', label: 'Available Tests' },
  { href: '/tester#submissions', label: 'My Tests' },
  { href: '/tester#earnings', label: 'Earnings' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, role, signOut, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'py-2'
        : 'py-3'
    }`}>
      <div className="container mx-auto px-4">
        <div className={`transition-all duration-300 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-xl border border-border/50 shadow-lg shadow-black/5 rounded-2xl px-4'
            : 'bg-transparent px-0'
        }`}>
          <nav className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center">
              <NinjaLogo />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-0.5">
              {user && role ? (
                // Dashboard nav links based on role
                (role === 'recruiter' ? recruiterNavLinks : testerNavLinks).map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl hover:bg-secondary/60 transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                ))
              ) : (
                // Public landing page links
                navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl hover:bg-secondary/60 transition-all duration-200"
                  >
                    {link.label}
                  </a>
                ))
              )}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle />
              {loading ? (
                <div className="h-8 w-20 bg-muted animate-pulse rounded-lg" />
              ) : user ? (
                <>
                  {role && (
                    <Link to={role === 'tester' ? '/tester' : '/recruiter'}>
                      <Button variant="ghost" size="sm" className="gap-2 text-sm">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/60 text-sm text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span className="capitalize">{role || 'User'}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 text-muted-foreground text-sm">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" size="sm" className="text-sm font-medium">Log In</Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold px-5 shadow-md shadow-primary/20">
                      Get Started Free
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-1">
              <ThemeToggle />
              <button
                className="p-2 rounded-xl hover:bg-secondary/60 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-2 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
            <div className="p-3 flex flex-col gap-1">
              {(user && role
                ? (role === 'recruiter' ? recruiterNavLinks : testerNavLinks)
                : navLinks
              ).map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-xl hover:bg-secondary/60 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-border/40">
                {user ? (
                  <>
                    {role && (
                      <Link to={role === 'tester' ? '/tester' : '/recruiter'} onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full gap-2 rounded-xl">
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                    )}
                    <Button variant="outline" className="w-full gap-2 rounded-xl" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl">Log In</Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button className="w-full rounded-xl bg-primary text-primary-foreground">
                        Get Started Free
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
