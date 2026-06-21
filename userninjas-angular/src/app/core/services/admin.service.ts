import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${userId}/role`, { role });
  }

  getTests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tests`);
  }

  updateTest(testId: string, testData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/tests/${testId}`, testData);
  }

  deleteTest(testId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/tests/${testId}`);
  }

  getSubmissions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/submissions`);
  }

  getTickets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tickets`);
  }

  updateTicket(ticketId: string, ticketData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/tickets/${ticketId}`, ticketData);
  }

  getConversations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversations`);
  }

  getConversationMessages(convId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversations/${convId}/messages`);
  }

  sendAgentReply(convId: string, content: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/conversations/${convId}/messages`, { content });
  }

  closeConversation(convId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/conversations/${convId}/close`, {});
  }
}
