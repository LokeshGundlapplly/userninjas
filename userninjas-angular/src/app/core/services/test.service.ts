import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Test } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TestService {
  private readonly API = `${environment.apiUrl}/api/tests`;

  constructor(private http: HttpClient) {}

  getTests(): Observable<Test[]> {
    return this.http.get<Test[]>(this.API);
  }

  getTest(id: string): Observable<Test> {
    return this.http.get<Test>(`${this.API}/${id}`);
  }

  createTest(test: Partial<Test>): Observable<Test> {
    return this.http.post<Test>(this.API, test);
  }

  updateTest(id: string, test: Partial<Test>): Observable<Test> {
    return this.http.put<Test>(`${this.API}/${id}`, test);
  }

  deleteTest(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
