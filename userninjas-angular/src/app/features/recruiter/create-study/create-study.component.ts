import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TestService } from '../../../core/services/test.service';

interface Question {
  question_text: string;
  question_type: 'open_text' | 'mcq' | 'rating' | 'yes_no';
  options: string[];
  required: boolean;
}

@Component({
  selector: 'app-create-study',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './create-study.component.html',
  styleUrls: ['./create-study.component.css']
})
export class CreateStudyComponent {
  saving = signal(false);

  // Form Fields
  title = '';
  category = 'Usability';
  testType = 'usability';
  duration = 15;
  reward = 10;
  description = '';
  objective = '';
  participantCriteria = '';

  categories = ['Usability', 'Functionality', 'Performance', 'Security', 'Accessibility', 'Mobile', 'Web App', 'Other'];
  testFormats = [
    { id: 'usability', label: 'Usability Test (Screen & Audio Recording)' },
    { id: 'survey', label: 'Survey Questionnaire (MCQ & Rating Stars)' },
    { id: 'interview', label: 'Moderated Live Session (Zoom Meeting)' }
  ];

  questions: Question[] = [
    { question_text: '', question_type: 'open_text', options: [], required: true }
  ];

  constructor(private testService: TestService, private router: Router) {}

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  addQuestion() {
    this.questions.push({
      question_text: '',
      question_type: 'open_text',
      options: [],
      required: true
    });
  }

  removeQuestion(idx: number) {
    this.questions.splice(idx, 1);
  }

  onQuestionTypeChange(qIdx: number, type: 'open_text' | 'mcq' | 'rating' | 'yes_no') {
    this.questions[qIdx].question_type = type;
    if (type === 'mcq') {
      this.questions[qIdx].options = ['Option 1', 'Option 2'];
    } else {
      this.questions[qIdx].options = [];
    }
  }

  addOption(qIdx: number) {
    this.questions[qIdx].options.push(`Option ${this.questions[qIdx].options.length + 1}`);
  }

  removeOption(qIdx: number, oIdx: number) {
    this.questions[qIdx].options.splice(oIdx, 1);
  }

  handlePublish() {
    if (!this.title.trim()) return;
    this.saving.set(true);

    const testPayload = {
      title: this.title,
      description: this.description || undefined,
      requirements: this.participantCriteria || undefined,
      reward_amount: this.reward,
      estimated_duration: this.duration,
      category: this.category,
      test_type: this.testType,
      status: 'active' as const,
      screener_questions: this.questions.map((q, idx) => ({
        id: `q-${idx}-${Date.now()}`,
        question: q.question_text,
        type: q.question_type,
        options: q.options,
        required: q.required
      }))
    };

    this.testService.createTest(testPayload).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/recruiter']);
      },
      error: () => this.saving.set(false)
    });
  }
}
