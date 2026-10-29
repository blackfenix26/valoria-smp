import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { readJsonBody } from "@/lib/request-body";

async function gate() { try { return await requireAdmin(); } catch { return null; } }
export async function GET() {
  const admin = await gate(); if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json(await db.adminSuggestion.findMany({ orderBy: { createdAt: "desc" }, include: { author: { select: { name: true, email: true } } } }));
}
export async function POST(req: Request) {
  const admin = await gate(); if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const parsed=await readJsonBody<{id?:unknown;title?:unknown;description?:unknown;priority?:unknown;status?:unknown}>(req,8_192);
  if("error" in parsed) return NextResponse.json({error:parsed.error==="too_large"?"Sugestão muito grande.":"JSON inválido."},{status:parsed.error==="too_large"?413:400});
  const body=parsed.data;
  const title = String(body.title || "").trim(), description = String(body.description || "").trim();
  if (title.length<3||title.length>120||description.length<10||description.length>5_000) return NextResponse.json({ error: "Informe título (3 a 120) e descrição (10 a 5000 caracteres)." }, { status: 400 });
  const priority=typeof body.priority==="string"?body.priority:"NORMAL";
  const status=typeof body.status==="string"?body.status:"OPEN";
  if(!["LOW","NORMAL","HIGH","URGENT"].includes(priority)||!["OPEN","REVIEW","PLANNED","DONE","ARCHIVED"].includes(status)) return NextResponse.json({error:"Prioridade ou status inválido."},{status:400});
  const data = { title, description, priority, status };
  const id=typeof body.id==="string"?body.id:"";
  const suggestion = id
    ? await db.adminSuggestion.update({ where: { id }, data })
    : await db.adminSuggestion.create({ data: { ...data, authorId: admin.id } });
  return NextResponse.json({ ok: true, suggestion });
}
export async function DELETE(req: Request) {
  const admin = await gate(); if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await req.json() as { id?: string }; if (!id) return NextResponse.json({ error: "Sugestão obrigatória." }, { status: 400 });
  await db.adminSuggestion.delete({ where: { id } }); return NextResponse.json({ ok: true });
}
