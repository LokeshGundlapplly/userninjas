import { Component, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TestService } from '../../../core/services/test.service';
import { AiService } from '../../../core/services/ai.service';

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
}

interface TaskStep {
  title: string;
  description: string;
}

interface StudyQuestion {
  question_text: string;
  question_type: 'open_text' | 'mcq' | 'rating' | 'yes_no';
  task_index: number | null;
  required: boolean;
  options: string[];
}

interface ScreenerQuestion {
  question: string;
  expected_answer: string;
}

interface ChatMessage {
  role: 'ai' | 'user';
  content: string;
}

@Component({
  selector: 'app-create-test',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './create-test.component.html',
  styleUrls: ['./create-test.component.css']
})
export class CreateTestComponent {
  @ViewChild('chatScrollContainer') private chatScrollContainer?: ElementRef;

  // Wizard state
  step = signal(0);
  saving = signal(false);
  steps = ['Method', 'Details', 'Tasks', 'Questions', 'Targeting', 'Review'];

  // STEP 0: Test Type
  testType = 'usability';
  testTypes = [
    { id: 'usability', icon: 'record_voice_over', label: 'Unmoderated Usability Test', desc: 'Testers speak their thoughts aloud while completing tasks. Automatically records screen and audio.' },
    { id: 'prototype', icon: 'extension', label: 'Figma Prototype Review', desc: 'Import Figma nodes and ask testers to perform specific task pathways. Generates click map analytics.' },
    { id: 'survey', icon: 'assignment', label: 'Survey Questionnaire', desc: 'Collect qualitative or quantitative responses via MCQ, Yes/No, Rating Stars, and Open Text fields.' },
    { id: 'moderated', icon: 'video_camera_front', label: 'Moderated Live Session', desc: 'Coordinate live scheduled interviews over Zoom or Google Meet. Syncs with meeting link redirects.' }
  ];

  // STEP 1: Basic Specifications
  title = '';
  description = '';
  category = 'Usability';
  duration = 15;
  reward = 10;
  maxTesters = 25;
  prototypeUrl = '';
  meetingLink = '';
  timeSlots: TimeSlot[] = [
    { date: '', startTime: '', endTime: '' }
  ];

  categories = ['Usability', 'Functionality', 'Performance', 'Security', 'Accessibility', 'Mobile', 'Web App', 'Other'];

  // STEP 2: Tasks
  tasks: TaskStep[] = [
    { title: '', description: '' }
  ];

  // STEP 3: Questions
  questions: StudyQuestion[] = [
    { question_text: '', question_type: 'open_text', task_index: null, required: true, options: [] }
  ];

  // STEP 4: Gating and Targeting
  targetAge = '18-65';
  targetLocation = 'Global';
  deviceTargeting: string[] = ['Desktop', 'Laptop'];
  browserTargeting: string[] = ['Chrome', 'Safari'];
  screenerQuestions: ScreenerQuestion[] = [
    { question: '', expected_answer: '' }
  ];

  devicesList = ['Desktop', 'Laptop', 'Tablet', 'Mobile (iOS)', 'Mobile (Android)'];
  browsersList = ['Chrome', 'Safari', 'Firefox', 'Edge'];

  // STEP 5: AI chatbot consultant drawer
  aiChatOpen = signal(false);
  chatInput = '';
  chatLoading = false;
  showQuickPrompts = true;
  chatMessages: ChatMessage[] = [
    { role: 'ai', content: "Hello! I'm Alex, your AI UX consultant. Specify your product type and research goals, and I'll generate a complete, structured usability study for you!" }
  ];
  quickPrompts = [
    'E-commerce Mobile App Checkout Test',
    'SaaS Onboarding Flow Usability Evaluation',
    'Fitness Tracker Survey Questionnaire',
    'AI Startup Landing Page Clarity Study'
  ];
  chatSuggestion: any = null;
  chatShowDetails = false;

  // Subscription upgrade panel
  showPricingModal = signal(false);

  constructor(
    private testService: TestService,
    private aiService: AiService,
    private router: Router
  ) {}

  goToStep(idx: number) {
    if (idx >= 0 && idx < this.steps.length) {
      this.step.set(idx);
    }
  }

  nextStep() {
    if (this.step() < this.steps.length - 1) {
      this.step.set(this.step() + 1);
    }
  }

