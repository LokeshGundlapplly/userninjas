import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  template: `
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-container">
        <div class="hero-badge">✨ AI-Powered User Research</div>
        <h1 class="hero-title">
          The <span class="gradient-text">Operating System</span><br>
          for User Research
        </h1>
        <p class="hero-subtitle">
          Recruit testers, run AI-moderated sessions, and turn raw feedback into actionable insights —
          all in one platform built for modern research teams.
        </p>
        <div class="hero-cta">
          <a routerLink="/auth" [queryParams]="{signup: true}" mat-flat-button class="btn-primary">
            Start for free →
          </a>
          <a routerLink="/features" mat-stroked-button class="btn-secondary">
            See how it works
          </a>
        </div>
        <div class="hero-stats">
          <div class="stat"><strong>10,000+</strong><span>Testers</span></div>
          <div class="stat"><strong>500+</strong><span>Studies run</span></div>
          <div class="stat"><strong>4.9★</strong><span>Rating</span></div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-container">
        <div class="section-header">
          <h2>Everything you need to run great research</h2>
          <p>From recruitment to insights, we handle the entire research workflow</p>
        </div>
        <div class="features-grid">
          @for (feature of features; track feature.title) {
            <div class="feature-card">
              <div class="feature-icon">{{ feature.icon }}</div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-container">
        <h2>Ready to transform your research process?</h2>
        <p>Join hundreds of teams running better user research with AI</p>
        <a routerLink="/auth" [queryParams]="{signup: true}" mat-flat-button class="btn-primary large">
          Get started free
        </a>
      </div>
    </section>
  `,
  styles: [`
    /* Hero */
    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      background: #08080f;
      overflow: hidden;
      padding: 6rem 1.5rem 4rem;
    }
    .hero-bg {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120,80,255,0.3), transparent),
                  radial-gradient(ellipse 60% 40% at 80% 80%, rgba(60,180,255,0.15), transparent);
    }
    .hero-container {
      position: relative;
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }
    .hero-badge {
      display: inline-block;
      padding: 0.4rem 1rem;
      background: rgba(120,80,255,0.15);
      border: 1px solid rgba(120,80,255,0.3);
      border-radius: 999px;
      color: rgba(180,140,255,1);
      font-size: 0.85rem;
      margin-bottom: 1.5rem;
    }
    .hero-title {
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      font-weight: 800;
      color: white;
      line-height: 1.1;
      margin-bottom: 1.5rem;
    }
    .gradient-text {
      background: linear-gradient(135deg, #7c3aed, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-subtitle {
      font-size: 1.1rem;
      color: rgba(255,255,255,0.6);
      max-width: 600px;
      margin: 0 auto 2rem;
      line-height: 1.7;
    }
    .hero-cta {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 3rem;
    }
    .btn-primary {
      background: linear-gradient(135deg, #7c3aed, #3b82f6) !important;
      color: white !important;
      padding: 0.75rem 2rem !important;
      border-radius: 0.5rem !important;
      font-size: 1rem !important;
    }
    .btn-secondary {
      color: rgba(255,255,255,0.8) !important;
      border-color: rgba(255,255,255,0.2) !important;
      padding: 0.75rem 2rem !important;
    }
    .hero-stats {
      display: flex;
      gap: 3rem;
      justify-content: center;
      padding-top: 2rem;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .stat { text-align: center; }
    .stat strong { display: block; color: white; font-size: 1.5rem; font-weight: 700; }
    .stat span { color: rgba(255,255,255,0.5); font-size: 0.85rem; }

    /* Features */
    .features-section {
      background: #09090f;
      padding: 6rem 1.5rem;
    }
    .section-container { max-width: 1200px; margin: 0 auto; }
    .section-header {
      text-align: center;
      margin-bottom: 4rem;
    }
    .section-header h2 {
      font-size: clamp(1.8rem, 4vw, 3rem);
      color: white;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    .section-header p { color: rgba(255,255,255,0.5); font-size: 1.05rem; }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .feature-card {
      padding: 2rem;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 1rem;
      transition: border-color 0.3s, transform 0.3s;
    }
    .feature-card:hover {
      border-color: rgba(120,80,255,0.3);
      transform: translateY(-4px);
    }
    .feature-icon { font-size: 2rem; margin-bottom: 1rem; }
    .feature-card h3 { color: white; font-size: 1.1rem; margin-bottom: 0.5rem; }
    .feature-card p { color: rgba(255,255,255,0.5); font-size: 0.9rem; line-height: 1.6; }

    /* CTA */
    .cta-section {
      background: linear-gradient(135deg, rgba(120,80,255,0.1), rgba(60,180,255,0.1));
      padding: 6rem 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .cta-container {
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
    }
    .cta-container h2 { color: white; font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; }
    .cta-container p { color: rgba(255,255,255,0.6); margin-bottom: 2rem; }
    .btn-primary.large { font-size: 1.1rem !important; padding: 1rem 2.5rem !important; }
  `]
})
export class HomeComponent {
  features = [
    {
      icon: '🤖',
      title: 'AI-Moderated Interviews',
      description: 'Let AI conduct user interviews 24/7. Get consistent, unbiased insights at scale without scheduling headaches.'
    },
    {
      icon: '🎯',
      title: 'Smart Tester Recruitment',
      description: 'Access 10,000+ pre-screened testers. AI matches the right participants to your study criteria automatically.'
    },
    {
      icon: '📊',
      title: 'Instant Insights',
      description: 'AI analyzes transcripts, identifies patterns, and generates actionable reports in minutes instead of days.'
    },
    {
      icon: '🔬',
      title: 'Survey & Screener Builder',
      description: 'Build intelligent screeners with branching logic. Ensure only qualified participants reach your study.'
    },
    {
      icon: '📹',
      title: 'Session Recording',
      description: 'Automatically record and transcribe sessions. Search, clip, and share key moments with your team.'
    },
    {
      icon: '🔗',
      title: 'Team Collaboration',
      description: 'Share insights, highlight reels, and reports. Keep your entire team aligned on user feedback.'
    }
  ];
}
