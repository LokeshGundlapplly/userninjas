import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-brand">
          <div class="footer-logo">
            <span>⚡</span>
            <strong>UserNinjas</strong>
          </div>
          <p>AI-Powered User Research Operating System.</p>
        </div>

        <div class="footer-links">
          <div class="footer-col">
            <h4>Product</h4>
            <a routerLink="/features">Features</a>
            <a routerLink="/templates">Templates</a>
            <a routerLink="/integrations">Integrations</a>
            <a routerLink="/changelog">Changelog</a>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <a routerLink="/about">About</a>
            <a routerLink="/blog">Blog</a>
            <a routerLink="/careers">Careers</a>
            <a routerLink="/press">Press</a>
          </div>
          <div class="footer-col">
            <h4>Resources</h4>
            <a routerLink="/docs">Docs</a>
            <a routerLink="/glossary">Glossary</a>
            <a routerLink="/community">Community</a>
            <a routerLink="/contact">Contact</a>
          </div>
          <div class="footer-col">
            <h4>Legal</h4>
            <a routerLink="/privacy">Privacy Policy</a>
            <a routerLink="/terms">Terms of Service</a>
            <a routerLink="/cookies">Cookie Policy</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; {{ year }} User Ninjas. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #0a0a14;
      border-top: 1px solid rgba(255,255,255,0.08);
      padding: 4rem 0 2rem;
      color: rgba(255,255,255,0.7);
    }
    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 4rem;
    }
    .footer-logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.2rem;
      color: white;
      margin-bottom: 1rem;
    }
    .footer-brand p { font-size: 0.9rem; line-height: 1.6; }
    .footer-links {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
    }
    .footer-col h4 {
      color: white;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }
    .footer-col a {
      display: block;
      color: rgba(255,255,255,0.5);
      text-decoration: none;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
      transition: color 0.2s;
    }
    .footer-col a:hover { color: white; }
    .footer-bottom {
      max-width: 1200px;
      margin: 3rem auto 0;
      padding: 1.5rem 1.5rem 0;
      border-top: 1px solid rgba(255,255,255,0.06);
      font-size: 0.85rem;
    }
    @media (max-width: 768px) {
      .footer-container { grid-template-columns: 1fr; gap: 2rem; }
      .footer-links { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
}
