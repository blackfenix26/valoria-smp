import Link from "next/link";
import { db, getSettings } from "@/lib/db";
import KnowledgeSearch from "@/components/KnowledgeSearch";

export const dynamic = "force-dynamic";
export default async function Wiki() {
  const [settings, articles] = await Promise.all([getSettings(), db.wikiArticle.findMany({where:{published:true},orderBy:{category:"asc"}})]);
  let entries: [string, string][] = [];
  try { entries = JSON.parse(settings.wiki_content); } catch {}
  return (
    <main className="page-shell">
      <div className="mb-8">
        <span className="brand-tag">Documentação</span>
        <h1 className="section-title mt-3">Wiki da Valoria SMP</h1>
        <p className="mt-3 max-w-2xl text-white/70">Tudo o que você precisa para entender regras, módulos, acessos e rotina da comunidade.</p>
      </div>
      <KnowledgeSearch entries={[...entries.map(([title,content])=>({category:"Blocos",title,summary:"",content})),...articles]}/>

      <div className="glass mt-8 p-5">
        <h2 className="text-xl font-black">Guia rápido</h2>
        <ul className="mt-4 space-y-3 text-sm text-white/75">
          <li>1. Faça seu cadastro e acesse a área do cliente.</li>
          <li>2. Escolha um produto ou plano na loja e conclua o checkout.</li>
          <li>3. Aguarde a confirmação do pagamento ou aprovação do pedido.</li>
          <li>4. Acesse seus itens liberados no painel do cliente.</li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/produtos" className="btn-p">Ver produtos</Link>
          <Link href="/faq" className="btn-o">Ir para FAQ</Link>
        </div>
      </div>
    </main>
  );
}

