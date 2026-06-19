import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Submission } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SubmissionService {
  private readonly API = `${environment.apiUrl}/api/submissions`;

  constructor(private http: HttpClient) {}

  getSubmissions(testId?: string): Observable<Submission[]> {
    let params = new HttpParams();
    if (testId) {
      params = params.set('testId', testId);
    }
    return this.http.get<Submission[]>(this.API, { params });
  }

  getSubmission(id: string): Observable<Submission> {
    return this.http.get<Submission>(`${this.API}/${id}`);
  }

  createSubmission(submission: Partial<Submission>): Observable<Submission> {
    return this.http.post<Submission>(this.API, submission);
  }

  updateSubmission(id: string, submission: Partial<Submission>): Observable<Submission> {
    return this.http.put<Submission>(`${this.API}/${id}`, submission);
  }
}
