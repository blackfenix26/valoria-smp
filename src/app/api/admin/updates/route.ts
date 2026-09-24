import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { requireAdmin } from "@/lib/auth";
const guard = async () => { try{ return await requireAdmin() }catch{ return null } };
export async function GET(){ if(!await guard()) return NextResponse.json({error:"forbidden"},{status:403});
  return NextResponse.json(await db.update.findMany({orderBy:{createdAt:"desc"}})) }
export async function POST(req: Request){
  const s = await guard(); if(!s) return NextResponse.json({error:"forbidden"},{status:403});
  const b = await req.json(); const data = {title:b.title,summary:b.summary,content:b.content,image:b.image||null,category:b.category,status:b.status,publishAt:b.publishAt?new Date(b.publishAt):new Date()};
  const u = b.id ? await db.update.update({where:{id:b.id},data}) : await db.update.create({data:{...data,authorId:s.id}});
  await db.adminLog.create({data:{adminId:s.id,action:b.id?"UPDATE_EDIT":"UPDATE_CREATE",target:u.id}});
  return NextResponse.json(u);
}
export async function DELETE(req: Request){
  const s = await guard(); if(!s) return NextResponse.json({error:"forbidden"},{status:403});
  const { id } = await req.json(); await db.update.delete({where:{id}});
  await db.adminLog.create({data:{adminId:s.id,action:"UPDATE_DELETE",target:id}}); return NextResponse.json({ok:true});
}
