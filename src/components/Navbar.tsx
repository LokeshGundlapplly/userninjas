import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import NinjaLogo from './NinjaLogo';
import ThemeToggle from './ThemeToggle';

const publicLinks = [
  { href: '/features', label: 'Features' },
  { href: '/templates', label: 'Templates' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

const recruiterNavLinks = [
  { href: '/recruiter', label: 'Dashboard' },
  { href: '/recruiter#tests', label: 'Tests' },
  { href: '/recruiter#analytics', label: 'Analytics' },
  { href: '/recruiter#submissions', label: 'Submissions' },
];

const testerNavLinks = [
  { href: '/tester', label: 'Dashboard' },
  { href: '/tester#available', label: 'Available Tests' },
  { href: '/tester#earnings', label: 'Earnings' },
  { href: '/tester/profile', label: 'Profile' },
];

const adminNavLinks = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin#tests', label: 'Tests & Postings' },
  { href: '/admin#users', label: 'Users' },
  { href: '/admin#chats', label: 'Support' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, role, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = user && role
    ? role === 'admin'
      ? adminNavLinks
      : role === 'recruiter'
        ? recruiterNavLinks
        : testerNavLinks
    : publicLinks;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ease-out ${
        scrolled
          ? 'bg-background/70 backdrop-blur-2xl border-b border-border/40 shadow-sm shadow-primary/[0.03]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="app-shell">
        <nav className="h-16 flex items-center justify-between">
          <Link to="/" className="shrink-0">
            <NinjaLogo />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg link-underline ${
                    isActive
                      ? 'text-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            <ThemeToggle />
            {loading ? (
              <div className="h-9 w-24 rounded-full bg-secondary animate-pulse" />
            ) : user ? (
              <>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary border border-primary/20 transition-all duration-200 hover:bg-primary/15">
                  <User className="h-3.5 w-3.5" />
                  <span className="capitalize">{role || 'user'}</span>
                </div>
                <Button variant="ghost" size="sm" className="rounded-full text-xs hover:bg-destructive/10 hover:text-destructive transition-all duration-200" onClick={handleSignOut}>
                  <LogOut className="mr-1 h-3.5 w-3.5" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="rounded-full text-sm px-5 hover:bg-primary/5 transition-all duration-200">
                    Log in
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="rounded-full text-sm px-5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 btn-shimmer">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
            onClick={() => setIsOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <div className="relative w-5 h-5">
              <Menu className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${isOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
              <X className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} />
            </div>
          </button>
        </nav>
      </div>

      {/* Mobile menu with slide animation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-400 ease-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="app-shell py-3 flex flex-col gap-1 stagger-children">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="rounded-xl px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <div className="pt-3 mt-1 border-t border-border/50 flex flex-col gap-2">
              <div className="flex justify-center pb-1">
                <ThemeToggle />
              </div>
              {user ? (
                <Button variant="secondary" className="rounded-full transition-all duration-200" onClick={handleSignOut}>
                  Sign out
                </Button>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button className="w-full rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20 btn-shimmer">Log in / Sign up</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
