import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db, getSettings } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { calculateTotal, normalizePixPhoneKey } from "@/lib/checkout";
import { readJsonBody } from "@/lib/request-body";

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
  const merchantAccount = pixField("00", "BR.GOV.BCB.PIX") + pixField("01", normalizePixPhoneKey(key));
  const payload = ["000201", pixField("26", merchantAccount), "52040000", "5303986", pixField("54", value.toFixed(2)), "5802BR", pixField("59", "VALORIA SMP"), pixField("60", "SAO PAULO"), pixField("62", pixField("05", "***")), "6304"].join("");
  return `${payload}${crc16(payload)}`;
};

export async function POST(req: Request){
  const s = await getSession(); if(!s) return NextResponse.json({error:"Entre na sua conta para finalizar."},{status:401});
  const parsed = await readJsonBody<{ ids?: unknown; items?: unknown; coupon?: unknown; couponPercent?: unknown }>(req, 32_768);
  if ("error" in parsed) return NextResponse.json({error:parsed.error==="too_large"?"O carrinho excede o limite permitido.":"JSON inválido."},{status:parsed.error==="too_large"?413:400});
  const body = parsed.data;
  if (body.items !== undefined && !Array.isArray(body.items)) return NextResponse.json({error:"Formato de carrinho inválido."},{status:400});
  if (body.ids !== undefined && !Array.isArray(body.ids)) return NextResponse.json({error:"Formato de carrinho inválido."},{status:400});
  const incoming = Array.isArray(body.items) ? body.items : Array.isArray(body.ids) ? body.ids.map(id=>({id,quantity:1})) : [];
  if (!incoming.length || incoming.length > 50) return NextResponse.json({error:incoming.length?"O carrinho pode conter até 50 itens diferentes.":"Carrinho vazio."},{status:400});
  const typedItems: {id:string;quantity?:number;realmId?:string}[] = [];
  for (const item of incoming) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return NextResponse.json({error:"Item de carrinho inválido."},{status:400});
    const candidate = item as {id?:unknown;quantity?:unknown;realmId?:unknown};
    if (typeof candidate.id !== "string" || candidate.id.length < 1 || candidate.id.length > 128) return NextResponse.json({error:"Produto inválido no carrinho."},{status:400});
    if (candidate.realmId !== undefined && (typeof candidate.realmId !== "string" || candidate.realmId.length > 128)) return NextResponse.json({error:"Reino inválido no carrinho."},{status:400});
    const quantity = candidate.quantity === undefined ? 1 : Number(candidate.quantity);
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) return NextResponse.json({error:"A quantidade precisa estar entre 1 e 99."},{status:400});
    typedItems.push({id:candidate.id,quantity,realmId:candidate.realmId as string|undefined});
  }
  if (typeof body.coupon === "string" && body.coupon.length > 40) return NextResponse.json({error:"Cupom inválido."},{status:400});
  if (body.coupon !== undefined && body.coupon !== null && typeof body.coupon !== "string") return NextResponse.json({error:"Cupom inválido."},{status:400});
  if (body.couponPercent !== undefined && body.couponPercent !== null && (typeof body.couponPercent !== "number" || !Number.isFinite(body.couponPercent))) return NextResponse.json({error:"Cupom inválido."},{status:400});
  if (typeof body.coupon === "string" && !/^[A-Za-z0-9_-]{2,40}$/.test(body.coupon)) return NextResponse.json({error:"Cupom inválido."},{status:400});
  const requestedItems = typedItems;
  const itemMap = new Map<string, { productId: string; quantity: number; realmId?: string }>();
  for(const item of requestedItems){
    const realmId=item.realmId;
    const key=`${item.id}::${realmId||"none"}`;
    const quantity=item.quantity ?? 1;
    if ((itemMap.get(key)?.quantity ?? 0) + quantity > 99) return NextResponse.json({error:"A quantidade máxima por produto é 99."},{status:400});
    const existing=itemMap.get(key);
    itemMap.set(key,{productId:item.id,quantity:(existing?.quantity||0)+quantity,realmId});
  }
  const requested = [...itemMap.values()];
  const uniqueIds = [...new Set(requested.map(item=>item.productId))];
  if(!requested.length) return NextResponse.json({error:"Carrinho vazio."},{status:400});

  const products = await db.product.findMany({where:{id:{in:uniqueIds},active:true}});
  if(products.length!==uniqueIds.length) return NextResponse.json({error:"Um ou mais produtos não estão disponíveis."},{status:400});

  const settings = await getSettings();
  const user = await db.user.findUnique({where:{id:s.id},select:{email:true}});
  if(!user) return NextResponse.json({error:"Conta não encontrada."},{status:401});
  for(const entry of requested){
    if(entry.productId===settings.realm_feature_product_id){
      if(!entry.realmId) return NextResponse.json({error:"Selecione o reino que deseja destacar."},{status:400});
      const realm=await db.realm.findFirst({where:{id:entry.realmId,active:true},select:{id:true,premium:true,leaderEmail:true}});
      if(!realm||realm.leaderEmail?.toLowerCase()!==user.email.toLowerCase()) return NextResponse.json({error:"O reino selecionado não está associado ao e-mail da sua conta."},{status:403});
      if(realm.premium) return NextResponse.json({error:"Este reino já possui destaque premium ativo."},{status:409});
    } else if(entry.realmId){
      return NextResponse.json({error:"O reino só pode ser associado ao produto de destaque configurado."},{status:400});
    }
  }

  const items = requested.map((entry) => {
    const product = products.find((p) => p.id === entry.productId)!;
    return { productId: entry.productId, price: Number(product.promoPrice ?? product.price), quantity: entry.quantity, realmId: entry.realmId };
  });

  const couponDb = body.coupon ? await db.coupon.findFirst({where:{code:body.coupon.toUpperCase(),active:true}}) : null;
  if(body.coupon&&(!couponDb||Math.min(100,Math.max(0,couponDb.percent))!==body.couponPercent)) return NextResponse.json({error:"O cupom mudou ou expirou. Valide novamente antes de finalizar."},{status:409});
  const total = calculateTotal(items.map((item) => ({ price: item.price, quantity: item.quantity })), couponDb ? couponDb.percent : 0);
  const order = await db.order.create({
    data: {
      userId: s.id,
      total,
      status: "PENDING",
      payment: "PIX",
      paymentStatus: "PENDING",
      paymentReference: `VALORIA-${randomUUID()}`,
      pixCode: formatPix(total, settings.pix_key),
      items: { create: items.map((item) => ({ productId: item.productId, price: item.price, quantity: item.quantity, realmId: item.realmId })) }
    }
  });

  return NextResponse.json({ id: order.id, status: order.status, total, pixCode: order.pixCode, paymentReference: order.paymentReference });
}

export async function PATCH(req: Request){
  const s = await getSession(); if(!s) return NextResponse.json({error:"Não autenticado."},{status:401});
  return NextResponse.json({error:"O status de pagamento e entrega só pode ser alterado pela equipe."},{status:403});
}
