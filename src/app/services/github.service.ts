import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { IntegrationStatus, AuthUrlResponse, ResyncResponse, SyncStatusResponse, ApiSuccessResponse } from '../core/interfaces/github.interface';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private userIdSubject = new BehaviorSubject<string | null>(this.getUserIdFromStorage());
  public userId$ = this.userIdSubject.asObservable();

  constructor(private api: ApiService) {}

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


  getAuthUrl(): Observable<AuthUrlResponse> {
    return this.api.get<AuthUrlResponse>('github/auth-url');
  }


  getIntegrationStatus(userId: string): Observable<IntegrationStatus> {
    return this.api.get<IntegrationStatus>(`github/status/${userId}`);
  }


  removeIntegration(userId: string): Observable<ApiSuccessResponse> {
    return this.api.delete<ApiSuccessResponse>(`github/integration/${userId}`).pipe(
      tap(() => this.removeUserIdFromStorage())
    );
  }

  resyncIntegration(userId: string): Observable<ResyncResponse> {
    return this.api.post<ResyncResponse>(`github/resync/${userId}`, {});
  }

  getSyncStatus(userId: string): Observable<SyncStatusResponse> {
    return this.api.get<SyncStatusResponse>(`github/sync-status/${userId}`);
  }
}