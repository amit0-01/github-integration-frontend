import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  QueryRequest,
  QueryResponse,
  GlobalSearchRequest,
  GlobalSearchResponse,
  CollectionsResponse
} from '../core/interfaces/data.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private api: ApiService) {}

  getCollections(): Observable<CollectionsResponse> {
    return this.api.get<CollectionsResponse>('data/collections');
  }

  queryCollection(collection: string, request: QueryRequest): Observable<QueryResponse> {
    return this.api.post<QueryResponse>(`data/query/${collection}`, request);
  }

  globalSearch(request: GlobalSearchRequest): Observable<GlobalSearchResponse> {
    return this.api.post<GlobalSearchResponse>('data/search', request);
  }
}