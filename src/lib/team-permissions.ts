export const TEAM_ROLES = ["ADMIN", "SUPPORT", "EVENTS"] as const;
export const USER_ROLES = ["USER", ...TEAM_ROLES] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(role: unknown): role is UserRole {
  return typeof role === "string" && USER_ROLES.includes(role as UserRole);
}

export function isTeamRole(role: unknown): role is Exclude<UserRole, "USER"> {
  return typeof role === "string" && TEAM_ROLES.includes(role as Exclude<UserRole, "USER">);
}

export function canManageGallery(role: unknown) {
  return isTeamRole(role);
}

export function defaultTeamPath(role: unknown) {
  if (role === "EVENTS") return "/admin/eventos";
  if (role === "SUPPORT") return "/admin/pedidos";
  return "/admin";
}

export function canAccessStaffPath(role: unknown, pathname: string) {
  if (role === "ADMIN") return true;
  if (!isTeamRole(role)) return false;

  if (pathname === "/admin/comunidade" || pathname === "/api/community/gallery") return true;

  const section = pathname.match(/^\/admin\/([^/]+)/)?.[1];
  if (section && ["pedidos", "suporte", "avaliacoes"].includes(section)) return true;
  if (role === "EVENTS" && section && ["atualizacoes", "eventos"].includes(section)) return true;

  if (pathname.startsWith("/api/admin/crud/")) {
    const model = pathname.slice("/api/admin/crud/".length);
    if (["order", "ticket", "review", "serverReview"].includes(model)) return true;
    if (role === "EVENTS" && model === "event") return true;
  }
  if (role === "EVENTS" && ["/api/admin/updates", "/api/admin/upload"].includes(pathname)) return true;

  return false;
}
