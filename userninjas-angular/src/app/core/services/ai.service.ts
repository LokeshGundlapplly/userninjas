import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AIResponse } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly API = `${environment.apiUrl}/api/ai`;

  constructor(private http: HttpClient) {}

  createTestStructure(productDescription: string, goals: string): Observable<AIResponse> {
    return this.http.post<AIResponse>(`${this.API}/create-test`, { productDescription, goals });
  }

  getInterviewQuestion(context: string, history: Array<{ role: string; content: string }>): Observable<AIResponse> {
    return this.http.post<AIResponse>(`${this.API}/interview-question`, { context, history });
  }

  generateReport(transcript: string, goals: string): Observable<AIResponse> {
    return this.http.post<AIResponse>(`${this.API}/interview-report`, { transcript, goals });
  }

  checkEligibility(screenerQuestions: string, answers: string): Observable<AIResponse> {
    return this.http.post<AIResponse>(`${this.API}/eligibility-check`, { screenerQuestions, answers });
  }

  summarizeTranscript(transcript: string): Observable<AIResponse> {
    return this.http.post<AIResponse>(`${this.API}/summarize-transcript`, { transcript });
  }
}
