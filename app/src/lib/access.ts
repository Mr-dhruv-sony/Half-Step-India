import { UserRole } from "@prisma/client";

export const ALL_ROLES: UserRole[] = [
  UserRole.admin,
  UserRole.department_officer,
  UserRole.field_inspector,
  UserRole.citizen,
];

export const MANAGEMENT_ROLES: UserRole[] = [
  UserRole.admin,
  UserRole.department_officer,
  UserRole.field_inspector,
];

export function hasRoleAccess(
  role: string | undefined,
  allowedRoles: readonly UserRole[]
): boolean {
  return !!role && allowedRoles.includes(role as UserRole);
}

export function getRoleLabel(role: string | undefined): string {
  switch (role) {
    case UserRole.admin:
      return "Admin";
    case UserRole.department_officer:
      return "Department Officer";
    case UserRole.field_inspector:
      return "Field Inspector";
    case UserRole.citizen:
      return "Citizen";
    default:
      return "User";
  }
}
