
export interface SortDescriptor {
    field: string;
    dir: string;
  }
  
  export interface FilterDescriptor {
    field?: string;
    operator?: string;
    value?: string;
    logic?: string;
    filters?: FilterDescriptor[];
    isCaseSensitive?: boolean;
  }
  
export interface DynamicQuery {
    sort?: SortDescriptor[];
    filter?: FilterDescriptor;
    pageIndex: number;
    pageSize: number;
  }