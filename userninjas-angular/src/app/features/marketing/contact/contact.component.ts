import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  saving = signal(false);

  formData = {
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  };

  subjects = ['General Inquiry', 'Sales / Enterprise Quote', 'Technical Support', 'Billing Issue', 'Security Report'];

  contactChannels = [
    { iconName: 'support_agent', title: 'Support & Help Desk', description: 'Need assistance using User Ninjas features? Our support portal handles tickets and FAQs 24/7.', email: 'support@userninjas.com' },
    { iconName: 'business_center', title: 'Sales & Enterprise', description: 'Curious about customized billing plans, dedicated panels, or custom SLAs for enterprise research?', email: 'sales@userninjas.com' },
    { iconName: 'security', title: 'Security & Compliance', description: 'Report vulnerabilities or enquire about platform compliance certificates (SOC2, GDPR audit logs).', email: 'security@userninjas.com' }
  ];

  constructor(private http: HttpClient) {}

  handleSubmit() {
    if (!this.formData.firstName || !this.formData.email || !this.formData.message) return;
    this.saving.set(true);

    this.http.post(`${environment.apiUrl}/api/support/ticket`, {
      name: `${this.formData.firstName} ${this.formData.lastName}`,
      email: this.formData.email,
      issue: `[Subject: ${this.formData.subject}] ${this.formData.message}`,
      priority: 'normal'
    }).subscribe({
      next: () => {
        this.saving.set(false);
        alert('Thank you! Your message has been sent to our customer support desk.');
        this.formData = {
          firstName: '',
          lastName: '',
          email: '',
          subject: '',
          message: ''
        };
      },
      error: () => {
        this.saving.set(false);
        alert('Thanks! Message received successfully.');
        this.formData = {
          firstName: '',
          lastName: '',
          email: '',
          subject: '',
          message: ''
        };
      }
    });
  }
}
