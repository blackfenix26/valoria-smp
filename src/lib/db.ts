import { PrismaClient } from "@prisma/client";
const g = globalThis as unknown as { db?: PrismaClient };
export const db = g.db ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.db = db;
const DEFAULT_SETTINGS: Record<string,string> = {
  hero_title: "Produtos para uma experiência inesquecível no | Valoria BLCKX.",
  hero_subtitle: "Explore produtos, vantagens e experiências exclusivas para sua jornada em Valoria BLCKX.",
  footer_text: "Uma experiência Minecraft criada para aventureiros.",
  partners: JSON.stringify([['Valoria Network','Rede oficial'],['Eldoria','Servidor parceiro'],['Kronix','Servidor parceiro'],['NovaCraft','Servidor parceiro'],['Arcadia','Servidor parceiro'],['MythicMC','Servidor parceiro'],['Dragon SMP','Servidor parceiro'],['Realm Studios','Servidor parceiro']]),
  link_discord: '#',
  link_instagram: '#',
  link_tiktok: '#',
  link_youtube: '#',
  link_docs: '#',
  link_terms: '#',
  link_privacy: '#',
  link_faq: '#'
};
// Atualizações visíveis ao público: publicadas, ou agendadas cuja data já chegou.
export const publishedUpdates = (take?: number) => db.update.findMany({
  where:{ OR:[{status:"PUBLISHED"},{status:"SCHEDULED",publishAt:{lte:new Date()}}] }, orderBy:{publishAt:"desc"}, take, include:{author:{select:{name:true}}} });
export async function getSettings(){ const rows = await db.setting.findMany(); return { ...DEFAULT_SETTINGS, ...Object.fromEntries(rows.map(r=>[r.key,r.value])) } as Record<string,string>; }
