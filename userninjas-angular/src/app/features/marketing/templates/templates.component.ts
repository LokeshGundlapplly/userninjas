import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface PublicTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  iconName: string;
  gradient: string;
  tags: string[];
  rating: number;
  uses: string;
}

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.css']
})
export class TemplatesComponent {
  searchQuery = '';
  selectedCategory = signal('All');

  categories = ['All', 'Usability', 'E-commerce', 'SaaS', 'Marketing'];

  templates: PublicTemplate[] = [
    {
      id: 'tpl_1',
      title: 'Sign Up & Onboarding Usability',
      description: 'Find blockers and navigation confusion in standard SaaS user signups.',
      category: 'SaaS',
      difficulty: 'beginner',
      iconName: 'person_add',
      gradient: 'from-blue-500/20 to-indigo-600/20',
      tags: ['Onboarding', 'SaaS', 'Form Design'],
      rating: 4.9,
      uses: '1,200 uses'
    },
    {
      id: 'tpl_2',
      title: 'Checkout Flow Cart Friction',
      description: 'Optimise conversion pathways and coupon validations for web stores.',
      category: 'E-commerce',
      difficulty: 'intermediate',
      iconName: 'shopping_cart',
      gradient: 'from-purple-500/20 to-pink-600/20',
      tags: ['Checkout', 'E-commerce', 'Funnel'],
      rating: 4.8,
      uses: '940 uses'
    },
    {
      id: 'tpl_3',
      title: 'Value Prop Clarity Review',
      description: 'Check landing page message understanding and visual appeal ratings.',
      category: 'Marketing',
      difficulty: 'beginner',
      iconName: 'visibility',
      gradient: 'from-emerald-500/20 to-teal-600/20',
      tags: ['Landing Page', 'Value Prop', 'Copywriting'],
      rating: 4.7,
      uses: '1,500 uses'
    }
  ];

  selectCategory(cat: string) {
    this.selectedCategory.set(cat);
  }

  getDifficultyClass(diff: string): string {
    switch (diff) {
      case 'beginner': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
  }

  filteredTemplates = computed(() => {
    let list = this.templates;
    const query = this.searchQuery.toLowerCase().trim();
    const cat = this.selectedCategory();

    if (cat !== 'All') {
      list = list.filter(t => t.category === cat);
    }
    if (query) {
      list = list.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    return list;
  });
}
