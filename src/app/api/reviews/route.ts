import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Entre na sua conta para avaliar." }, { status: 401 });
  const body = await req.json() as { productId?: string; stars?: number; comment?: string };
  const stars = Number(body.stars);
  const comment = String(body.comment || "").trim();
  if (!body.productId || !Number.isInteger(stars) || stars < 1 || stars > 5 || comment.length < 10 || comment.length > 500) return NextResponse.json({ error: "Informe uma nota de 1 a 5 e um comentário entre 10 e 500 caracteres." }, { status: 400 });
  const bought = await db.orderItem.findFirst({ where: { productId: body.productId, order: { userId: session.id, status: { in: ["APPROVED", "PROCESSING", "COMPLETED"] } } } });
  if (!bought) return NextResponse.json({ error: "Você precisa comprar e ter o pedido aprovado para avaliar este produto." }, { status: 403 });
  const existing = await db.review.findFirst({ where: { userId: session.id, productId: body.productId } });
  if (existing) return NextResponse.json({ error: "Você já avaliou este produto." }, { status: 409 });
  const review = await db.review.create({ data: { userId: session.id, productId: body.productId, stars, comment, status: "PENDING" } });
  return NextResponse.json({ ok: true, reviewId: review.id });
}
