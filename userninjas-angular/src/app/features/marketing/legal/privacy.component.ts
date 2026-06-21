import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './privacy.component.html'
})
export class PrivacyComponent {
  sections = [
    {
      id: 'collection',
      title: 'Information we collect',
      iconName: 'list_alt',
      content: [
        { subtitle: 'Recruiter profile info', text: 'When you register a recruiter workspace, we collect your name, company name, corporate email address, and billing coordinates (processed securely via Stripe/Razorpay).' },
        { subtitle: 'Tester profiles and demographics', text: 'To coordinate user target matches, testers provide age range, location coordinates, gender, device inventories, and verified LinkedIn authentication profiles.' },
        { subtitle: 'Usability session recordings', text: 'Screen recordings, voice captures, and transcripts are recorded only with explicit tester authorization and are archived solely inside the recruiter study client assets.' }
      ]
    },
    {
      id: 'usage',
      title: 'How we use information',
      iconName: 'insights',
      content: [
        { subtitle: 'Study matching algorithms', text: 'We cross-reference tester demographics against target recruiter specifications to compute study match percentages.' },
        { subtitle: 'AI insights generation', text: 'Audio files are securely run through Groq Llama 3 systems to construct usability transcripts and pattern reports.' }
      ]
    },
    {
      id: 'control',
      title: 'Your privacy controls',
      iconName: 'security',
      content: [
        { subtitle: 'Data deletion requests', text: 'You can request the complete erasure of your workspace, test recordings, or tester bank credentials at any time.' }
      ]
    }
  ];

  scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
