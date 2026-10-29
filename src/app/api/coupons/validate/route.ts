import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  let body: { code?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requisição inválida." }, { status: 400 }); }
  const code = String(body.code || "").trim().toUpperCase();
  if (!/^[A-Z0-9_-]{2,40}$/.test(code)) return NextResponse.json({ error: "Digite um cupom válido." }, { status: 400 });
  const coupon = await db.coupon.findFirst({ where: { code, active: true }, select: { code: true, percent: true } });
  if (!coupon) return NextResponse.json({ error: "Cupom inválido ou expirado." }, { status: 404 });
  return NextResponse.json({ code: coupon.code, percent: Math.min(100, Math.max(0, coupon.percent)) });
}
