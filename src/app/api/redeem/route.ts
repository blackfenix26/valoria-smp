import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isValidDeliveryCode } from "@/lib/checkout";

export const runtime = "nodejs";

function validServerSecret(request: Request) {
  const expected = process.env.MINECRAFT_REDEEM_SECRET;
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || !provided) return false;
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  return expectedBuffer.length === providedBuffer.length && timingSafeEqual(expectedBuffer, providedBuffer);
}

export async function POST(request: Request) {
  if (!process.env.MINECRAFT_REDEEM_SECRET) return NextResponse.json({ error: "Resgate do servidor não está configurado." }, { status: 503 });
  if (!validServerSecret(request)) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  let body: { code?: string; playerName?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }
  const code = String(body.code || "").trim().toUpperCase();
  const playerName = String(body.playerName || "").trim();
  if (!isValidDeliveryCode(code)) return NextResponse.json({ error: "Código inválido." }, { status: 400 });
  if (!/^[A-Za-z0-9_]{3,32}$/.test(playerName)) return NextResponse.json({ error: "Nome de jogador inválido." }, { status: 400 });

  const result = await db.$transaction(async (tx) => {
    const redemption = await tx.redemptionCode.findUnique({ where: { code }, include: { orderItem: { include: { product: true, order: true } } } });
    if (!redemption) return { status: 404, body: { error: "Código não encontrado." } };
    if (redemption.redeemedAt) return { status: 409, body: { error: "Este código já foi resgatado.", redeemedBy: redemption.redeemedBy } };
    if (redemption.orderItem.order.paymentStatus !== "APPROVED" || redemption.orderItem.order.status === "CANCELED") {
      return { status: 403, body: { error: "Este pedido ainda não está liberado para resgate." } };
    }

    const claimed = await tx.redemptionCode.updateMany({
      where: { id: redemption.id, redeemedAt: null },
      data: { redeemedAt: new Date(), redeemedBy: playerName },
    });
    if (claimed.count !== 1) return { status: 409, body: { error: "Este código já foi resgatado." } };

    return {
      status: 200,
      body: {
        ok: true,
        playerName,
        product: {
          id: redemption.orderItem.product.id,
          name: redemption.orderItem.product.name,
          deliveryType: redemption.orderItem.product.deliveryType,
          deliveryInfo: redemption.orderItem.product.deliveryInfo,
        },
      },
    };
  });

  return NextResponse.json(result.body, { status: result.status });
}