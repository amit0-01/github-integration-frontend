import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { QueryRequest, QueryResponse, GlobalSearchRequest, GlobalSearchResponse } from '../core/interfaces/data.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3000/api/data';

  constructor(private http: HttpClient) {}

  getCollections(): Observable<{ collections: string[] }> {
    return this.http.get<{ collections: string[] }>(`${this.apiUrl}/collections`);
  }

  queryCollection(collection: string, request: QueryRequest): Observable<QueryResponse> {
    return this.http.post<QueryResponse>(`${this.apiUrl}/query/${collection}`, request);
  }

  globalSearch(request: GlobalSearchRequest): Observable<GlobalSearchResponse> {
    return this.http.post<GlobalSearchResponse>(`${this.apiUrl}/search`, request);
  }

}
