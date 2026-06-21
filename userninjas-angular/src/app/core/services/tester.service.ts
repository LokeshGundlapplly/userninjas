import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TesterService {
  private readonly API_TESTER = `${environment.apiUrl}/api/tester`;
  private readonly API_USERS = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.API_USERS}/profile`);
  }

  updateProfile(profile: any): Observable<any> {
    return this.http.put<any>(`${this.API_USERS}/profile`, profile);
  }

  getEarnings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_TESTER}/earnings`);
  }

  getScheduledSessions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_TESTER}/scheduled-sessions`);
  }

  getAvailableSlots(testId: string): Observable<any[]> {
    const params = new HttpParams().set('testId', testId);
    return this.http.get<any[]>(`${this.API_TESTER}/available-slots`, { params });
  }

  bookSlot(slotId: string, testId: string): Observable<any> {
    return this.http.post<any>(`${this.API_TESTER}/book-slot`, { slotId, testId });
  }

  uploadFile(file: File, bucket: string = 'submission-attachments', path?: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    if (path) {
      formData.append('path', path);
    }
    return this.http.post<any>(`${environment.apiUrl}/api/storage/upload`, formData);
  }
}
