import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ZoomSupportService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createZoomMeeting(topic: string, duration: number, startTime?: string): Observable<any> {
    return this.http.post<any>(`${this.API}/api/zoom/meeting`, { topic, duration, startTime });
  }

  createSupportTicket(name: string, email: string, issue: string, conversationId?: string, priority?: string): Observable<any> {
    return this.http.post<any>(`${this.API}/api/support/ticket`, { name, email, issue, conversation_id: conversationId, priority });
  }

  sendEmail(to: string | string[], subject: string, html: string, from?: string): Observable<any> {
    return this.http.post<any>(`${this.API}/api/email/send`, { to, subject, html, from });
  }

  sendReviewNotification(req: {
    submissionId: string;
    testerId: string;
    testTitle: string;
    status: 'approved' | 'rejected';
    reviewerFeedback?: string;
    rewardAmount?: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.API}/api/email/review-notification`, req);
  }
}
