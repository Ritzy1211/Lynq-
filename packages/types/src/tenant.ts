/**
 * Tenant + role primitives. The API guard injects the current tenant into
 * every request based on the authenticated user's claims.
 */

export const UserRoles = {
  Owner: 'owner',
  Manager: 'manager',
  Staff: 'staff',
  Driver: 'driver',
  Customer: 'customer',
} as const;
export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

export const STAFF_ROLES: readonly UserRole[] = [UserRoles.Owner, UserRoles.Manager, UserRoles.Staff];
export const ADMIN_ROLES: readonly UserRole[] = [UserRoles.Owner, UserRoles.Manager];

export interface TenantClaims {
  tenantId: string;
  userId: string;
  role: UserRole;
  branchIds: string[];
}
