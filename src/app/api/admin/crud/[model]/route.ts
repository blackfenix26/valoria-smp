import { NextResponse } from "next/server"; import { Prisma } from "@prisma/client"; import { db } from "@/lib/db"; import { requireAdmin } from "@/lib/auth"; import { MODELS, coerce } from "@/lib/crud"; import { createDeliveryCode } from "@/lib/checkout";
type Ctx = { params: { model: string } };
const gate = async () => { try { return await requireAdmin() } catch { return null } };
const err = (m: string, s: number) => NextResponse.json({ error: m }, { status: s });
function galleryUrls(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return [];
  try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean); } catch {}
  return raw.split(/\r?\n/).map(url => url.trim()).filter(Boolean);
}
function validHttpsUrl(value: unknown) {
  try { return new URL(String(value)).protocol === "https:"; } catch { return false; }
}
async function approveOrder(orderId: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await db.$transaction(async (tx) => {
        const order = await tx.order.findUnique({ where: { id: orderId }, include: { user: { select: { email: true } }, items: { include: { product: true, realm: true, redemptionCodes: true } } } });
        if (!order) throw new Error("ORDER_NOT_FOUND");
        if (order.status === "CANCELED") throw new Error("ORDER_CANCELED");
        const alreadyApproved = order.paymentStatus === "APPROVED";
        await tx.order.update({ where: { id: order.id }, data: { status: "APPROVED", paymentStatus: "APPROVED", paidAt: order.paidAt ?? new Date(), deliveryUrl: `/cliente/produtos?order=${order.id}` } });
        for (const item of order.items) {
          const missing = Math.max(0, item.quantity - item.redemptionCodes.length);
          for (let index = 0; index < missing; index++) {
            await tx.redemptionCode.create({ data: { orderItemId: item.id, code: createDeliveryCode() } });
          }
        }
        const featureProduct = await tx.setting.findUnique({ where: { key: "realm_feature_product_id" } });
        if (featureProduct?.value) {
          const premiumItems=order.items.filter(item=>item.productId===featureProduct.value);
          for(const item of premiumItems){
            if(!item.realmId||!item.realm||item.realm.leaderEmail?.toLowerCase()!==order.user.email.toLowerCase()) throw new Error("REALM_OWNER_MISMATCH");
            if(item.realm.premium&&!alreadyApproved) throw new Error("REALM_ALREADY_PREMIUM");
            if(!item.realm.premium) await tx.realm.update({where:{id:item.realmId},data:{premium:true,featured:true}});
          }
        }
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      const code = (error as { code?: string }).code;
      if ((code === "P2034" || code === "P2002") && attempt < 2) continue;
      throw error;
    }
  }
}
export async function GET(_: Request, { params }: Ctx){
  const s = await gate(); const c = MODELS[params.model]; if(!s) return err("forbidden",403); if(!c) return err("not found",404);
  return NextResponse.json(await (db as any)[c.delegate].findMany({ ...(c.order?{orderBy:c.order}:{}), ...(c.include?{include:c.include}:{}), ...(c.select?{select:c.select}:{}) }));
}
export async function POST(req: Request, { params }: Ctx){
  const s = await gate(); const c = MODELS[params.model]; if(!s) return err("forbidden",403); if(!c) return err("not found",404);
  const b = await req.json(); const data = coerce(c.fields, b); if(!data) return err("Valores inválidos.",400);
  if(params.model === "realm" && String(data.description ?? "").trim().length < 20) return err("A descrição do reino precisa ter pelo menos 20 caracteres.",400);
  if(params.model === "product"){
    const photos=galleryUrls(data.gallery);
    if(!b.id && (photos.length<2 || !data.videoDemo)) return err("Novos produtos precisam de pelo menos duas fotos e um vídeo de demonstração.",400);
    if((photos.length>0 && photos.some(url=>!validHttpsUrl(url))) || (data.videoDemo && !validHttpsUrl(data.videoDemo))) return err("Use URLs HTTPS válidas para fotos e vídeo de demonstração.",400);
  }
  const d = (db as any)[c.delegate];
  try{
    if(c.upsert){ if(!b.key) return err("Informe a chave.",400); await d.upsert({where:{key:b.key},update:data,create:{key:b.key,...data}}) }
    else if(b.id){
      if(params.model === "order" && data.status === "APPROVED"){
        await approveOrder(String(b.id));
      } else if(params.model === "order" && data.status === "CANCELED"){
        await db.$transaction(async tx=>{
          const order=await tx.order.findUnique({where:{id:String(b.id)},include:{items:{include:{realm:true}}}});
          if(!order) throw new Error("ORDER_NOT_FOUND");
          await tx.order.update({where:{id:order.id},data:{...data,paymentStatus:"CANCELED",deliveryUrl:null}});
          const featureProduct=await tx.setting.findUnique({where:{key:"realm_feature_product_id"}});
          const targetedRealmIds=[...new Set(order.items.filter(item=>item.realmId&&item.productId===featureProduct?.value).map(item=>item.realmId as string))];
          if(order.paymentStatus==="APPROVED"&&featureProduct?.value){
            for(const realmId of targetedRealmIds){
              const otherApproved=await tx.orderItem.findFirst({where:{realmId,productId:featureProduct.value,orderId:{not:order.id},order:{paymentStatus:"APPROVED",status:{not:"CANCELED"}}},select:{id:true}});
              if(!otherApproved) await tx.realm.update({where:{id:realmId},data:{premium:false,featured:false}});
            }
          }
        });
      } else if(params.model === "order" && ["PROCESSING","COMPLETED"].includes(data.status)){
        const order = await db.order.findUnique({where:{id:b.id},select:{paymentStatus:true}});
        if(order?.paymentStatus !== "APPROVED") return err("Confirme o pagamento antes de processar ou concluir a entrega.",409);
        await d.update({where:{id:b.id},data});
      } else await d.update({where:{id:b.id},data});
    }
    else if(c.create) await d.create({data}); else return err("Criação não permitida.",405);
  }catch{ return err("Dados inválidos ou duplicados.",400) }
  await db.adminLog.create({data:{adminId:s.id,action:`${params.model}_${b.id||b.key?"edit":"create"}`,target:String(b.id||b.key||"novo")}});
  return NextResponse.json({ok:true});
}
export async function DELETE(req: Request, { params }: Ctx){
  const s = await gate(); const c = MODELS[params.model]; if(!s) return err("forbidden",403); if(!c||!c.del) return err("not allowed",405);
  const b = await req.json(); const id = String(b.id ?? b.key);
  try{
    if(params.model === "order") {
      await db.$transaction(async (tx) => {
        await tx.orderItem.deleteMany({ where: { orderId: id } });
        await tx.order.delete({ where: { id } });
      });
    } else await (db as any)[c.delegate].delete({where:c.upsert?{key:id}:{id}})
  }catch{ return err("Não foi possível excluir (item em uso ou pedido inexistente).",409) }
  await db.adminLog.create({data:{adminId:s.id,action:`${params.model}_delete`,target:id}}); return NextResponse.json({ok:true});
}
