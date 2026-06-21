import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SurveyService } from '../../../core/services/survey.service';

interface Question {
  question_text: string;
  question_type: 'open_text' | 'mcq' | 'rating' | 'yes_no';
  options: string[];
  required: boolean;
}

@Component({
  selector: 'app-survey-builder',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './survey-builder.component.html',
  styleUrls: ['./survey-builder.component.css']
})
export class SurveyBuilderComponent implements OnInit {
  tab = signal('create');
  saving = signal(false);
  loading = signal(false);

  // Form Fields
  title = '';
  description = '';
  questions: Question[] = [
    { question_text: '', question_type: 'open_text', options: [], required: true }
  ];

  // Survey Registry lists
  surveys = signal<any[]>([]);
  selectedSurveyId = signal<string | null>(null);
  selectedSurvey = signal<any>(null);
  responses = signal<any[]>([]);

  constructor(private surveyService: SurveyService) {}

  ngOnInit() {
    this.loadSurveys();
  }

  setTab(tabName: string) {
    this.tab.set(tabName);
    if (tabName === 'manage') {
      this.loadSurveys();
    }
  }

  loadSurveys() {
    this.loading.set(true);
    this.surveyService.getSurveys().subscribe({
      next: (list) => {
        this.surveys.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  addQ() {
    this.questions.push({
      question_text: '',
      question_type: 'open_text',
      options: [],
      required: true
    });
  }

  removeQ(idx: number) {
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

  handleCreate() {
    if (!this.title.trim()) return;
    this.saving.set(true);

    const surveyPayload = {
      title: this.title,
      description: this.description || null,
      status: 'active',
      questions: this.questions.map((q, idx) => ({
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options,
        required: q.required,
        sort_order: idx
      }))
    };

    this.surveyService.createSurvey(surveyPayload).subscribe({
      next: () => {
        this.saving.set(false);
        this.title = '';
        this.description = '';
        this.questions = [{ question_text: '', question_type: 'open_text', options: [], required: true }];
        this.setTab('manage');
      },
      error: () => this.saving.set(false)
    });
  }

  viewSurveyResults(surveyId: string) {
    this.selectedSurveyId.set(surveyId);
    this.selectedSurvey.set(this.surveys().find(s => s.id === surveyId));
    this.loading.set(true);

    this.surveyService.getResponses(surveyId).subscribe({
      next: (list) => {
        // Map answers back to formatted JSON for display
        this.responses.set(list.map(r => ({
          ...r,
          answers: typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers
        })));
        this.loading.set(false);
        this.setTab('results');
      },
      error: () => this.loading.set(false)
    });
  }
}
