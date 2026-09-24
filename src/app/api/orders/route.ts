import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { getSession } from "@/lib/auth"; import { calculateTotal, createDeliveryCode } from "@/lib/checkout";

const formatPix = (value: number) => `00020126580014br.gov.bcb.pix0136VALORIA-${value.toFixed(2).replace('.', '')}52040000530398654040${value.toFixed(2).replace('.', '')}5802BR5909VALORIA6009SAO PAULO62070503***6304`;

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

  const order = await db.order.create({
    data: {
      userId: s.id,
      total,
      status: "PENDING",
      payment: "PIX",
      paymentStatus: "PENDING",
      paymentReference: `VALORIA-${Date.now()}`,
      pixCode: formatPix(total),
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

