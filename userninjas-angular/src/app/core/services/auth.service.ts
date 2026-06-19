import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError } from 'rxjs';
import { AuthResponse, SignUpRequest, SignInRequest, OtpVerifyRequest, User } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.apiUrl;

  // Angular signals for reactive state (replaces React useState/useAuth hook)
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(localStorage.getItem('un_token'));
  private _loading = signal(false);

  // Public computed signals
  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly role = computed(() => this._user()?.role ?? null);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly isRecruiter = computed(() => this._user()?.role === 'recruiter');
  readonly isTester = computed(() => this._user()?.role === 'tester');

  constructor(private http: HttpClient, private router: Router) {
    // Restore user from token on startup
    const storedUser = localStorage.getItem('un_user');
    if (storedUser) {
      try {
        this._user.set(JSON.parse(storedUser));
      } catch { /* invalid stored user */ }
    }
  }

  signUp(req: SignUpRequest) {
    this._loading.set(true);
    return this.http.post<AuthResponse>(`${this.API}/api/auth/signup`, req).pipe(
      tap(res => this.handleAuthSuccess(res)),
      catchError(err => {
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  signIn(req: SignInRequest) {
    this._loading.set(true);
    return this.http.post<AuthResponse>(`${this.API}/api/auth/signin`, req).pipe(
      tap(res => this.handleAuthSuccess(res)),
      catchError(err => {
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  sendOtp(email: string) {
    return this.http.post<{ message: string }>(`${this.API}/api/auth/send-otp`, { email });
  }

  verifyOtp(req: OtpVerifyRequest) {
    this._loading.set(true);
    return this.http.post<AuthResponse>(`${this.API}/api/auth/verify-otp`, req).pipe(
      tap(res => this.handleAuthSuccess(res)),
      catchError(err => {
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  signOut() {
    localStorage.removeItem('un_token');
    localStorage.removeItem('un_user');
    this._user.set(null);
    this._token.set(null);
    this.router.navigate(['/auth']);
  }

  private handleAuthSuccess(res: AuthResponse) {
    const user: User = {
      id: res.userId,
      email: res.email,
      role: res.role as User['role'],
      fullName: res.fullName,
    };
    this._user.set(user);
    this._token.set(res.token);
    this._loading.set(false);
    localStorage.setItem('un_token', res.token);
    localStorage.setItem('un_user', JSON.stringify(user));

    // Redirect by role (same logic as React DashboardRedirect)
    if (res.role === 'recruiter') this.router.navigate(['/recruiter']);
    else if (res.role === 'admin') this.router.navigate(['/admin']);
    else this.router.navigate(['/tester']);
  }
}
