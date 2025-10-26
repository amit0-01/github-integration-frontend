import { Component, OnInit } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { DataService } from '../../../services/data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QueryRequest, GlobalSearchRequest } from '../../../core/interfaces/data.interface';

@Component({
  selector: 'app-data-viewer',
  templateUrl: './data-viewer.component.html',
  styleUrls: ['./data-viewer.component.scss'],
  standalone : false
})
export class DataViewerComponent implements OnInit {
  collections: string[] = [];
  selectedCollection: string = '';
  selectedIntegration: string = 'github';
  searchTerm: string = '';
  searchMode: 'collection' | 'global' = 'collection';
  
  gridApi!: GridApi;
  columnDefs: ColDef[] = [];
  rowData: any[] = [];
  
  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
    flex: 1
  };
  
  // Pagination settings
  currentPage = 1;
  pageSize = 100;
  totalCount = 0;
  totalPages = 0;
  
  loading = false;
  
  // Global search results
  globalSearchResults: any[] = [];
  
  // Expose Math to template
  Math = Math;

  constructor(
    private dataService: DataService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCollections();
  }

  loadCollections(): void {
    this.loading = true;
    this.dataService.getCollections().subscribe({
      next: (response) => {
        this.collections = response.collections;
        if (this.collections.length > 0 && !this.selectedCollection) {
          this.selectedCollection = this.collections[0];
          this.loadCollection();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading collections:', error);
        this.snackBar.open('Failed to load collections', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onCollectionChange(): void {
    if (this.selectedCollection) {
      this.searchTerm = '';
      this.currentPage = 1;
      this.searchMode = 'collection';
      this.loadCollection();
    }
  }

  onSearchModeChange(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    if (this.searchMode === 'collection' && this.selectedCollection) {
      this.loadCollection();
    } else if (this.searchMode === 'global') {
      this.rowData = [];
      this.columnDefs = [];
      this.totalCount = 0;
      this.totalPages = 0;
    }
  }

  loadCollection(): void {
    if (!this.selectedCollection) return;

    this.loading = true;
    
    const queryRequest: QueryRequest = {
      page: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm
    };

    this.dataService.queryCollection(this.selectedCollection, queryRequest).subscribe({
      next: (response) => {
        this.rowData = response.data;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        
        // Create column definitions from fields
        if (response.fields && response.fields.length > 0) {
          this.createColumnDefs(response.fields);
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading collection:', error);
        this.snackBar.open('Failed to load collection data', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  performGlobalSearch(): void {
    if (!this.searchTerm.trim()) {
      this.snackBar.open('Please enter a search term', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    
    const searchRequest: any = {
      searchTerm: this.searchTerm,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.dataService.globalSearch(searchRequest).subscribe({
      next: (response:any) => {
        console.log('Global search response:', response);
        
        // Flatten results from all collections
        let allResults: any[] = [];
        let totalRecords = 0;
        
        response.results.forEach((result:any) => {
          // Handle both 'data' and 'samples' property names
          const items = result.data || result.samples || [];
          
          items.forEach((item: any) => {
            allResults.push({
              _collection: result.collection,
              ...item
            });
          });
          
          totalRecords += result.count || items.length;
        });
        
        console.log('Flattened results:', allResults);
        
        this.rowData = allResults;
        this.totalCount = totalRecords;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        
        // Create dynamic columns based on results
        if (allResults.length > 0) {
          this.createGlobalSearchColumns(allResults);
        } else {
          this.columnDefs = [];
        }
        
        this.loading = false;
        
        if (allResults.length > 0) {
          this.snackBar.open(
            `Found ${totalRecords} results across ${response.results.length} collections`,
            'Close',
            { duration: 3000 }
          );
        } else {
          this.snackBar.open(
            `No results found for "${this.searchTerm}"`,
            'Close',
            { duration: 3000 }
          );
        }
      },
      error: (error) => {
        console.error('Error performing global search:', error);
        this.snackBar.open('Failed to perform global search', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  createGlobalSearchColumns(results: any[]): void {
    // Get all unique keys from results
    const allKeys = new Set<string>();
    results.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== '__v') {
          allKeys.add(key);
        }
      });
    });

    // Create column with collection first
    this.columnDefs = [
      {
        field: '_collection',
        headerName: 'Collection',
        pinned: 'left',
        width: 150,
        filter: 'agTextColumnFilter',
        sortable: true,
        resizable: true
      }
    ];

    // Add other columns
    Array.from(allKeys).forEach(key => {
      if (key !== '_collection') {
        const sampleValue = results.find(r => r[key] !== undefined)?.[key];
        const type = this.inferType(sampleValue);
        
        this.columnDefs.push({
          field: key,
          headerName: this.formatHeaderName(key),
          filter: this.getFilterType(type),
          sortable: true,
          resizable: true,
          valueFormatter: this.getValueFormatter(type)
        });
      }
    });
  }

  inferType(value: any): string {
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'date';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'string';
  }

  getValueFormatter(type: string): ((params: any) => string) | undefined {
    switch (type) {
      case 'date':
        return (params) => params.value ? new Date(params.value).toLocaleString() : '';
      case 'object':
      case 'array':
        return (params) => params.value ? JSON.stringify(params.value) : '';
      case 'boolean':
        return (params) => params.value ? 'Yes' : 'No';
      default:
        return undefined;
    }
  }

  createColumnDefs(fields: Array<{ field: string; type: string }>): void {
    this.columnDefs = fields.map(fieldDef => {
      const colDef: ColDef = {
        field: fieldDef.field,
        headerName: this.formatHeaderName(fieldDef.field),
        filter: this.getFilterType(fieldDef.type),
        sortable: true,
        resizable: true
      };

      // Special handling for different types
      if (fieldDef.type === 'date') {
        colDef.valueFormatter = params => {
          if (params.value) {
            return new Date(params.value).toLocaleString();
          }
          return '';
        };
      } else if (fieldDef.type === 'object' || fieldDef.type === 'array') {
        colDef.valueFormatter = params => {
          if (params.value) {
            return JSON.stringify(params.value);
          }
          return '';
        };
        colDef.filter = 'agTextColumnFilter';
      } else if (fieldDef.type === 'boolean') {
        colDef.valueFormatter = params => {
          return params.value ? 'Yes' : 'No';
        };
        colDef.filter = 'agTextColumnFilter';
        colDef.filterParams = {
          filterOptions: ['contains', 'notContains', 'equals'],
          suppressAndOrCondition: true
        };
      }

      return colDef;
    });
  }

  formatHeaderName(field: string): string {
    return field
      .split(/[._]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getFilterType(type: string): string {
    switch (type) {
      case 'number':
        return 'agNumberColumnFilter';
      case 'date':
        return 'agDateColumnFilter';
      case 'boolean':
        return 'agTextColumnFilter';  
      default:
        return 'agTextColumnFilter';
    }
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onSearch(): void {
    this.currentPage = 1;
    
    if (this.searchMode === 'global') {
      this.performGlobalSearch();
    } else {
      this.loadCollection();
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    if (this.searchMode === 'global') {
      this.rowData = [];
      this.columnDefs = [];
      this.totalCount = 0;
      this.totalPages = 0;
    } else {
      this.loadCollection();
    }
  }

  onSortChanged(): void {
    if (!this.gridApi || this.searchMode === 'global') return;
    
    const sortModel = this.gridApi.getColumnState()
      .filter(col => col.sort != null)
      .map(col => ({ colId: col.colId, sort: col.sort }));
    
    if (sortModel.length > 0) {
      const queryRequest: QueryRequest = {
        page: this.currentPage,
        pageSize: this.pageSize,
        sortField: sortModel[0].colId,
        sortOrder: sortModel[0].sort as 'asc' | 'desc',
        searchTerm: this.searchTerm
      };
      
      this.loading = true;
      this.dataService.queryCollection(this.selectedCollection, queryRequest).subscribe({
        next: (response) => {
          this.rowData = response.data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error sorting data:', error);
          this.loading = false;
        }
      });
    }
  }

  onFilterChanged(): void {
    if (!this.gridApi || this.searchMode === 'global') return;
    
    const filterModel = this.gridApi.getFilterModel();
    const filters: { [key: string]: any } = {};
    
    Object.keys(filterModel).forEach(key => {
      const filter = filterModel[key];
      if (filter.filter) {
        filters[key] = {
          type: filter.type || 'contains',
          value: filter.filter
        };
      }
    });
    
    const queryRequest: QueryRequest = {
      page: 1,
      pageSize: this.pageSize,
      filters,
      searchTerm: this.searchTerm
    };
    
    this.loading = true;
    this.dataService.queryCollection(this.selectedCollection, queryRequest).subscribe({
      next: (response) => {
        this.rowData = response.data;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        this.currentPage = 1;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error filtering data:', error);
        this.loading = false;
      }
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      if (this.searchMode === 'global') {
        this.performGlobalSearch();
      } else {
        this.loadCollection();
      }
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      if (this.searchMode === 'global') {
        this.performGlobalSearch();
      } else {
        this.loadCollection();
      }
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      if (this.searchMode === 'global') {
        this.performGlobalSearch();
      } else {
        this.loadCollection();
      }
    }
  }

  exportToCsv(): void {
    if (this.gridApi) {
      const filename = this.searchMode === 'global' 
        ? `global_search_${this.searchTerm}_export.csv`
        : `${this.selectedCollection}_export.csv`;
      
      this.gridApi.exportDataAsCsv({
        fileName: filename
      });
    }
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}