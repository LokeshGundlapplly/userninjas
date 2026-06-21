import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ninja-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logo-wrapper" [ngClass]="className" [class.dark]="dark">
      <div class="logo-box" [ngClass]="size">
        <div class="glow-ring"></div>
        @if (!imageError()) {
          <img 
            src="/logo.png" 
            alt="User Ninjas Logo" 
            (error)="onImgError()" 
          />
        } @else {
          <svg [attr.width]="svgSize()" [attr.height]="svgSize()" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="var(--primary-color)" opacity="0.9"/>
            <path d="M2 17L12 22L22 17" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
            <path d="M2 12L12 17L22 12" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
          </svg>
        }
      </div>
      @if (showText) {
        <span class="logo-text" [ngClass]="size">
          <span class="brand-user">User</span>
          <span class="brand-ninjas">Ninjas</span>
        </span>
      }
    </div>
  `,
  styles: [`
    .logo-wrapper {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      cursor: pointer;
      user-select: none;
    }
    .logo-box {
      position: relative;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      transition: all 0.4s ease;
    }
    .logo-box.sm { height: 1.75rem; width: 1.75rem; }
    .logo-box.md { height: 2.25rem; width: 2.25rem; }
    .logo-box.lg { height: 3rem; width: 3rem; }
    
    .logo-box:hover {
      transform: scale(1.05);
    }
    
    .glow-ring {
      position: absolute;
      inset: 0;
      border-radius: 0.75rem;
      background: rgba(120, 80, 255, 0.2);
      filter: blur(6px);
      opacity: 0;
      transition: opacity 0.4s;
    }
    .logo-box:hover .glow-ring {
      opacity: 1;
    }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 0.15rem;
      transition: transform 0.4s;
    }
    .logo-box:hover img {
      transform: scale(1.1);
    }
    
    .logo-text {
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .logo-text.sm { font-size: 0.9rem; }
    .logo-text.md { font-size: 1.15rem; }
    .logo-text.lg { font-size: 1.5rem; }
    
    .brand-user {
      color: white;
    }
    .dark .brand-user {
      color: #0f172a;
    }
    .brand-ninjas {
      color: #7c3aed;
      transition: color 0.3s;
    }
    .logo-wrapper:hover .brand-ninjas {
      color: #9061f9;
    }
  `]
})
export class NinjaLogoComponent {
  @Input() className = '';
  @Input() showText = true;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() dark = false;

  imageError = signal(false);

  onImgError() {
    this.imageError.set(true);
  }

  svgSize() {
    if (this.size === 'sm') return 18;
    if (this.size === 'md') return 20;
    return 24;
  }
}
