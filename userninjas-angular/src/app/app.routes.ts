import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ─── Public / Marketing ───────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'User Ninjas - AI-Powered User Research Platform'
  },
  {
    path: 'about',
    loadComponent: () => import('./features/marketing/about/about.component').then(m => m.AboutComponent),
    title: 'About - User Ninjas'
  },
  {
    path: 'features',
    loadComponent: () => import('./features/marketing/features/features.component').then(m => m.FeaturesComponent),
    title: 'Features - User Ninjas'
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/marketing/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact - User Ninjas'
  },
  {
    path: 'blog',
    loadComponent: () => import('./features/marketing/blog/blog.component').then(m => m.BlogComponent),
    title: 'Blog - User Ninjas'
  },
  {
    path: 'docs',
    loadComponent: () => import('./features/marketing/docs/docs.component').then(m => m.DocsComponent),
    title: 'Docs - User Ninjas'
  },
  {
    path: 'templates',
    loadComponent: () => import('./features/marketing/templates/templates.component').then(m => m.TemplatesComponent),
    title: 'Templates - User Ninjas'
  },
  {
    path: 'integrations',
    loadComponent: () => import('./features/marketing/integrations/integrations.component').then(m => m.IntegrationsComponent),
    title: 'Integrations - User Ninjas'
  },
  {
    path: 'changelog',
    loadComponent: () => import('./features/marketing/changelog/changelog.component').then(m => m.ChangelogComponent),
    title: 'Changelog - User Ninjas'
  },
  {
    path: 'careers',
    loadComponent: () => import('./features/marketing/careers/careers.component').then(m => m.CareersComponent),
    title: 'Careers - User Ninjas'
  },
  {
    path: 'press',
    loadComponent: () => import('./features/marketing/press/press.component').then(m => m.PressComponent),
    title: 'Press - User Ninjas'
  },
  {
    path: 'community',
    loadComponent: () => import('./features/marketing/community/community.component').then(m => m.CommunityComponent),
    title: 'Community - User Ninjas'
  },
  {
    path: 'glossary',
    loadComponent: () => import('./features/marketing/glossary/glossary.component').then(m => m.GlossaryComponent),
    title: 'Glossary - User Ninjas'
  },

  // ─── Compare ───────────────────────────────────────────────────────────────
  {
    path: 'compare',
    loadComponent: () => import('./features/marketing/compare/compare.component').then(m => m.CompareComponent),
    title: 'Compare - User Ninjas'
  },
  { path: 'compare/vs-maze', loadComponent: () => import('./features/marketing/compare/vs-maze.component').then(m => m.VsMazeComponent) },
  { path: 'compare/vs-usertesting', loadComponent: () => import('./features/marketing/compare/vs-usertesting.component').then(m => m.VsUserTestingComponent) },
  { path: 'compare/vs-playbook', loadComponent: () => import('./features/marketing/compare/vs-playbook.component').then(m => m.VsPlaybookComponent) },
  { path: 'compare/vs-uxtweak', loadComponent: () => import('./features/marketing/compare/vs-uxtweak.component').then(m => m.VsUxTweakComponent) },
  { path: 'compare/vs-lookback', loadComponent: () => import('./features/marketing/compare/vs-lookback.component').then(m => m.VsLookbackComponent) },

  // ─── Legal ─────────────────────────────────────────────────────────────────
  { path: 'privacy', loadComponent: () => import('./features/marketing/legal/privacy.component').then(m => m.PrivacyComponent), title: 'Privacy Policy - User Ninjas' },
  { path: 'terms', loadComponent: () => import('./features/marketing/legal/terms.component').then(m => m.TermsComponent), title: 'Terms - User Ninjas' },
  { path: 'cookies', loadComponent: () => import('./features/marketing/legal/cookies.component').then(m => m.CookiesComponent), title: 'Cookies - User Ninjas' },

  // ─── Auth ──────────────────────────────────────────────────────────────────
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent),
    title: 'Login / Sign Up - User Ninjas'
  },
  {
    path: 'login',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
    title: 'Verify Email - User Ninjas'
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    title: 'Reset Password - User Ninjas'
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./features/auth/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent)
  },
  {
    path: 'complete-profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/complete-profile/complete-profile.component').then(m => m.CompleteProfileComponent),
    title: 'Complete Profile - User Ninjas'
  },

  // ─── Tester ────────────────────────────────────────────────────────────────
  {
    path: 'tester',
    canActivate: [authGuard, roleGuard('tester')],
    loadComponent: () => import('./features/tester/tester-dashboard/tester-dashboard.component').then(m => m.TesterDashboardComponent),
    title: 'Tester Dashboard - User Ninjas'
  },
  {
    path: 'tester/profile',
    canActivate: [authGuard, roleGuard('tester')],
    loadComponent: () => import('./features/tester/tester-profile/tester-profile.component').then(m => m.TesterProfileComponent),
    title: 'Tester Profile - User Ninjas'
  },

  // ─── Recruiter ─────────────────────────────────────────────────────────────
  {
    path: 'recruiter',
    canActivate: [authGuard, roleGuard('recruiter')],
    loadComponent: () => import('./features/recruiter/recruiter-dashboard/recruiter-dashboard.component').then(m => m.RecruiterDashboardComponent),
    title: 'Recruiter Dashboard - User Ninjas'
  },
  {
    path: 'recruiter/create-test',
    canActivate: [authGuard, roleGuard('recruiter')],
    loadComponent: () => import('./features/recruiter/create-test/create-test.component').then(m => m.CreateTestComponent),
    title: 'Create Test - User Ninjas'
  },
  {
    path: 'recruiter/create-study',
    canActivate: [authGuard, roleGuard('recruiter')],
    loadComponent: () => import('./features/recruiter/create-study/create-study.component').then(m => m.CreateStudyComponent),
    title: 'Create Study - User Ninjas'
  },
  {
    path: 'recruiter/templates',
    canActivate: [authGuard, roleGuard('recruiter')],
    loadComponent: () => import('./features/recruiter/templates/recruiter-templates.component').then(m => m.RecruiterTemplatesComponent),
    title: 'Templates - User Ninjas'
  },
  {
    path: 'recruiter/surveys',
    canActivate: [authGuard, roleGuard('recruiter')],
    loadComponent: () => import('./features/recruiter/survey-builder/survey-builder.component').then(m => m.SurveyBuilderComponent),
    title: 'Survey Builder - User Ninjas'
  },

  // ─── Admin ─────────────────────────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('admin')],
    loadComponent: () => import('./features/admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent),
    title: 'Admin Panel - User Ninjas'
  },

  // ─── Dashboard redirect ────────────────────────────────────────────────────
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/dashboard-redirect/dashboard-redirect.component').then(m => m.DashboardRedirectComponent)
  },

  // ─── 404 ───────────────────────────────────────────────────────────────────
  {
    path: '**',
    loadComponent: () => import('./features/marketing/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: '404 - User Ninjas'
  }
];