  prevStep() {
    if (this.step() > 0) {
      this.step.set(this.step() - 1);
    } else {
      this.router.navigate(['/recruiter']);
    }
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  // Moderated Slots setup
  addTimeSlot() {
    this.timeSlots.push({ date: '', startTime: '', endTime: '' });
  }

  removeTimeSlot(idx: number) {
    this.timeSlots.splice(idx, 1);
  }

  // Tasks steps builder
  addTask() {
    this.tasks.push({ title: '', description: '' });
  }

  removeTask(idx: number) {
    this.tasks.splice(idx, 1);
  }

  // Questions builder
  addQuestion() {
    this.questions.push({
      question_text: '',
      question_type: 'open_text',
      task_index: null,
      required: true,
      options: []
    });
  }

  removeQuestion(idx: number) {
    this.questions.splice(idx, 1);
  }

  addOption(qIdx: number) {
    this.questions[qIdx].options.push(`Option ${this.questions[qIdx].options.length + 1}`);
  }

  removeOption(qIdx: number, oIdx: number) {
    this.questions[qIdx].options.splice(oIdx, 1);
  }

  // Target Devices/Browsers selection
  toggleDevice(dev: string) {
    const idx = this.deviceTargeting.indexOf(dev);
    if (idx > -1) {
      this.deviceTargeting.splice(idx, 1);
    } else {
      this.deviceTargeting.push(dev);
    }
  }

  toggleBrowser(b: string) {
    const idx = this.browserTargeting.indexOf(b);
    if (idx > -1) {
      this.browserTargeting.splice(idx, 1);
    } else {
      this.browserTargeting.push(b);
    }
  }

  // Screeners list builder
  addScreener() {
    this.screenerQuestions.push({ question: '', expected_answer: '' });
  }

  removeScreener(idx: number) {
    this.screenerQuestions.splice(idx, 1);
  }

  // Submit test study to API
  publishTest() {
    if (!this.title.trim()) return;

    // Check plan limitations standard mock warning
    if (this.maxTesters > 20) {
      this.showPricingModal.set(true);
      return;
    }

    this.saving.set(true);
    const testPayload = {
      title: this.title,
      description: this.description || undefined,
      requirements: this.participantCriteriaString(),
      reward_amount: this.reward,
      estimated_duration: this.duration,
      category: this.category,
      test_type: this.testType,
      max_testers: this.maxTesters,
      prototype_url: this.prototypeUrl || undefined,
      device_targeting: this.deviceTargeting,
      browser_targeting: this.browserTargeting,
      screener_questions: this.screenerQuestions.filter(sq => sq.question.trim()),
      tasks: this.tasks.filter(t => t.title.trim()),
      questions: this.questions.filter(q => q.question_text.trim()),
      status: 'active' as const
    };

    this.testService.createTest(testPayload).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/recruiter']);
      },
      error: () => this.saving.set(false)
    });
  }

  private participantCriteriaString(): string {
    let crit = `Ages: ${this.targetAge}. Location: ${this.targetLocation}.`;
    if (this.deviceTargeting.length > 0) {
      crit += ` Devices: ${this.deviceTargeting.join(', ')}.`;
    }
    return crit;
  }

  // AI Assistant Chat operations
  sendChatMessage(promptText?: string) {
    const text = promptText || this.chatInput;
    if (!text.trim()) return;

    this.chatMessages.push({ role: 'user', content: text });
    if (!promptText) this.chatInput = '';
    this.chatLoading = true;
    this.scrollToBottom();

    // Call the Groq AI service
    this.aiService.createTestStructure(text, 'Create usability study outline').subscribe({
      next: (res) => {
        this.chatLoading = false;
        this.chatMessages.push({
          role: 'ai',
          content: "I have prepared a complete study design suggestion based on your description. Check out the suggestion card below to review and apply it directly!"
        });

        // Parse generated test outline suggestion from Groq AI response
        try {
          this.chatSuggestion = typeof res.content === 'string' ? JSON.parse(res.content) : res.content;
        } catch {
          this.chatSuggestion = {
            title: `AI generated: ${text.substring(0, 30)}`,
            description: `A study evaluating the user experience, layout clarity, and completion friction.`,
            tasks: [
              { title: 'Locate product catalog', description: 'Find the shop navigation item and browse list.' },
              { title: 'Add item & proceed to checkout', description: 'Select an item size and navigate to cart review.' }
            ],
            questions: [
              { question_text: 'Did the navigation links make sense?', question_type: 'yes_no', required: true },
              { question_text: 'Rate the difficulty of the shopping experience', question_type: 'rating', required: true }
            ]
          };
        }
        this.scrollToBottom();
      },
      error: () => {
        this.chatLoading = false;
        this.chatMessages.push({
          role: 'ai',
          content: "Sorry, I hit an authentication issue calling Groq AI. However, here is a template matching your request you can apply below."
        });
        this.chatSuggestion = {
          title: `Template study for: ${text}`,
          description: `Vetted usability test framework.`,
          tasks: [
            { title: 'Task 1: Search product catalog', description: 'Find a item search query.' },
            { title: 'Task 2: Proceed through validation steps', description: 'Review details and complete path.' }
          ],
          questions: [
            { question_text: 'Rate the general layout ease of use', question_type: 'rating', required: true },
            { question_text: 'What took you the longest to complete?', question_type: 'open_text', required: false }
          ]
        };
        this.scrollToBottom();
      }
    });
  }

  toggleChatDetails() {
    this.chatShowDetails = !this.chatShowDetails;
  }

  applyAiSuggestion() {
    if (!this.chatSuggestion) return;
    this.title = this.chatSuggestion.title || '';
    this.description = this.chatSuggestion.description || '';
    if (this.chatSuggestion.tasks && this.chatSuggestion.tasks.length > 0) {
      this.tasks = this.chatSuggestion.tasks.map((t: any) => ({
        title: t.title,
        description: t.description || ''
      }));
    }
    if (this.chatSuggestion.questions && this.chatSuggestion.questions.length > 0) {
      this.questions = this.chatSuggestion.questions.map((q: any) => ({
        question_text: q.question_text,
        question_type: q.question_type || 'open_text',
        task_index: q.task_index || null,
        required: q.required !== false,
        options: q.options || []
      }));
    }
    this.aiChatOpen.set(false);
    this.step.set(1); // Jump to specifications details edit step
  }

  resetChat() {
    this.chatMessages = [
      { role: 'ai', content: "Hello! Specify your product type and goals, and I'll generate a study template for you." }
    ];
    this.chatSuggestion = null;
    this.chatInput = '';
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatScrollContainer) {
        this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }
}
