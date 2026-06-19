import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-press',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  template: `
    <div class="page-container">
      <h1>Press</h1>
      <p>This page is being migrated from React to Angular.</p>
      <a routerLink="/" mat-stroked-button>← Back to Home</a>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 80vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 6rem 1.5rem 2rem;
      background: #08080f;
      color: white;
      text-align: center;
    }
    h1 { font-size: 2rem; font-weight: 700; }
    p { color: rgba(255,255,255,0.5); }
  `]
})
export class PressComponent {}
