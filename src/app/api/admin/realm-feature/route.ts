import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

async function gate() {
  try { await requireAdmin(); return true; } catch { return false; }
}

export async function GET() {
  if (!await gate()) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const [setting, products] = await Promise.all([
    db.setting.findUnique({ where: { key: "realm_feature_product_id" } }),
    db.product.findMany({ where: { active: true }, select: { id: true, name: true, price: true }, orderBy: { name: "asc" } }),
  ]);
  return NextResponse.json({ productId: setting?.value ?? "", products });
}

export async function POST(req: Request) {
  if (!await gate()) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json() as { productId?: string };
  const productId = String(body.productId ?? "").trim();
  if (productId && !await db.product.findFirst({ where: { id: productId, active: true }, select: { id: true } })) {
    return NextResponse.json({ error: "Selecione um produto ativo." }, { status: 400 });
  }
  await db.setting.upsert({
    where: { key: "realm_feature_product_id" },
    update: { value: productId },
    create: { key: "realm_feature_product_id", value: productId },
  });
  return NextResponse.json({ ok: true });
}