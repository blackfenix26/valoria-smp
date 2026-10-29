import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { readJsonBody } from "@/lib/request-body";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Entre na sua conta para avaliar o servidor." }, { status: 401 });
  const parsed = await readJsonBody<{ stars?: unknown; comment?: unknown }>(req, 2_048);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error === "too_large" ? "A avaliação excede o limite permitido." : "JSON inválido." }, { status: parsed.error === "too_large" ? 413 : 400 });
  const body = parsed.data;
  const stars = Number(body.stars);
  const comment = typeof body.comment === "string" ? body.comment.trim() : "";
  if (!Number.isInteger(stars) || stars < 1 || stars > 5 || comment.length < 10 || comment.length > 500) return NextResponse.json({ error: "Informe uma nota de 1 a 5 e um comentário entre 10 e 500 caracteres." }, { status: 400 });
  const existing = await db.serverReview.findFirst({ where: { userId: session.id } });
  if (existing) return NextResponse.json({ error: "Você já avaliou o servidor." }, { status: 409 });
  const review = await db.serverReview.create({ data: { userId: session.id, stars, comment, status: "PENDING" } });
  return NextResponse.json({ ok: true, reviewId: review.id }, { status: 201 });
}
