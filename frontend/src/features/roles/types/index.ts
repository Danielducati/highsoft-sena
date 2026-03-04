export interface Permission {
  id: string;
  name: string;
  category: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  usersCount: number;
}

export interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

export interface RolesModuleProps {
  userRole: "admin" | "employee" | "client";
}