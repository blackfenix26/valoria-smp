import assert from "node:assert/strict";
import test from "node:test";
import { canAccessStaffPath, canManageGallery, defaultTeamPath, isUserRole } from "./team-permissions";

test("team roles are valid without granting team access to regular users", () => {
  assert.equal(isUserRole("USER"), true);
  assert.equal(isUserRole("SUPPORT"), true);
  assert.equal(isUserRole("EVENTS"), true);
  assert.equal(isUserRole("OWNER"), false);
  assert.equal(canManageGallery("SUPPORT"), true);
  assert.equal(canManageGallery("EVENTS"), true);
  assert.equal(canManageGallery("USER"), false);
});

test("support can access only operational queues and community moderation", () => {
  assert.equal(canAccessStaffPath("SUPPORT", "/admin/pedidos"), true);
  assert.equal(canAccessStaffPath("SUPPORT", "/admin/suporte"), true);
  assert.equal(canAccessStaffPath("SUPPORT", "/admin/avaliacoes"), true);
  assert.equal(canAccessStaffPath("SUPPORT", "/admin/comunidade"), true);
  assert.equal(canAccessStaffPath("SUPPORT", "/admin/eventos"), false);
  assert.equal(canAccessStaffPath("SUPPORT", "/admin/comunidade/extra"), false);
  assert.equal(canAccessStaffPath("SUPPORT", "/api/admin/crud/order"), true);
  assert.equal(canAccessStaffPath("SUPPORT", "/api/admin/crud/product"), false);
  assert.equal(canAccessStaffPath("SUPPORT", "/api/admin/crud/order/extra"), false);
  assert.equal(canAccessStaffPath("SUPPORT", "/api/admin/upload"), false);
  assert.equal(canAccessStaffPath("SUPPORT", "/api/community/gallery"), true);
});

test("event team can also manage event and update content, while admin retains full access", () => {
  assert.equal(canAccessStaffPath("EVENTS", "/admin/eventos"), true);
  assert.equal(canAccessStaffPath("EVENTS", "/admin/atualizacoes"), true);
  assert.equal(canAccessStaffPath("EVENTS", "/api/admin/updates"), true);
  assert.equal(canAccessStaffPath("EVENTS", "/api/admin/crud/event"), true);
  assert.equal(canAccessStaffPath("EVENTS", "/api/admin/upload"), true);
  assert.equal(canAccessStaffPath("EVENTS", "/api/admin/crud/user"), false);
  assert.equal(canAccessStaffPath("EVENTS", "/api/admin/updates/extra"), false);
  assert.equal(canAccessStaffPath("ADMIN", "/admin/usuarios"), true);
  assert.equal(canAccessStaffPath("USER", "/admin/comunidade"), false);
  assert.equal(defaultTeamPath("EVENTS"), "/admin/eventos");
  assert.equal(defaultTeamPath("SUPPORT"), "/admin/pedidos");
});
