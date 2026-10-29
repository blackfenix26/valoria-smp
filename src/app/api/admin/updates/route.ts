import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { requireAdmin } from "@/lib/auth";
import { readJsonBody } from "@/lib/request-body";
const guard = async () => { try{ return await requireAdmin() }catch{ return null } };
export async function GET(){ if(!await guard()) return NextResponse.json({error:"forbidden"},{status:403});
  return NextResponse.json(await db.update.findMany({orderBy:{createdAt:"desc"}})) }
export async function POST(req: Request){
  const s = await guard(); if(!s) return NextResponse.json({error:"forbidden"},{status:403});
  const parsed = await readJsonBody<{id?:unknown;title?:unknown;summary?:unknown;content?:unknown;image?:unknown;category?:unknown;status?:unknown;publishAt?:unknown}>(req,32_768);
  if("error" in parsed) return NextResponse.json({error:parsed.error==="too_large"?"Atualização muito grande.":"JSON inválido."},{status:parsed.error==="too_large"?413:400});
  const b=parsed.data;
  const title=typeof b.title==="string"?b.title.trim():"";
  const summary=typeof b.summary==="string"?b.summary.trim():"";
  const content=typeof b.content==="string"?b.content.trim():"";
  const category=typeof b.category==="string"?b.category:"";
  const status=typeof b.status==="string"?b.status:"";
  const allowedCategories=["EVENTO","NOVIDADE","MANUTENCAO","LOJA","IMPORTANTE"];
  const allowedStatuses=["DRAFT","PUBLISHED","SCHEDULED"];
  if(title.length<3||title.length>140||summary.length<3||summary.length>250||!content||content.length>20_000||!allowedCategories.includes(category)||!allowedStatuses.includes(status)) {
    return NextResponse.json({error:"Confira título, resumo, conteúdo, categoria e status da atualização."},{status:400});
  }
  const publishAt=b.publishAt?new Date(String(b.publishAt)):new Date();
  if(Number.isNaN(publishAt.getTime())) return NextResponse.json({error:"Data de publicação inválida."},{status:400});
  if(status==="SCHEDULED"&&!b.publishAt) return NextResponse.json({error:"Informe a data de publicação para agendar."},{status:400});
  const image=typeof b.image==="string"?b.image.trim():null;
  if(image&&image.length>2_048) return NextResponse.json({error:"URL da imagem muito longa."},{status:400});
  const data = {title,summary,content,image:image||null,category,status,publishAt};
  const id=typeof b.id==="string"?b.id:"";
  const u = id ? await db.update.update({where:{id},data}) : await db.update.create({data:{...data,authorId:s.id}});
  await db.adminLog.create({data:{adminId:s.id,action:id?"UPDATE_EDIT":"UPDATE_CREATE",target:u.id}});
  return NextResponse.json(u);
}
export async function DELETE(req: Request){
  const s = await guard(); if(!s) return NextResponse.json({error:"forbidden"},{status:403});
  const { id } = await req.json(); await db.update.delete({where:{id}});
  await db.adminLog.create({data:{adminId:s.id,action:"UPDATE_DELETE",target:id}}); return NextResponse.json({ok:true});
}
