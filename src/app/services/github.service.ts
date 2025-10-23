import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { IntegrationStatus } from '../core/interfaces/github.interface';


@Injectable({
  providedIn: 'root'
})
export class GithubService {

  private apiUrl = 'http://localhost:3000/api/github';
  private userIdSubject = new BehaviorSubject<string | null>(this.getUserIdFromStorage());
  public userId$ = this.userIdSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getUserIdFromStorage(): string | null {
    return localStorage.getItem('github_user_id');
  }

  private setUserIdInStorage(userId: string): void {
    localStorage.setItem('github_user_id', userId);
    this.userIdSubject.next(userId);
  }

  private removeUserIdFromStorage(): void {
    localStorage.removeItem('github_user_id');
    this.userIdSubject.next(null);
  }

  setUserId(userId: string): void {
    this.setUserIdInStorage(userId);
  }

  getUserId(): string | null {
    return this.userIdSubject.value;
  }

  getAuthUrl(): Observable<{ authUrl: string }> {
    return this.http.get<{ authUrl: string }>(`${this.apiUrl}/auth-url`);
  }

  getIntegrationStatus(userId: string): Observable<IntegrationStatus> {
    return this.http.get<IntegrationStatus>(`${this.apiUrl}/status/${userId}`);
  }

  removeIntegration(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/integration/${userId}`).pipe(
      tap(() => this.removeUserIdFromStorage())
    );
  }

  resyncIntegration(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resync/${userId}`, {});
  }
}
