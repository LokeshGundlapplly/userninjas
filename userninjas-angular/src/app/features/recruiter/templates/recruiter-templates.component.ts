import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TestService } from '../../../core/services/test.service';

interface TemplateQuestion {
  question_text: string;
  question_type: 'open_text' | 'mcq' | 'rating' | 'yes_no';
  required: boolean;
  options: string[];
}

interface ResearchTemplate {
  id: string;
  category: string;
  testType: string;
  name: string;
  description: string;
  duration: number;
  rewardAmount: number;
  objective: string;
  participantCriteria: string;
  questions: TemplateQuestion[];
}

@Component({
  selector: 'app-recruiter-templates',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './recruiter-templates.component.html',
  styleUrls: ['./recruiter-templates.component.css']
})
export class RecruiterTemplatesComponent {
  searchQuery = '';
  selectedCategory = signal('All');
  showBookmarksOnly = signal(false);
  bookmarkedIds = signal<string[]>([]);
  selectedPreviewTemplate = signal<ResearchTemplate | null>(null);

  categories = ['All', 'Usability', 'E-commerce', 'SaaS', 'Onboarding'];

  templatesList: ResearchTemplate[] = [
    {
      id: 'tpl_1',
      category: 'Onboarding',
      testType: 'usability',
      name: 'SaaS Signup & Onboarding Flow',
      description: 'Evaluate checkout setup and sign-up flows for fresh B2B SaaS registrations.',
      duration: 15,
      rewardAmount: 15,
      objective: 'Discover onboarding blockers and profile page confusion points.',
      participantCriteria: 'Software engineers, product managers, or tech professionals.',
      questions: [
        { question_text: 'Did the sign-up process ask for too much information?', question_type: 'yes_no', required: true, options: [] },
        { question_text: 'Rate the onboarding walkthrough guide clarity', question_type: 'rating', required: true, options: [] },
        { question_text: 'What took you the longest to configure during signup?', question_type: 'open_text', required: false, options: [] }
      ]
    },
    {
      id: 'tpl_2',
      category: 'E-commerce',
      testType: 'usability',
      name: 'Cart Review & Checkout Friction',
      description: 'Run shoppers through product additions, coupons application, and payments validation pathways.',
      duration: 20,
      rewardAmount: 20,
      objective: 'Pinpoint friction events causing checkout funnel drop-offs.',
      participantCriteria: 'Frequent online shoppers who buy products weekly.',
      questions: [
        { question_text: 'Were the coupon application methods clear?', question_type: 'yes_no', required: true, options: [] },
        { question_text: 'Rate the shipping calculations transparency', question_type: 'rating', required: true, options: [] },
        { question_text: 'What was your main concern on the final payment page?', question_type: 'open_text', required: true, options: [] }
      ]
    },
    {
      id: 'tpl_3',
      category: 'Usability',
      testType: 'survey',
      name: 'General Product Clarity Survey',
      description: 'Standalone surveys checking overall visual hierarchy and platform value proposition.',
      duration: 10,
      rewardAmount: 8,
      objective: 'Validate value proposition copy clarity and visual design appeal.',
      participantCriteria: 'General internet consumers aged 18-50.',
      questions: [
        { question_text: 'What does this platform do in your own words?', question_type: 'open_text', required: true, options: [] },
        { question_text: 'Which feature seems the most valuable to you?', question_type: 'mcq', required: true, options: ['AI Analytics Dashboard', 'Screen Recording Tool', 'Pre-built Templates Library', 'Live Video Interviews'] }
      ]
    }
  ];

  constructor(private testService: TestService, private router: Router) {}

  toggleBookmarksFilter() {
    this.showBookmarksOnly.set(!this.showBookmarksOnly());
  }

  selectCategory(cat: string) {
    this.selectedCategory.set(cat);
  }

  toggleBookmark(id: string) {
    const list = [...this.bookmarkedIds()];
    const idx = list.indexOf(id);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(id);
    }
    this.bookmarkedIds.set(list);
  }

  isBookmarked(id: string): boolean {
    return this.bookmarkedIds().includes(id);
  }

  previewTemplate(tpl: ResearchTemplate) {
    this.selectedPreviewTemplate.set(tpl);
  }

  useTemplate(tpl: ResearchTemplate) {
    // Navigate recruiter to create-test wizard pre-filled with this template parameters
    // We can simulate this by putting it in localStorage
    try {
      localStorage.setItem('un_ai_suggestion', JSON.stringify({
        title: `Research Study: ${tpl.name}`,
        description: tpl.description,
        category: tpl.category,
        estimated_duration: tpl.duration,
        reward_amount: tpl.rewardAmount,
        test_type: tpl.testType,
        questions: tpl.questions
      }));
    } catch { /* ignore */ }

    this.selectedPreviewTemplate.set(null);
    this.router.navigate(['/recruiter/create-test']);
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategory.set('All');
    this.showBookmarksOnly.set(false);
  }

  filteredTemplates = computed(() => {
    let list = this.templatesList;
    const query = this.searchQuery.toLowerCase().trim();
    const cat = this.selectedCategory();
    const bookmarksOnly = this.showBookmarksOnly();

    if (bookmarksOnly) {
      list = list.filter(t => this.isBookmarked(t.id));
    }
    if (cat !== 'All') {
      list = list.filter(t => t.category === cat);
    }
    if (query) {
      list = list.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.objective.toLowerCase().includes(query)
      );
    }
    return list;
  });
}
