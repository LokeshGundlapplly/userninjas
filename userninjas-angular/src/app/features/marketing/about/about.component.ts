import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './about.component.html'
})
export class AboutComponent {
  stats = [
    { value: '4,000+', label: 'Product Teams', sublabel: 'Testing daily' },
    { value: '150,000+', label: 'Sessions Run', sublabel: 'Across web & mobile' },
    { value: '12 Mins', label: 'Average Turnaround', sublabel: 'From launch to insights' },
    { value: '99.4%', label: 'Accuracy Rating', sublabel: 'AI transcripts & tags' }
  ];

  advantages = [
    'Pre-vetted panels from 120 countries, verified with LinkedIn profiles.',
    'Intelligent branching screener logic backed by AI eligibility gatekeepers.',
    'Screen recording, voice capture, and automatic transcription integrations.',
    'Post-task MCQ, Yes/No, Rating Stars, and open feedback survey modules.'
  ];

  milestones = [
    { year: '2024', title: 'Company Founded', body: 'Arjun and Priya build the first prototype to address slow and expensive feedback cycles.' },
    { year: '2025', title: 'AI Insights Engine', body: 'Launch our custom automated transcription and insights synthesis pipeline.' },
    { year: '2026', title: 'Global Scaling', body: 'Expand to 150k completed sessions and support enterprise workspace permissions.' }
  ];

  team = [
    { initials: 'AG', name: 'Arjun Gupta', role: 'CEO & Co-founder', bio: 'Former Product Director. Loves scaling research pipelines and playing guitar.' },
    { initials: 'PK', name: 'Priya Kapoor', role: 'CTO & Co-founder', bio: 'Distributed systems architect. Enjoys hiking and building compiler tools.' },
    { initials: 'JS', name: 'James Smith', role: 'VP of Product UX', bio: 'Passionate about simplifying complex dashboards. Obsessed with dark mode themes.' }
  ];

  investors = [
    { initials: 'AC', name: 'Apex Capital', stage: 'Seed & Series A' },
    { initials: 'NY', name: 'Nexus Ventures', stage: 'Seed & Growth' },
    { initials: 'SV', name: 'Silicon Valley Partners', stage: 'Early Stage Partner' },
    { initials: 'BF', name: 'Blue Future Founders', stage: 'Enterprise Angel Group' }
  ];
}
