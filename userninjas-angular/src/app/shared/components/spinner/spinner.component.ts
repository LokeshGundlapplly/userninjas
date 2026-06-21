import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container" [style.height]="fullscreen ? '100vh' : 'auto'" [class.fullscreen]="fullscreen">
      <div class="loader" [style.width.px]="size" [style.height.px]="size" [style.borderWidth.px]="stroke"></div>
      @if (message) {
        <p class="message">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      width: 100%;
    }
    .spinner-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #08080f;
      z-index: 9999;
    }
    .loader {
      border: 3px solid rgba(255, 255, 255, 0.05);
      border-top-color: #7c3aed;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .message {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.9rem;
      margin: 0;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class SpinnerComponent {
  @Input() size = 40;
  @Input() stroke = 3;
  @Input() message = '';
  @Input() fullscreen = false;
}
