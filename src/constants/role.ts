export const ROLES = {
    ADMIN: 'Admin',
    EDITOR: 'Editor',
    REGISTERED: 'Registered',
  } as const;
  
  export type Role = typeof ROLES[keyof typeof ROLES];