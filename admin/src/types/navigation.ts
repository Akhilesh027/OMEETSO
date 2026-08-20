import { Permission } from "@/permissions/permissions";

export interface NavItem {
  id: string;
  label: string;
  route: string;
  iconName: string;
  permission?: Permission;
  permissions?: Permission[];
  badge?: number | string;
  badgeColor?: "warning" | "error" | "info" | "success" | "indigo";
  children?: NavItem[];
}

export interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}
