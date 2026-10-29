import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

async function gate() { try { return await requireAdmin(); } catch { return null; } }
export async function GET() {
  const admin = await gate(); if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json(await db.adminSuggestion.findMany({ orderBy: { createdAt: "desc" }, include: { author: { select: { name: true, email: true } } } }));
}
export async function POST(req: Request) {
  const admin = await gate(); if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json() as { id?: string; title?: string; description?: string; priority?: string; status?: string };
  const title = String(body.title || "").trim(), description = String(body.description || "").trim();
  if (!title || !description) return NextResponse.json({ error: "Informe título e descrição." }, { status: 400 });
  const data = { title, description, priority: body.priority || "NORMAL", status: body.status || "OPEN" };
  const suggestion = body.id
    ? await db.adminSuggestion.update({ where: { id: body.id }, data })
    : await db.adminSuggestion.create({ data: { ...data, authorId: admin.id } });
  return NextResponse.json({ ok: true, suggestion });
}
export async function DELETE(req: Request) {
  const admin = await gate(); if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await req.json() as { id?: string }; if (!id) return NextResponse.json({ error: "Sugestão obrigatória." }, { status: 400 });
  await db.adminSuggestion.delete({ where: { id } }); return NextResponse.json({ ok: true });
}
