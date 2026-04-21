import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, getProfile } from '@/utils/profileService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, User, Briefcase, MapPin, Link2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function CompleteProfile() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    company: '',
    location: '',
    phone: '',
    website: '',
    linkedin_url: '',
    bio: '',
  });

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    // Load existing profile data
    const loadProfile = async () => {
      const profile = await getProfile(user.id);
      if (profile) {
        setFormData({
          full_name: profile.full_name || '',
          company: profile.company || '',
          location: profile.location || '',
          phone: profile.phone || '',
          website: profile.website || '',
          linkedin_url: profile.linkedin_url || '',
          bio: profile.bio || '',
        });
      }
    };

    loadProfile();
  }, [user, loading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Full name is required"
      });
      return;
    }

    if (!user) return;

    setIsSubmitting(true);
    try {
      const result = await updateProfile(user.id, formData);
      
      if (!result.success) {
        throw result.error;
      }

      toast({
        title: "Success",
        description: "Your profile has been updated successfully"
      });

      // Redirect based on role
      if (role === 'recruiter') {
        navigate('/recruiter', { replace: true });
      } else if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/tester', { replace: true });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to update profile"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const skipAndNavigate = () => {
    if (role === 'recruiter') {
      navigate('/recruiter', { replace: true });
    } else if (role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/tester', { replace: true });
    }
  };

  if (loading) return null;

  return (
    <>
      <Helmet>
        <title>Complete Your Profile | User Ninjas</title>
        <meta name="description" content="Complete your profile information" />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-border/60">
          <CardContent className="pt-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
              <p className="text-muted-foreground">
                Help us get to know you better. This information will help us match you with relevant opportunities.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="Your full name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Company (for recruiters) */}
              {role === 'recruiter' && (
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium">Company Name</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company"
                      name="company"
                      placeholder="Your company name"
                      value={formData.company}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    name="location"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-medium">Website</Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* LinkedIn URL */}
              <div className="space-y-2">
                <Label htmlFor="linkedin_url" className="text-sm font-medium">LinkedIn Profile</Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="linkedin_url"
                    name="linkedin_url"
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                <textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-border/60 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl gap-2 h-11"
                >
                  {isSubmitting ? 'Saving...' : 'Save Profile'}
                  {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                </Button>
                <Button
                  type="button"
                  onClick={skipAndNavigate}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1 rounded-xl h-11"
                >
                  Skip for Now
                </Button>
              </div>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              You can update this information anytime in your profile settings.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
