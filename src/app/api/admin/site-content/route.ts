import { NextResponse } from "next/server";
import { db, getSettings } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { readJsonBody } from "@/lib/request-body";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "forbidden" }, { status: 403 }); }
  const settings = await getSettings();
  return NextResponse.json({ partners: settings.partners, wiki: settings.wiki_content, nav: settings.site_nav });
}

export async function POST(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "forbidden" }, { status: 403 }); }
  const parsed = await readJsonBody<{ partners?: unknown; wiki?: unknown; nav?: unknown }>(req, 128_000);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error === "too_large" ? "Conteúdo excede o limite permitido." : "JSON inválido." }, { status: parsed.error === "too_large" ? 413 : 400 });
  const body = parsed.data;
  for (const [key, value] of [["partners", body.partners], ["wiki_content", body.wiki], ["site_nav", body.nav]] as const) {
    if (value === undefined) continue;
    if (typeof value !== "string" || value.length > 120_000) return NextResponse.json({ error: `${key} excede o limite ou possui formato inválido.` }, { status: 400 });
    try { JSON.parse(value); } catch { return NextResponse.json({ error: `${key} precisa ser um JSON válido.` }, { status: 400 }); }
    await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  return NextResponse.json({ ok: true });
}
