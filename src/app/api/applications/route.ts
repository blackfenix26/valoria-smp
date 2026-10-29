import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { readJsonBody } from "@/lib/request-body";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Entre na sua conta para se candidatar." }, { status: 401 });

  const parsed = await readJsonBody<{ opportunityId?: unknown; message?: unknown; contact?: unknown }>(request, 4_096);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error === "too_large" ? "A candidatura excede o limite permitido." : "JSON inválido." }, { status: parsed.error === "too_large" ? 413 : 400 });
  const opportunityId = typeof parsed.data.opportunityId === "string" ? parsed.data.opportunityId.trim() : "";
  const message = typeof parsed.data.message === "string" ? parsed.data.message.trim() : "";
  const contact = typeof parsed.data.contact === "string" ? parsed.data.contact.trim() : "";
  if (!opportunityId || opportunityId.length > 128 || message.length < 30 || message.length > 1_500 || contact.length < 2 || contact.length > 120) {
    return NextResponse.json({ error: "Informe contato válido e apresentação entre 30 e 1500 caracteres." }, { status: 400 });
  }

  const opportunity = await db.workOpportunity.findFirst({ where: { id: opportunityId, active: true } });
  if (!opportunity) return NextResponse.json({ error: "Esta oportunidade não está disponível." }, { status: 404 });
  const duplicate = await db.jobApplication.findFirst({ where: { opportunityId: opportunity.id, userId: session.id, status: { in: ["PENDING", "REVIEW"] } } });
  if (duplicate) return NextResponse.json({ error: "Você já tem uma candidatura em análise para esta oportunidade." }, { status: 409 });

  const application = await db.jobApplication.create({ data: { opportunityId: opportunity.id, userId: session.id, message, contact } });
  return NextResponse.json({ ok: true, id: application.id }, { status: 201 });
}
