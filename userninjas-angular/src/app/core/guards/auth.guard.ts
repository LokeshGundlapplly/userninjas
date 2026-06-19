import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AuthGuard - protects routes requiring login
 * Replaces the React ProtectedDashboardRoute component
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  return true;
};

/**
 * RoleGuard - protects routes requiring a specific role
 */
export const roleGuard = (requiredRole: string): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      router.navigate(['/auth']);
      return false;
    }

    const userRole = authService.role();
    if (userRole === requiredRole || userRole === 'admin') {
      return true;
    }

    // Redirect to appropriate dashboard
    if (userRole === 'recruiter') router.navigate(['/recruiter']);
    else if (userRole === 'tester') router.navigate(['/tester']);
    else router.navigate(['/']);

    return false;
  };
};
