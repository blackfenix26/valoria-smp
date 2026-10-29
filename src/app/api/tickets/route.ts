import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { readJsonBody } from "@/lib/request-body";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Entre na sua conta." }, { status: 401 });
  const tickets = await db.ticket.findMany({ where: { userId: session.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(tickets, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Entre na sua conta." }, { status: 401 });

  const parsed = await readJsonBody<{ subject?: unknown; category?: unknown; message?: unknown }>(request, 8_192);
  if ("error" in parsed) {
    const status = parsed.error === "too_large" ? 413 : 400;
    return NextResponse.json({ error: parsed.error === "too_large" ? "A mensagem excede o limite permitido." : "JSON inválido." }, { status });
  }

  const subject = typeof parsed.data.subject === "string" ? parsed.data.subject.trim() : "";
  const category = typeof parsed.data.category === "string" ? parsed.data.category.trim() : "Geral";
  const message = typeof parsed.data.message === "string" ? parsed.data.message.trim() : "";
  if (subject.length < 3 || subject.length > 120 || category.length < 2 || category.length > 40 || message.length < 10 || message.length > 5_000) {
    return NextResponse.json({ error: "Informe assunto (3 a 120 caracteres), categoria (2 a 40) e mensagem (10 a 5000)." }, { status: 400 });
  }

  const ticket = await db.ticket.create({ data: { userId: session.id, subject, category, message } });
  return NextResponse.json(ticket, { status: 201, headers: { "Cache-Control": "private, no-store, max-age=0" } });
}
