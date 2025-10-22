import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GridApi, ColDef, GridReadyEvent, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { DataService, QueryRequest } from '../../services/data.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-data-viewer',
  imports: [SharedModule],
  templateUrl: './data-viewer.component.html',
  styleUrl: './data-viewer.component.scss'
})
export class DataViewerComponent {
  collections: string[] = [];
  selectedCollection: string = '';
  searchTerm: string = '';
  
  gridApi!: GridApi;
  columnDefs: ColDef[] = [];
  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
    minWidth: 100
  };
  
  rowModelType: 'serverSide' = 'serverSide';
  cacheBlockSize = 100;
  maxBlocksInCache = 10;
  
  loading = false;

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
        if (this.collections.length > 0) {
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
      this.loadCollection();
    }
  }

  loadCollection(): void {
    if (!this.selectedCollection) return;

    this.loading = true;
    
    // First, fetch a sample to get field definitions
    const sampleRequest: QueryRequest = {
      page: 1,
      pageSize: 1,
      searchTerm: ''
    };

    this.dataService.queryCollection(this.selectedCollection, sampleRequest).subscribe({
      next: (response) => {
        this.createColumnDefs(response.fields);
        if (this.gridApi) {
          this.setupServerSideDatasource();
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

  createColumnDefs(fields: Array<{ field: string; type: string }>): void {
    this.columnDefs = fields.map(fieldDef => {
      const colDef: ColDef = {
        field: fieldDef.field,
        headerName: this.formatHeaderName(fieldDef.field),
        filter: this.getFilterType(fieldDef.type),
        sortable: true,
        resizable: true,
        floatingFilter: true
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
        return 'agSetColumnFilter';
      default:
        return 'agTextColumnFilter';
    }
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.setupServerSideDatasource();
  }

  setupServerSideDatasource(): void {
    const datasource: IServerSideDatasource = {
      getRows: (params: IServerSideGetRowsParams) => {
        const page = Math.floor(params.request.startRow! / this.cacheBlockSize) + 1;
        
        // Build filters
        const filters: { [key: string]: any } = {};
        if (params.request.filterModel) {
          Object.keys(params.request.filterModel).forEach(key => {
            const filterModel = (params.request.filterModel as { [key: string]: any })[key];
            if (filterModel.filter !== undefined && filterModel.filter !== null && filterModel.filter !== '') {
              filters[key] = {
                type: filterModel.type || 'contains',
                value: filterModel.filter
              };
            }
          });
        }

        // Build sort
        let sortField: string | undefined;
        let sortOrder: 'asc' | 'desc' = 'asc';
        if (params.request.sortModel && params.request.sortModel.length > 0) {
          sortField = params.request.sortModel[0].colId;
          sortOrder = params.request.sortModel[0].sort as 'asc' | 'desc';
        }

        const queryRequest: QueryRequest = {
          page,
          pageSize: this.cacheBlockSize,
          sortField,
          sortOrder,
          filters,
          searchTerm: this.searchTerm
        };

        this.dataService.queryCollection(this.selectedCollection, queryRequest).subscribe({
          next: (response) => {
            params.success({
              rowData: response.data,
              rowCount: response.totalCount
            });
          },
          error: (error) => {
            console.error('Error fetching data:', error);
            params.fail();
            this.snackBar.open('Failed to fetch data', 'Close', { duration: 3000 });
          }
        });
      }
    };

    this.gridApi.setGridOption('serverSideDatasource', datasource);
  }

  onSearch(): void {
    if (this.gridApi) {
      this.setupServerSideDatasource();
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  exportToCsv(): void {
    if (this.gridApi) {
      this.gridApi.exportDataAsCsv({
        fileName: `${this.selectedCollection}_export.csv`
      });
    }
  }
}
