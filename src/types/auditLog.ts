
export interface AuditLog {
  id: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  details: string;
}

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