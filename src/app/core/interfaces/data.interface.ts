
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
  fields: FieldDefinition[];
}


export interface FieldDefinition {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
}

export interface GlobalSearchRequest {
  searchTerm: string;
  collections?: string[];
}

export interface GlobalSearchResponse {
  results: SearchResult[];
}

export interface SearchResult {
  collection: string;
  count: number;
  samples: any[];
}

export interface CollectionsResponse {
  collections: string[];
}