import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private readonly API = `${environment.apiUrl}/api/surveys`;

  constructor(private http: HttpClient) {}

  getSurveys(): Observable<any[]> {
    return this.http.get<any[]>(this.API);
  }

  getResponses(surveyId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/${surveyId}/responses`);
  }

  createSurvey(surveyData: any): Observable<any> {
    return this.http.post<any>(this.API, surveyData);
  }
}
