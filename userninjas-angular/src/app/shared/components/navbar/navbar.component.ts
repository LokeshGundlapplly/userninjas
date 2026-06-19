import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, CommonModule],
  template: `
    <nav class="navbar" [class.scrolled]="scrolled()">
      <div class="nav-container">
        <!-- Logo -->
        <a routerLink="/" class="nav-logo">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">User<strong>Ninjas</strong></span>
        </a>

        <!-- Desktop Nav Links -->
        <div class="nav-links" [class.open]="menuOpen()">
          <a routerLink="/features" routerLinkActive="active">Features</a>
          <a routerLink="/templates" routerLinkActive="active">Templates</a>
          <a routerLink="/about" routerLinkActive="active">About</a>
          <a routerLink="/blog" routerLinkActive="active">Blog</a>
          <a routerLink="/contact" routerLinkActive="active">Contact</a>
        </div>

        <!-- Auth Buttons -->
        <div class="nav-actions">
          @if (authService.isLoggedIn()) {
            <button mat-stroked-button [routerLink]="dashboardRoute()">Dashboard</button>
            <button mat-flat-button color="warn" (click)="authService.signOut()">Sign Out</button>
          } @else {
            <a routerLink="/auth" mat-stroked-button>Log in</a>
            <a routerLink="/auth" [queryParams]="{signup: true}" mat-flat-button color="primary">Get Started</a>
          }
        </div>

        <!-- Mobile menu button -->
        <button mat-icon-button class="menu-btn" (click)="toggleMenu()">
          <mat-icon>{{ menuOpen() ? 'close' : 'menu' }}</mat-icon>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 1rem 0;
      background: transparent;
      transition: all 0.3s ease;
      border-bottom: 1px solid transparent;
    }
    .navbar.scrolled {
      background: rgba(10, 10, 20, 0.95);
      backdrop-filter: blur(20px);
      border-bottom-color: rgba(255,255,255,0.08);
      padding: 0.6rem 0;
    }
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      gap: 2rem;
    }
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: white;
      font-size: 1.2rem;
      font-weight: 600;
    }
    .logo-icon { font-size: 1.4rem; }
    .nav-links {
      display: flex;
      gap: 1.5rem;
      margin-left: auto;
    }
    .nav-links a {
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s;
    }
    .nav-links a:hover, .nav-links a.active { color: white; }
    .nav-actions {
      display: flex;
      gap: 0.75rem;
      margin-left: 1rem;
    }
    .menu-btn { display: none; }
    @media (max-width: 768px) {
      .nav-links, .nav-actions { display: none; }
      .menu-btn { display: flex; }
    }
  `]
})
export class NavbarComponent {
  scrolled = signal(false);
  menuOpen = signal(false);

  constructor(public authService: AuthService) {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.scrolled.set(window.scrollY > 20);
      });
    }
  }

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  dashboardRoute() {
    const role = this.authService.role();
    if (role === 'recruiter') return '/recruiter';
    if (role === 'admin') return '/admin';
    return '/tester';
  }
}
