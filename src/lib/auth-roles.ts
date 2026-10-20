import { adminAc, userAc } from "better-auth/plugins/admin/access";

export const roles = { ADMIN: adminAc, USER: userAc };
export type Role = keyof typeof roles;

export function hasRole(actual: string | null | undefined, required: Role) {
  // Unknown roles fail closed. Roles are assigned only through trusted admin APIs.
  return actual === required || (required === "USER" && actual === "ADMIN");
}
