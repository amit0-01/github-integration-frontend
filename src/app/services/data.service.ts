import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface QueryRequest {
  page: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: { [key: string]: any };
  searchTerm?: string;
}

export interface QueryResponse {
  data: any[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  fields: Array<{ field: string; type: string }>;
}

export interface GlobalSearchRequest {
  searchTerm: string;
  collections?: string[];
}

export interface GlobalSearchResponse {
  results: Array<{
    collection: string;
    count: number;
    samples: any[];
  }>;
}


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
