import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TestService } from '../../../core/services/test.service';
import { SubmissionService } from '../../../core/services/submission.service';
import { AuthService } from '../../../core/services/auth.service';
import { AiService } from '../../../core/services/ai.service';
import { environment } from '../../../../environments/environment';

interface SidebarItem {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-recruiter-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './recruiter-dashboard.component.html',
  styleUrls: ['./recruiter-dashboard.component.css']
})
export class RecruiterDashboardComponent implements OnInit {
  section = signal('overview');
  loading = signal(false);
  error = signal<string | null>(null);

  // Data lists
  tests = signal<any[]>([]);
  submissions = signal<any[]>([]);

  // Search/Filters
  testSearchQuery = '';
  testStatusFilter = 'all';

  sidebarItems: SidebarItem[] = [
    { key: 'overview', label: 'Overview', icon: 'dashboard' },
    { key: 'tests', label: 'My Studies', icon: 'assignment' },
    { key: 'submissions', label: 'Submissions', icon: 'rate_review' },
    { key: 'payments', label: 'Billing & Subscriptions', icon: 'credit_card' }
  ];

  constructor(
    private testService: TestService,
    private submissionService: SubmissionService,
    public authService: AuthService,
    private aiService: AiService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    this.testService.getTests().subscribe({
      next: (list) => {
        this.tests.set(list);
      },
      error: (err) => this.error.set(err?.message || 'Failed to load recruiter tests.')
    });

    this.submissionService.getSubmissions().subscribe({
      next: (list) => {
        this.submissions.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message || 'Failed to load tester submissions.');
        this.loading.set(false);
      }
    });
  }

  setSection(sec: string) {
    this.section.set(sec);
  }

  // Computed dashboard numbers
  activeTests = computed(() => {
    return this.tests().filter(t => t.status === 'active').length;
  });

  totalTesters = computed(() => {
    return this.submissions().length;
  });

  pendingReviews = computed(() => {
    return this.submissions().filter(s => s.status === 'submitted').length;
  });

  totalSpent = computed(() => {
    const approvedSubs = this.submissions().filter(s => s.status === 'approved');
    return approvedSubs.reduce((sum, s) => sum + (s.tests?.reward_amount || 10), 0);
  });

  // Filtered studies
  filteredTests = computed(() => {
    let list = this.tests();
    const query = this.testSearchQuery.toLowerCase().trim();
    if (query) {
      list = list.filter(t => t.title.toLowerCase().includes(query) || (t.category || '').toLowerCase().includes(query));
    }
    return list;
  });

  getSubCount(testId: string): number {
    return this.submissions().filter(s => s.test_id === testId).length;
  }

  // CRUD Handlers
  handleToggleStatus(test: any) {
    const nextStatus = test.status === 'active' ? 'paused' : 'active';
    this.testService.updateTest(test.id, { status: nextStatus }).subscribe({
      next: () => this.loadData(),
      error: (err) => this.error.set(err?.message || 'Failed to toggle test status.')
    });
  }

  handleDeleteTest(testId: string) {
    if (!confirm('Are you sure you want to delete this study?')) return;
    this.testService.deleteTest(testId).subscribe({
      next: () => this.loadData(),
      error: (err) => this.error.set(err?.message || 'Failed to delete test study.')
    });
  }

  handleReviewSubmission(subId: string, status: 'approved' | 'rejected') {
    this.submissionService.updateSubmission(subId, { status, rating: status === 'approved' ? 5 : null }).subscribe({
      next: () => this.loadData(),
      error: (err) => this.error.set(err?.message || 'Failed to review submission.')
    });
  }

  handleSummarizeTranscript(subId: string) {
    // Generate AI transcript summary calling AI helper service
    this.aiService.summarizeTranscript('Transcript evaluation placeholder data. User struggled with layout.').subscribe({
      next: (res) => {
        this.submissionService.updateSubmission(subId, { transcript_summary: res.content }).subscribe({
          next: () => this.loadData()
        });
      }
    });
  }

  // Razorpay Payments integration
  private loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  buyPlan(amount: number, planName: string) {
    this.loading.set(true);
    this.error.set(null);

    // Call Spring Boot payment controller (passes amount in USD directly)
    this.http.post<any>(`${environment.apiUrl}/api/payments/create-order`, { amount: amount, currency: 'INR' }).subscribe({
      next: (order) => {
        this.loadRazorpayScript().then((loaded) => {
          this.loading.set(false);
          if (!loaded) {
            alert('Failed to load Razorpay Checkout SDK. Check your internet connection.');
            return;
          }
          const options = {
            key: 'rzp_live_Sx5YIPbX0SGPU4', // Use Key ID configured on backend
            amount: order.amount,
            currency: order.currency,
            name: 'User Ninjas Ltd',
            description: `Payment subscription upgrade for ${planName}`,
            order_id: order.id,
            handler: (response: any) => {
              alert(`Subscription successful! Razorpay Payment ID: ${response.razorpay_payment_id}`);
              this.loadData();
            },
            prefill: {
              email: this.authService.user()?.email || '',
              name: this.authService.user()?.fullName || ''
            },
            theme: {
              color: '#6366f1'
            }
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Failed to initiate payment order.');
      }
    });
  }
}
