import { NextResponse } from "next/server";
import { db, getSettings } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "forbidden" }, { status: 403 }); }
  const settings = await getSettings();
  return NextResponse.json({ partners: settings.partners, wiki: settings.wiki_content, nav: settings.site_nav });
}

export async function POST(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "forbidden" }, { status: 403 }); }
  const body = await req.json() as { partners?: string; wiki?: string; nav?: string };
  for (const [key, value] of [["partners", body.partners], ["wiki_content", body.wiki], ["site_nav", body.nav]] as const) {
    if (value === undefined) continue;
    try { JSON.parse(value); } catch { return NextResponse.json({ error: `${key} precisa ser um JSON válido.` }, { status: 400 }); }
    await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  return NextResponse.json({ ok: true });
}
