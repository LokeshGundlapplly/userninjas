import { useState } from 'react';
import { Building2, Users, MapPin, Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Background3D from '@/components/Background3D';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

const contactChannels = [
  {
    icon: Building2,
    title: 'FOR RECRUITERS & CLIENTS',
    description: 'Sales, Enterprise Plans, and Mission Support',
    email: 'support@recurteruserninjas.com',
    color: 'bg-ninja-dark text-white',
  },
  {
    icon: Users,
    title: 'FOR TESTERS & NINJAS',
    description: 'Payouts, Account issues, and Mission disputes',
    email: 'support@userninjas.com',
    color: 'bg-primary text-white',
  },
];

const subjects = [
  'General Inquiry',
  'Enterprise Sales',
  'Technical Support',
  'Partnership',
  'Other',
];

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    toast.success('Message sent! We\'ll get back to you soon.');
    setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      <Helmet>
        <title>Contact HQ - User Ninjas</title>
        <meta name="description" content="Ready to deploy a mission or need support? Our ops team is standing by. Contact User Ninjas today." />
      </Helmet>

      <Background3D />
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
              Contact HQ
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Ready to deploy a mission or need support? Our ops team is standing by.
            </p>
          </div>

          {/* Contact Channels Card */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-card rounded-2xl border border-border p-8">
              <h2 className="font-display text-2xl font-bold mb-6">Direct Channels</h2>

              <div className="space-y-4">
                {contactChannels.map((channel) => (
                  <div
                    key={channel.title}
                    className="p-6 rounded-xl border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${channel.color} flex items-center justify-center shrink-0`}>
                        <channel.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm tracking-wide mb-1">{channel.title}</h3>
                        <p className="text-muted-foreground text-sm mb-2">{channel.description}</p>
                        <a
                          href={`mailto:${channel.email}`}
                          className="text-primary font-medium hover:underline"
                        >
                          {channel.email}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-border space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm tracking-wide mb-1">BASE OF OPERATIONS</h3>
                    <p className="text-muted-foreground">Hyderabad, Hightech city 5006167<br />India</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm tracking-wide mb-1">HOTLINE</h3>
                    <p className="text-muted-foreground mb-1">Mon-Fri, 9am - 6pm IST</p>
                    <p className="font-semibold">+91 9618495013</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl border border-border p-8">
              <h2 className="font-display text-2xl font-bold mb-8">Send a Transmission</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Jane"
                      className="mt-2"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="mt-2"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@company.com"
                    className="mt-2"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="General Inquiry" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="How can we help you execute your research goals?"
                    className="mt-2 min-h-[120px]"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-xl">
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  By sending this message, you agree to our privacy policy and terms of service.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
