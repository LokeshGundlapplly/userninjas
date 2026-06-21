import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-oauth-consent',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, NavbarComponent],
  template: `
    <app-navbar />
    <div class="consent-page">
      <div class="consent-container">
        <div class="consent-card">
          <div class="card-header">
            <h2>Authorization Required</h2>
            <p class="subtitle">A third-party application is requesting access to your account</p>
          </div>

          <div class="card-content">
            <!-- Client Info -->
            @if (clientId()) {
              <div class="info-box">
                <span class="label">Application ID</span>
                <span class="value font-mono">{{ clientId() }}</span>
              </div>
            }

            <!-- Scopes requested -->
            @if (scopes().length > 0) {
              <div class="scopes-section">
                <p class="section-title">Requesting access to:</p>
                <div class="scopes-list">
                  @for (scope of scopes(); track scope) {
                    <div class="scope-item">
                      <span class="dot"></span>
                      <span class="scope-text">{{ scope }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Redirect URI Info -->
            @if (redirectUri()) {
              <div class="redirect-box">
                <span class="label">Redirect URI</span>
                <span class="value font-mono">{{ redirectUri() }}</span>
              </div>
            }

            <!-- Action Buttons -->
            <div class="actions">
              <button mat-stroked-button class="deny-btn" (click)="handleDeny()" [disabled]="isLoading()">
                Deny
              </button>
              <button mat-flat-button color="primary" class="approve-btn" (click)="handleApprove()" [disabled]="isLoading()">
                @if (isLoading()) {
                  Processing...
                } @else {
                  Approve
                }
              </button>
            </div>

            <p class="footer-note">
              You can revoke this authorization in your account settings at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .consent-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      color: white;
      padding-top: 5rem;
    }
    .consent-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }
    .consent-card {
      width: 100%;
      max-width: 450px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 1.25rem;
      backdrop-filter: blur(16px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      overflow: hidden;
    }
    .card-header {
      padding: 2rem 2rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .card-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    .subtitle {
      margin: 0.5rem 0 0;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.875rem;
      line-height: 1.4;
    }
    .card-content {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .info-box, .redirect-box {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 0.75rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .redirect-box {
      background: rgba(59, 130, 246, 0.04);
      border-color: rgba(59, 130, 246, 0.15);
    }
    .label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: rgba(255, 255, 255, 0.4);
    }
    .value {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.85);
      word-break: break-all;
    }
    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .scopes-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .section-title {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
    }
    .scopes-list {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 0.75rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .scope-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .dot {
      width: 6px;
      height: 6px;
      background: #3b82f6;
      border-radius: 50%;
      box-shadow: 0 0 8px #3b82f6;
    }
    .scope-text {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.85);
    }
    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 1.5rem;
    }
    .deny-btn, .approve-btn {
      flex: 1;
      height: 2.75rem !important;
      font-weight: 600 !important;
    }
    .deny-btn {
      border-color: rgba(255, 255, 255, 0.15) !important;
      color: rgba(255, 255, 255, 0.8) !important;
    }
    .deny-btn:hover {
      background: rgba(255, 255, 255, 0.05) !important;
    }
    .approve-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
      color: white !important;
    }
    .approve-btn:hover {
      filter: brightness(1.1);
    }
    .footer-note {
      margin: 0.5rem 0 0;
      text-align: center;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.4);
    }
  `]
})
export class OAuthConsentComponent implements OnInit {
  clientId = signal<string | null>(null);
  redirectUri = signal<string | null>(null);
  scope = signal<string | null>(null);
  state = signal<string | null>(null);
  responseType = signal<string | null>(null);
  scopes = signal<string[]>([]);
  isLoading = signal(false);

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.clientId.set(params['client_id'] || null);
      this.redirectUri.set(params['redirect_uri'] || null);
      this.scope.set(params['scope'] || null);
      this.state.set(params['state'] || null);
      this.responseType.set(params['response_type'] || null);

      if (params['scope']) {
        const parsedScopes = params['scope']
          .split(' ')
          .filter((s: string) => s.trim().length > 0);
        this.scopes.set(parsedScopes);
      }
    });
  }

  handleApprove() {
    this.isLoading.set(true);
    const redirect = this.redirectUri();
    
    // Fallback if redirect is missing
    let responseUrl = redirect || '/';
    const separator = responseUrl.includes('?') ? '&' : '?';
    
    responseUrl += `${separator}response_type=${encodeURIComponent(this.responseType() || 'code')}`;
    responseUrl += `&client_id=${encodeURIComponent(this.clientId() || '')}`;
    
    const stateParam = this.state();
    if (stateParam) {
      responseUrl += `&state=${encodeURIComponent(stateParam)}`;
    }

    // Redirect to authorization target
    window.location.href = responseUrl;
  }

  handleDeny() {
    const redirect = this.redirectUri();
    const stateParam = this.state();

    if (redirect && stateParam) {
      window.location.href = `${redirect}?error=access_denied&state=${encodeURIComponent(stateParam)}`;
    } else if (redirect) {
      window.location.href = `${redirect}?error=access_denied`;
    } else {
      this.router.navigate(['/auth']);
    }
  }
}
