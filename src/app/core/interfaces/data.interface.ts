
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
  