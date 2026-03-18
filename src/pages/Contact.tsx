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
import ScrollReveal from '@/components/ScrollReveal';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

const contactChannels = [
  { icon: Building2, title: 'For Recruiters & Clients', description: 'Sales, Enterprise Plans, and Support', email: 'support@recurteruserninjas.com' },
  { icon: Users, title: 'For Testers & Ninjas', description: 'Payouts, Account issues, and Disputes', email: 'support@userninjas.com' },
];

const subjects = ['General Inquiry', 'Enterprise Sales', 'Technical Support', 'Partnership', 'Other'];

export default function Contact() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      <Helmet>
        <title>Contact - User Ninjas</title>
        <meta name="description" content="Get in touch with the User Ninjas team. We're here to help with sales, support, and partnerships." />
      </Helmet>

      <Background3D />
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Contact</p>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 tracking-tight">Get in touch</h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Have a question or need support? Our team is standing by.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
            {/* Left: Contact Info */}
            <ScrollReveal animation="fade-right" delay={150} className="lg:col-span-2">
              <div className="space-y-5">
                {contactChannels.map((ch) => (
                  <div key={ch.title} className="p-6 rounded-2xl bg-card border border-border/60">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <ch.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-1">{ch.title}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{ch.description}</p>
                        <a href={`mailto:${ch.email}`} className="text-sm text-primary font-medium hover:underline">{ch.email}</a>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-6 rounded-2xl bg-card border border-border/60 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Office</h3>
                      <p className="text-xs text-muted-foreground">Hyderabad, Hightech City 500081, India</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Phone</h3>
                      <p className="text-xs text-muted-foreground">Mon-Fri, 9am-6pm IST</p>
                      <p className="text-sm font-medium">+91 9618495013</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right: Form */}
            <ScrollReveal animation="fade-left" delay={250} className="lg:col-span-3">
              <div className="bg-card rounded-2xl border border-border/60 p-8">
                <h2 className="font-display text-xl font-bold mb-6">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm">First Name</Label>
                      <Input id="firstName" placeholder="Jane" className="mt-1.5" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" className="mt-1.5" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <Input id="email" type="email" placeholder="jane@company.com" className="mt-1.5" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-sm">Subject</Label>
                    <Select value={formData.subject} onValueChange={(v) => setFormData({ ...formData, subject: v })}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a topic" /></SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-sm">Message</Label>
                    <Textarea id="message" placeholder="How can we help?" className="mt-1.5 min-h-[120px]" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                  </div>
                  <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl h-11 gap-2">
                    <Send className="w-4 h-4" />
                    Send Message
                  </Button>
                </form>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
