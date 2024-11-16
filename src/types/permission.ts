export interface Permission {
  id: string;
  feature: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
  isDefault: boolean;
  permissions?: Permission[];
}

export interface PaginatedResponse<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
} 