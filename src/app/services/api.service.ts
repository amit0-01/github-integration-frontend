import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl || 'https://api.example.com'; // fallback URL

  constructor() {}

  private buildUrl(endpoint: string): string {
    // ensure no double slashes
    return `${this.baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  }

  get<T>(endpoint: string, params?: HttpParams | { [param: string]: string | number }): Observable<T> {
    return this.http.get<T>(this.buildUrl(endpoint), { params });
  }

  post<T>(endpoint: string, body: any, headers?: HttpHeaders | { [header: string]: string | string[] }): Observable<T> {
    return this.http.post<T>(this.buildUrl(endpoint), body, { headers });
  }

  put<T>(endpoint: string, body: any, headers?: HttpHeaders | { [header: string]: string | string[] }): Observable<T> {
    return this.http.put<T>(this.buildUrl(endpoint), body, { headers });
  }

  delete<T>(endpoint: string, params?: HttpParams | { [param: string]: string | number }): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint), { params });
  }

  patch<T>(endpoint: string, body: any, headers?: HttpHeaders | { [header: string]: string | string[] }): Observable<T> {
    return this.http.patch<T>(this.buildUrl(endpoint), body, { headers });
  }
}
