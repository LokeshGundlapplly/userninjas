import { Component, OnInit, signal, computed, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TesterService } from '../../../core/services/tester.service';
import { TestService } from '../../../core/services/test.service';
import { SubmissionService } from '../../../core/services/submission.service';
import { AuthService } from '../../../core/services/auth.service';
import { AiService } from '../../../core/services/ai.service';
import { SurveyService } from '../../../core/services/survey.service';
import { ScreenRecorderComponent } from '../../../shared/components/screen-recorder/screen-recorder.component';

@Component({
  selector: 'app-tester-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    ScreenRecorderComponent
  ],
  templateUrl: './tester-dashboard.component.html',
  styleUrls: ['./tester-dashboard.component.css']
})
export class TesterDashboardComponent implements OnInit {
  @ViewChild('screenerDialog') screenerDialogTemp!: TemplateRef<any>;
  @ViewChild('surveyDialog') surveyDialogTemp!: TemplateRef<any>;
  @ViewChild('submitDialog') submitDialogTemp!: TemplateRef<any>;
  @ViewChild('bankDialog') bankDialogTemp!: TemplateRef<any>;
  @ViewChild('withdrawDialog') withdrawDialogTemp!: TemplateRef<any>;

  // Side bar state
  sidebarCollapsed = signal(false);
  section = signal('overview');
  loading = signal(false);

  // Profile Form and Details
  profile = signal<any>(null);
  editing = false;
  saving = false;
  editForm = {
    full_name: '',
    age: null as number | null,
    gender: '',
    location: '',
    bio: '',
    devices: [] as string[],
    interests: [] as string[]
  };
  newInterest = '';

  // Data lists
  tests = signal<any[]>([]); // Available tests matching profile
  submissions = signal<any[]>([]); // Completed or in progress applications
  earnings = signal<any[]>([]); // Earnings log
  scheduledSessions = signal<any[]>([]); // Scheduled slots

  // Screener Flow
  screenerTest: any = null;
  screenerQuestions: any[] = [];
  currentQuestionIndex = 0;
  testerAnswer = '';
  checkingEligibility = false;
  eligibilityResult: any = null;

  // Survey Flow
  surveyTest: any = null;
  surveyQuestions: any[] = [];
  surveyCurrentIndex = 0;
  surveyAnswers: Record<string, { question_id: string; option: number | null; text: string }> = {};
  surveySubmitting = false;

  // Test Submission Flow
  selectedSubmission: any = null;
  feedbackText = '';
  recordingBlob: Blob | null = null;
  submitting = false;
  uploadedFiles: File[] = [];

  // Bank & Withdraw Forms
  bankDetails = signal<any>(null);
  bankDetailsForm: FormGroup;
  withdrawForm: FormGroup;
  withdrawSubmitting = false;

  constructor(
    private testerService: TesterService,
    private testService: TestService,
    private submissionService: SubmissionService,
    private aiService: AiService,
    private surveyService: SurveyService,
    public authService: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.bankDetailsForm = this.fb.group({
      account_holder_name: ['', Validators.required],
      bank_name: ['', Validators.required],
      account_number: ['', [Validators.required, Validators.minLength(9)]],
      confirm_account_number: ['', Validators.required],
      ifsc_code: ['', Validators.required]
    });

    this.withdrawForm = this.fb.group({
      amount: [20, [Validators.required, Validators.min(20)]]
    });
  }

  ngOnInit() {
    this.loadProfile();
    this.loadData();
  }

  loadProfile() {
    this.testerService.getProfile().subscribe({
      next: (prof) => {
        this.profile.set(prof);
        this.editForm = {
          full_name: prof.full_name || '',
          age: prof.age || null,
          gender: prof.gender || '',
          location: prof.location || '',
          bio: prof.bio || '',
          devices: prof.devices || [],
          interests: prof.interests || []
        };

        // Also fetch bank account details if available
        if (prof.bank_details) {
          this.bankDetails.set(prof.bank_details);
          this.bankDetailsForm.patchValue(prof.bank_details);
        }
      }
    });
  }

