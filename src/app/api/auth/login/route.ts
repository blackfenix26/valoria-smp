import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { readJsonBody } from "@/lib/request-body";

export async function POST(request: Request) {
  const parsed = await readJsonBody<{ email?: unknown; password?: unknown }>(request, 2_048);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error === "too_large" ? "Requisição muito grande." : "JSON inválido." }, { status: parsed.error === "too_large" ? 413 : 400 });

  const email = typeof parsed.data.email === "string" ? parsed.data.email.trim().toLowerCase() : "";
  const password = typeof parsed.data.password === "string" ? parsed.data.password : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 1 || password.length > 128) {
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.active || (user.role !== "USER" && user.role !== "ADMIN") || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  await createSession({ id: user.id, role: user.role });
  return NextResponse.json({ ok: true, role: user.role });
}
