import { NextResponse } from "next/server"; import { db, getSettings } from "@/lib/db"; import { getSession } from "@/lib/auth"; import { calculateTotal, createDeliveryCode } from "@/lib/checkout";

const pixField = (id: string, value: string) => `${id}${String(value.length).padStart(2, "0")}${value}`;
const crc16 = (payload: string) => {
  let crc = 0xffff;
  for (const char of payload) {
    crc ^= char.charCodeAt(0) << 8;
    for (let bit = 0; bit < 8; bit++) crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
};
const formatPix = (value: number, key: string) => {
  const merchantAccount = pixField("00", "BR.GOV.BCB.PIX") + pixField("01", key);
  const payload = ["000201", pixField("26", merchantAccount), "52040000", "5303986", pixField("54", value.toFixed(2)), "5802BR", pixField("59", "VALORIA SMP"), pixField("60", "SAO PAULO"), pixField("62", pixField("05", "***")), "6304"].join("");
  return `${payload}${crc16(payload)}`;
};

export async function POST(req: Request){
  const s = await getSession(); if(!s) return NextResponse.json({error:"Entre na sua conta para finalizar."},{status:401});
  const body = await req.json() as { ids?: string[]; items?: { id: string; quantity?: number }[]; coupon?: string };
  const requestedItems = Array.isArray(body.items) ? body.items : (Array.isArray(body.ids) ? body.ids.map(id => ({id, quantity: 1})) : []);
  const itemMap = new Map<string, number>();
  for(const item of requestedItems){
    if(typeof item.id === "string") itemMap.set(item.id, Math.min(99, Math.max(1, Math.floor(Number(item.quantity || 1)))));
  }
  const uniqueIds = [...itemMap.keys()];
  if(!uniqueIds.length) return NextResponse.json({error:"Carrinho vazio."},{status:400});

  const products = await db.product.findMany({where:{id:{in:uniqueIds},active:true}});
  if(!products.length) return NextResponse.json({error:"Carrinho vazio."},{status:400});

  const items = uniqueIds.map((id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return null;
    return { productId: id, price: Number(product.promoPrice ?? product.price), quantity: itemMap.get(id) ?? 1 };
  }).filter(Boolean) as { productId: string; price: number; quantity: number }[];

  const couponDb = body.coupon ? await db.coupon.findFirst({where:{code:String(body.coupon).toUpperCase(),active:true}}) : null;
  const total = calculateTotal(items.map((item) => ({ price: item.price, quantity: item.quantity })), couponDb ? couponDb.percent : 0);
  const settings = await getSettings();

  const order = await db.order.create({
    data: {
      userId: s.id,
      total,
      status: "PENDING",
      payment: "PIX",
      paymentStatus: "PENDING",
      paymentReference: `VALORIA-${Date.now()}`,
      pixCode: formatPix(total, settings.pix_key),
      deliveryCode: createDeliveryCode(uniqueIds.join("-")),
      items: { create: items.map((item) => ({ productId: item.productId, price: item.price, quantity: item.quantity })) }
    }
  });

  return NextResponse.json({ id: order.id, status: order.status, total, pixCode: order.pixCode, deliveryCode: order.deliveryCode, paymentReference: order.paymentReference });
}

export async function PATCH(req: Request){
  const s = await getSession(); if(!s) return NextResponse.json({error:"Não autenticado."},{status:401});
  const body = await req.json() as { orderId?: string; status?: string };
  if(!body.orderId) return NextResponse.json({error:"Pedido obrigatório."},{status:400});
  if(body.status === "APPROVED") return NextResponse.json({error:"A aprovação do pagamento deve ser feita pelo administrador."},{status:403});

  const order = await db.order.findFirst({ where: { id: body.orderId, userId: s.id } });
  if(!order) return NextResponse.json({error:"Pedido não encontrado."},{status:404});

  const update = await db.order.update({
    where: { id: order.id },
    data: {
      status: body.status ?? order.status,
      paymentStatus: body.status === "APPROVED" ? "APPROVED" : order.paymentStatus,
      paidAt: body.status === "APPROVED" ? new Date() : order.paidAt,
      deliveryUrl: body.status === "APPROVED" ? `/cliente/produtos?order=${order.id}` : order.deliveryUrl
    }
  });

  return NextResponse.json({ ok: true, order: update });
}