  loadData() {
    this.loading.set(true);

    // Load available matching tests
    this.testService.getTests().subscribe({
      next: (list) => {
        // Mock a match score for visual parity
        this.tests.set(list.map(t => ({
          ...t,
          _matchScore: Math.floor(Math.random() * 20) + 80 // 80 - 99% match
        })));
      }
    });

    // Load applications/submissions
    this.submissionService.getSubmissions().subscribe({
      next: (list) => {
        this.submissions.set(list);
      }
    });

    // Load earnings
    this.testerService.getEarnings().subscribe({
      next: (list) => {
        this.earnings.set(list);
      }
    });

    // Load scheduled sessions
    this.testerService.getScheduledSessions().subscribe({
      next: (list) => {
        this.scheduledSessions.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setSection(sec: string) {
    this.section.set(sec);
  }

  // Computed dashboard figures
  completedTests = computed(() => {
    return this.submissions().filter(s => s.status === 'approved').length;
  });

  totalEarnings = computed(() => {
    return this.earnings()
      .filter(e => e.status === 'paid' || e.status === 'approved')
      .reduce((sum, e) => sum + e.amount, 0);
  });

  pendingEarnings = computed(() => {
    return this.earnings()
      .filter(e => e.status === 'pending' || e.status === 'submitted')
      .reduce((sum, e) => sum + e.amount, 0);
  });

  paidEarnings = computed(() => {
    return this.earnings()
      .filter(e => e.status === 'paid')
      .reduce((sum, e) => sum + e.amount, 0);
  });

  availableBalance = computed(() => {
    return Math.max(0, this.totalEarnings() - this.paidEarnings());
  });

  averageRating = computed(() => {
    const rated = this.submissions().filter(s => s.rating && s.rating > 0);
    if (rated.length === 0) return 0;
    return rated.reduce((sum, s) => sum + s.rating, 0) / rated.length;
  });

  upcomingSessions = computed(() => {
    return this.scheduledSessions().length;
  });

  // Profile demographic edits
  toggleDevice(device: string) {
    const idx = this.editForm.devices.indexOf(device);
    if (idx > -1) {
      this.editForm.devices.splice(idx, 1);
    } else {
      this.editForm.devices.push(device);
    }
  }

  addInterest() {
    if (this.newInterest.trim()) {
      this.editForm.interests.push(this.newInterest.trim());
      this.newInterest = '';
    }
  }

  removeInterest(tag: string) {
    const idx = this.editForm.interests.indexOf(tag);
    if (idx > -1) {
      this.editForm.interests.splice(idx, 1);
    }
  }

  saveProfile() {
    this.saving = true;
    this.testerService.updateProfile(this.editForm).subscribe({
      next: (prof) => {
        this.profile.set(prof);
        this.editing = false;
        this.saving = false;
      },
      error: () => { this.saving = false; }
    });
  }

  // Initiate a Usability Study (Screener + Start Test)
  initiateTest(test: any) {
    this.screenerTest = test;
    this.screenerQuestions = test.screener_questions || [];
    this.currentQuestionIndex = 0;
    this.testerAnswer = '';
    this.eligibilityResult = null;
    this.checkingEligibility = false;

    if (this.screenerQuestions.length > 0) {
      this.dialog.open(this.screenerDialogTemp, { width: '500px' });
    } else {
      // No screener, jump straight into study
      this.startStudyFlow(test);
    }
  }

  handleNextScreener() {
    if (!this.testerAnswer.trim()) return;

    if (this.currentQuestionIndex < this.screenerQuestions.length - 1) {
      this.currentQuestionIndex++;
      this.testerAnswer = '';
    } else {
      // End of screener, request AI eligibility assessment
      this.checkingEligibility = true;
      const combined = this.screenerQuestions.map((q, idx) => `Q: ${q.question} A: ${idx === this.currentQuestionIndex ? this.testerAnswer : ''}`).join('\n');
      
      this.aiService.checkEligibility(JSON.stringify(this.screenerQuestions), combined).subscribe({
        next: (res) => {
          this.checkingEligibility = false;
          // Parse eligibility object response from backend AI
          try {
            this.eligibilityResult = typeof res.content === 'string' ? JSON.parse(res.content) : res.content;
          } catch {
            this.eligibilityResult = { eligible: true, match_score: 95, reason: 'Profile matches targeting profile.' };
          }
        },
        error: () => {
          this.checkingEligibility = false;
          this.eligibilityResult = { eligible: true, match_score: 90, reason: 'Eligible for research session.' };
        }
      });
    }
  }

  handleScreenerPass() {
    this.dialog.closeAll();
    this.startStudyFlow(this.screenerTest);
  }

  private startStudyFlow(test: any) {
    // Check if test type is survey or moderated Zoom study
    if (test.test_type === 'survey') {
      this.startSurveyFlow(test);
    } else {
      // Usability recording study -> start application submission
      this.submissionService.createSubmission({ test_id: test.id, status: 'in_progress' }).subscribe({
        next: (sub) => {
          this.submissions.update(list => [sub, ...list]);
          this.setSection('my_tests');
        }
      });
    }
  }

  // Survey answering flow
  private startSurveyFlow(test: any) {
    this.surveyTest = test;
    this.surveyService.getSurveys().subscribe({
      next: (surveysList) => {
        // Find matching survey template questions
        const survey = surveysList.find(s => s.test_id === test.id || s.title.toLowerCase().includes(test.title.toLowerCase()));
        this.surveyQuestions = survey?.questions || [
          { id: 'q1', question_text: 'How would you rate the overall onboarding experience?', question_type: 'rating', options: [], required: true },
          { id: 'q2', question_text: 'What was the main obstacle you encountered during checkout?', question_type: 'open_text', options: [], required: true }
        ];

        // Initialize survey answer maps
        this.surveyAnswers = {};
        this.surveyQuestions.forEach(q => {
          this.surveyAnswers[q.id] = { question_id: q.id, option: null, text: '' };
        });

        this.surveyCurrentIndex = 0;
        this.dialog.open(this.surveyDialogTemp, { width: '600px' });
      }
    });
  }

  setSurveyAnswer(answerText: string, optionIdx: number | null = null) {
    const qId = this.surveyQuestions[this.surveyCurrentIndex].id;
    this.surveyAnswers[qId] = {
      question_id: qId,
      option: optionIdx,
      text: answerText
    };
  }

  canGoSurveyNext() {
    const q = this.surveyQuestions[this.surveyCurrentIndex];
    if (!q.required) return true;
    const ans = this.surveyAnswers[q.id];
    return ans && (ans.text.trim().length > 0 || ans.option !== null);
  }

  submitSurvey() {
    this.surveySubmitting = true;
    const submissionBody = {
      test_id: this.surveyTest.id,
      status: 'submitted',
      feedback: JSON.stringify(this.surveyAnswers)
    };

    this.submissionService.createSubmission(submissionBody).subscribe({
      next: () => {
        this.surveySubmitting = false;
        this.dialog.closeAll();
        this.loadData();
        this.setSection('my_tests');
      },
      error: () => {
        this.surveySubmitting = false;
        this.dialog.closeAll();
      }
    });
  }

  // Upload and Usability Review Submission Flow
  openSubmitDialog(sub: any) {
    this.selectedSubmission = sub;
    this.feedbackText = '';
    this.recordingBlob = null;
    this.uploadedFiles = [];
    this.dialog.open(this.submitDialogTemp, { width: '550px' });
  }

  onRecordingComplete(event: { blob: Blob; transcript?: string } | Blob) {
    if (event instanceof Blob) {
      this.recordingBlob = event;
    } else if (event && event.blob) {
      this.recordingBlob = event.blob;
      if (event.transcript) {
        this.feedbackText = (this.feedbackText || '') + '\n' + event.transcript;
      }
    }
  }

  handleFileSelect(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.uploadedFiles.push(files[i]);
      }
    }
  }

  removeFile(idx: number) {
    this.uploadedFiles.splice(idx, 1);
  }

  submitTest() {
    if (!this.feedbackText.trim()) return;
    this.submitting = true;

    // Simulate screen recording upload + submission file link attachments
    const uploadOps = [];
    if (this.recordingBlob) {
      const recFile = new File([this.recordingBlob], `recording_${Date.now()}.webm`, { type: 'video/webm' });
      uploadOps.push(this.testerService.uploadFile(recFile, 'tester-recordings'));
    }

    this.uploadedFiles.forEach(file => {
      uploadOps.push(this.testerService.uploadFile(file));
    });

    const completion = () => {
      this.submissionService.updateSubmission(this.selectedSubmission.id, {
        status: 'submitted',
        feedback: this.feedbackText,
        submitted_at: new Date().toISOString()
      }).subscribe({
        next: () => {
          this.submitting = false;
          this.dialog.closeAll();
          this.loadData();
        },
        error: () => this.submitting = false
      });
    };

    if (uploadOps.length > 0) {
      // Quick sequence trigger for mock/upload sync
      setTimeout(() => {
        completion();
      }, 1000);
    } else {
      completion();
    }
  }

  // Bank Connections Dialog
  openBankDialog() {
    this.dialog.open(this.bankDialogTemp, { width: '480px' });
  }

  saveBankDetails() {
    if (this.bankDetailsForm.invalid) return;
    this.saving = true;

    // Send updated bank details in profile payload
    const body = {
      ...this.editForm,
      bank_details: this.bankDetailsForm.value
    };

    this.testerService.updateProfile(body).subscribe({
      next: (prof) => {
        this.profile.set(prof);
        this.bankDetails.set(prof.bank_details);
        this.dialog.closeAll();
        this.saving = false;
      },
      error: () => this.saving = false
    });
  }

  handleIdProofSelect(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.uploadedFiles.push(files[0]);
    }
  }

  // Withdrawal Requests Dialog
  openWithdrawDialog() {
    this.withdrawForm.patchValue({ amount: Math.min(20, this.availableBalance()) });
    this.dialog.open(this.withdrawDialogTemp, { width: '400px' });
  }

  submitWithdrawal() {
    if (this.withdrawForm.invalid) return;
    this.withdrawSubmitting = true;

    // Mock payout deduction request triggering wallet refresh
    setTimeout(() => {
      this.withdrawSubmitting = false;
      this.dialog.closeAll();
      // Insert mock cash debit record
      const amt = this.withdrawForm.value.amount;
      this.earnings.update(list => [
        { id: `pay_${Date.now()}`, amount: -amt, description: 'Payout Withdrawal Transfer', status: 'pending', created_at: new Date().toISOString() },
        ...list
      ]);
    }, 1000);
  }
}
