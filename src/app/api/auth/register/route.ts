import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { readJsonBody } from "@/lib/request-body";

export async function POST(request: Request) {
  const parsed = await readJsonBody<{ name?: unknown; username?: unknown; email?: unknown; password?: unknown }>(request, 4_096);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error === "too_large" ? "Requisição muito grande." : "JSON inválido." }, { status: parsed.error === "too_large" ? 413 : 400 });

  const name = typeof parsed.data.name === "string" ? parsed.data.name.trim() : "";
  const username = typeof parsed.data.username === "string" ? parsed.data.username.trim() : "";
  const email = typeof parsed.data.email === "string" ? parsed.data.email.trim().toLowerCase() : "";
  const password = typeof parsed.data.password === "string" ? parsed.data.password : "";
  if (name.length < 2 || name.length > 80 || !/^[A-Za-z0-9_]{3,24}$/.test(username) || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: "Informe nome (2 a 80 caracteres), usuário válido, e-mail válido e senha de 8 a 128 caracteres." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = await db.user.create({ data: { name, username, email, passwordHash } });
    await createSession({ id: user.id, role: "USER" });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Usuário ou e-mail já cadastrado." }, { status: 409 });
    }
    throw error;
  }
}
