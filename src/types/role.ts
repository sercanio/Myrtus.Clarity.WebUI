import { Permission } from "./permission";

export interface Role {
    id: string;
    name: string;
    isDefault: boolean;
  }

  export interface RoleWithPermissions {
    id: string;
    name: string;
    isDefault: boolean;
    permissions?: Permission[];
  }