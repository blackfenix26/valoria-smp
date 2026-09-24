import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { requireAdmin } from "@/lib/auth"; import { MODELS, coerce } from "@/lib/crud";
type Ctx = { params: { model: string } };
const gate = async () => { try { return await requireAdmin() } catch { return null } };
const err = (m: string, s: number) => NextResponse.json({ error: m }, { status: s });
export async function GET(_: Request, { params }: Ctx){
  const s = await gate(); const c = MODELS[params.model]; if(!s) return err("forbidden",403); if(!c) return err("not found",404);
  return NextResponse.json(await (db as any)[c.delegate].findMany({ ...(c.order?{orderBy:c.order}:{}), ...(c.include?{include:c.include}:{}), ...(c.select?{select:c.select}:{}) }));
}
export async function POST(req: Request, { params }: Ctx){
  const s = await gate(); const c = MODELS[params.model]; if(!s) return err("forbidden",403); if(!c) return err("not found",404);
  const b = await req.json(); const data = coerce(c.fields, b); if(!data) return err("Valores inválidos.",400);
  const d = (db as any)[c.delegate];
  try{
    if(c.upsert){ if(!b.key) return err("Informe a chave.",400); await d.upsert({where:{key:b.key},update:data,create:{key:b.key,...data}}) }
    else if(b.id){
      if(params.model === "order" && data.status === "APPROVED"){
        await d.update({where:{id:b.id},data:{...data,paymentStatus:"APPROVED",paidAt:new Date(),deliveryUrl:`/cliente/produtos?order=${b.id}`}});
      } else if(params.model === "order" && data.status === "CANCELED"){
        await d.update({where:{id:b.id},data:{...data,paymentStatus:"CANCELED",deliveryUrl:null}});
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
  try{ await (db as any)[c.delegate].delete({where:c.upsert?{key:id}:{id}}) }catch{ return err("Não foi possível excluir (item em uso).",409) }
  await db.adminLog.create({data:{adminId:s.id,action:`${params.model}_delete`,target:id}}); return NextResponse.json({ok:true});
}
