import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { getSession } from "@/lib/auth";
export async function GET(){ const s = await getSession(); if(!s) return NextResponse.json([],{status:401});
  return NextResponse.json(await db.ticket.findMany({where:{userId:s.id},orderBy:{createdAt:"desc"}})) }
export async function POST(req: Request){
  const s = await getSession(); if(!s) return NextResponse.json({error:"Entre na sua conta."},{status:401});
  const b = await req.json(); if(!b.subject||!b.message) return NextResponse.json({error:"Preencha assunto e mensagem."},{status:400});
  return NextResponse.json(await db.ticket.create({data:{userId:s.id,subject:String(b.subject),category:String(b.category||"Geral"),message:String(b.message)}}));
}
