import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Eye, EyeOff, FlaskConical, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import NinjaLogo from '@/components/NinjaLogo';
import { Helmet } from 'react-helmet-async';

type UserType = 'researcher' | 'tester';

export default function Login() {
  const [userType, setUserType] = useState<UserType>('researcher');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login submitted', { email, password, userType });
  };

  return (
    <>
      <Helmet>
        <title>Login - User Ninjas</title>
        <meta name="description" content="Log in to access your User Ninjas dashboard and start your research missions." />
      </Helmet>

      <div className="min-h-screen flex">
        {/* Left Panel - Dark */}
        <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          
          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            <div>
              <div className="bg-sidebar-accent/50 backdrop-blur-sm rounded-xl p-4 inline-block mb-12">
                <NinjaLogo />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/20 text-success text-sm mb-8">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                SECURE ENVIRONMENT
              </div>

              {userType === 'researcher' ? (
                <>
                  <h1 className="font-display text-4xl md:text-5xl font-bold text-sidebar-foreground mb-4">
                    Welcome back,<br />Commander.
                  </h1>
                  <p className="text-sidebar-foreground/70 max-w-md">
                    Access the command center to uncover friction points and optimize user flows.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="font-display text-4xl md:text-5xl font-bold text-sidebar-foreground mb-4">
                    Identity Verified.
                  </h1>
                  <p className="text-sidebar-foreground/70 max-w-md">
                    Start testing the world's top apps and get paid for your tactical feedback.
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-12 pt-8 border-t border-sidebar-border">
              <div>
                <p className="font-display text-3xl font-bold text-sidebar-foreground">120k+</p>
                <p className="text-sm text-sidebar-foreground/60">Verified Testers</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-sidebar-foreground">SOC2</p>
                <p className="text-sm text-sidebar-foreground/60">Certified</p>
              </div>
            </div>
          </div>

          {/* Decorative gradient orb */}
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        </div>

        {/* Right Panel - Light */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8">
              <NinjaLogo />
            </div>

            {/* User Type Toggle */}
            <div className="flex p-1 bg-secondary rounded-xl mb-8">
              <button
                onClick={() => setUserType('researcher')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  userType === 'researcher'
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FlaskConical className="w-4 h-4" />
                Researcher
              </button>
              <button
                onClick={() => setUserType('tester')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  userType === 'tester'
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Target className="w-4 h-4" />
                Tester
              </button>
            </div>

            <div className="mb-8">
              <h2 className="font-display text-3xl font-bold mb-2">Sign In</h2>
              <p className="text-muted-foreground">
                {userType === 'researcher'
                  ? 'Log in to access your dashboard.'
                  : 'Log in to view available missions.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-ninja-dark hover:bg-ninja-dark/90 text-white py-6 rounded-xl">
                Log In
              </Button>
            </form>

            <p className="text-center mt-8 text-muted-foreground">
              Don't have an account?{' '}
              <a href="#" className="font-semibold text-foreground hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
