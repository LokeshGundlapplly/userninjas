import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, RouterLink,
    MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatTabsModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <!-- Logo -->
        <div class="auth-logo">
          <span>⚡</span>
          <strong>UserNinjas</strong>
        </div>

        <!-- Tabs: Sign In / Sign Up -->
        <mat-tab-group [(selectedIndex)]="activeTab" animationDuration="200ms">
          <!-- Sign In Tab -->
          <mat-tab label="Sign In">
            <form [formGroup]="signInForm" (ngSubmit)="onSignIn()" class="auth-form">
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" placeholder="you@company.com">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Password</mat-label>
                <input matInput type="password" formControlName="password" placeholder="••••••••">
              </mat-form-field>

              @if (error()) {
                <div class="auth-error">{{ error() }}</div>
              }

              <button mat-flat-button color="primary" type="submit"
                      [disabled]="authService.loading() || signInForm.invalid">
                @if (authService.loading()) {
                  <mat-spinner diameter="20" />
                } @else {
                  Sign In
                }
              </button>

              <div class="auth-divider"><span>or</span></div>

              <button mat-stroked-button type="button" (click)="showOtp.set(true)">
                Sign in with OTP
              </button>
            </form>
          </mat-tab>

          <!-- Sign Up Tab -->
          <mat-tab label="Create Account">
            <form [formGroup]="signUpForm" (ngSubmit)="onSignUp()" class="auth-form">
              <mat-form-field appearance="outline">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="fullName" placeholder="Jane Smith">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" placeholder="you@company.com">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Password</mat-label>
                <input matInput type="password" formControlName="password" placeholder="Min 6 characters">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>I want to join as</mat-label>
                <mat-select formControlName="role">
                  <mat-option value="tester">Tester (get paid to test products)</mat-option>
                  <mat-option value="recruiter">Recruiter (run user research)</mat-option>
                </mat-select>
              </mat-form-field>

              @if (error()) {
                <div class="auth-error">{{ error() }}</div>
              }

              <button mat-flat-button color="primary" type="submit"
                      [disabled]="authService.loading() || signUpForm.invalid">
                @if (authService.loading()) {
                  <mat-spinner diameter="20" />
                } @else {
                  Create Account
                }
              </button>
            </form>
          </mat-tab>
        </mat-tab-group>

        <!-- OTP Panel -->
        @if (showOtp()) {
          <div class="otp-panel">
            <h3>Enter your OTP</h3>
            <p>We sent a 6-digit code to {{ otpEmail() }}</p>
            <mat-form-field appearance="outline">
              <mat-label>OTP Code</mat-label>
              <input matInput [(ngModel)]="otpCode" maxlength="6" placeholder="123456">
            </mat-form-field>
            <button mat-flat-button color="primary" (click)="onVerifyOtp()">Verify OTP</button>
            <button mat-button (click)="showOtp.set(false)">Cancel</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #08080f;
      padding: 6rem 1rem 2rem;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 1.25rem;
      padding: 2.5rem;
    }
    .auth-logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.4rem;
      color: white;
      margin-bottom: 1.5rem;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.5rem 0 0;
    }
    .auth-form mat-form-field { width: 100%; }
    .auth-form button { width: 100%; margin-top: 0.5rem; }
    .auth-error {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      color: #f87171;
      padding: 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
    }
    .auth-divider {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: rgba(255,255,255,0.3);
      font-size: 0.8rem;
    }
    .auth-divider::before, .auth-divider::after {
      content: '';
      flex: 1;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .otp-panel {
      margin-top: 1.5rem;
      padding: 1.5rem;
      background: rgba(120,80,255,0.05);
      border: 1px solid rgba(120,80,255,0.2);
      border-radius: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .otp-panel h3 { color: white; margin: 0; }
    .otp-panel p { color: rgba(255,255,255,0.5); font-size: 0.9rem; margin: 0; }
  `]
})
export class AuthComponent {
  activeTab = signal(0);
  showOtp = signal(false);
  error = signal<string | null>(null);
  otpEmail = signal('');
  otpCode = '';

  signInForm: FormGroup;
  signUpForm: FormGroup;

  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.signUpForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['tester', Validators.required]
    });

    // Check if signup mode
    this.route.queryParams.subscribe(params => {
      if (params['signup']) this.activeTab.set(1);
    });
  }

  onSignIn() {
    this.error.set(null);
    if (this.signInForm.invalid) return;

    this.authService.signIn(this.signInForm.value).subscribe({
      error: (err) => this.error.set(err?.error?.message || 'Sign in failed')
    });
  }

  onSignUp() {
    this.error.set(null);
    if (this.signUpForm.invalid) return;

    this.authService.signUp(this.signUpForm.value).subscribe({
      error: (err) => this.error.set(err?.error?.message || 'Sign up failed')
    });
  }

  onVerifyOtp() {
    this.authService.verifyOtp({ email: this.otpEmail(), otp: this.otpCode }).subscribe({
      error: (err) => this.error.set('Invalid OTP. Please try again.')
    });
  }
}
