import { PrismaClient } from "@prisma/client";
const g = globalThis as unknown as { db?: PrismaClient };
function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url || process.env.NODE_ENV !== "production" || !url.startsWith("postgres")) return url;
  const parsed = new URL(url);
  if (!parsed.searchParams.has("connection_limit")) parsed.searchParams.set("connection_limit", "1");
  return parsed.toString();
}
export const db = g.db ?? new PrismaClient({ datasources: { db: { url: getDatabaseUrl() } } });
g.db = db;
const DEFAULT_SETTINGS: Record<string,string> = {
  hero_title: "Produtos para uma experiência inesquecível no | Valoria SMP.",
  hero_subtitle: "Explore produtos, vantagens e experiências exclusivas para sua jornada em Valoria SMP.",
  site_nav: JSON.stringify([
    ["Início", "/", true], ["Produtos", "/produtos", true], ["Planos", "/produtos?cat=Ranks", true],
    ["Mercado", "/produtos", true], ["Reinos", "/reinos", true], ["Trabalhe Conosco", "/trabalhe-conosco", true],
    ["Atualizações", "/atualizacoes", true], ["Wiki", "/wiki", true]
  ]),
  wiki_content: JSON.stringify([
    ["Regras da comunidade", "Conheça as normas, condutas e políticas para manter a experiência justa e segura."],
    ["Como comprar e ativar um produto", "Entenda o processo de checkout, aprovação e liberação do item ou benefício adquirido."],
    ["Acesso ao painel do cliente", "Saiba onde verificar pedidos, suporte, produtos liberados e informações da sua conta."],
    ["Eventos e temporadas", "Veja como funcionam as promoções, recompensas e campanhas especiais do servidor."],
    ["Suporte técnico", "Acesse o centro de ajuda para tirar dúvidas sobre compras, permissões e acesso."],
    ["Perguntas frequentes", "Resposta rápida para dúvidas comuns sobre planos, produtos e comunidade."]
  ]),
  pix_key: "+5511912089765",
  realm_feature_product_id: "",
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
