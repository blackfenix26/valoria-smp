import Link from "next/link";
import { ArrowRight, BookOpen, Compass, ScrollText, ShieldCheck } from "lucide-react";
import { db, getSettings } from "@/lib/db";
import KnowledgeSearch from "@/components/KnowledgeSearch";

export const dynamic = "force-dynamic";
export default async function Wiki() {
  const [settings, articles] = await Promise.all([getSettings(), db.wikiArticle.findMany({where:{published:true},orderBy:{category:"asc"}})]);
  let entries: [string, string][] = [];
  try { entries = JSON.parse(settings.wiki_content); } catch {}
  return (
    <main className="page-shell">
      <header className="wiki-hero relative mb-8 overflow-hidden rounded-[30px] border border-white/10 p-6 sm:p-9">
        <div className="wiki-hero-art" aria-hidden="true"><BookOpen size={150}/></div>
        <div className="relative max-w-2xl">
          <span className="brand-tag"><Compass size={13}/> Documentação oficial</span>
          <h1 className="mt-4 text-3xl font-black sm:text-5xl">Wiki da Valória SMP</h1>
          <p className="mt-3 max-w-xl leading-7 text-mut">Seu guia para regras, sistemas, acessos e tudo que faz parte da comunidade.</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-mut"><span className="inline-flex items-center gap-1.5"><BookOpen size={14} className="text-blue-300"/>{entries.length + articles.length} artigos e guias</span><span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-300"/> Conteúdo oficial</span></div>
        </div>
      </header>
      <div className="wiki-layout grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <KnowledgeSearch entries={[...entries.map(([title,content])=>({category:"Blocos",title,summary:"",content})),...articles]}/>
        <aside className="wiki-guide glass h-fit rounded-2xl p-5 sm:p-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-violet-300/15 bg-violet-400/10 text-violet-200"><ScrollText size={18}/></span>
          <h2 className="mt-4 text-lg font-black">Comece por aqui</h2>
          <p className="mt-2 text-sm leading-6 text-mut">Primeiros passos para aproveitar sua jornada na comunidade.</p>
          <ol className="wiki-steps mt-5 space-y-4">
            <li><span>01</span><p>Crie sua conta e acesse a área do cliente.</p></li>
            <li><span>02</span><p>Explore os produtos e planos disponíveis.</p></li>
            <li><span>03</span><p>Acompanhe o status do pedido no painel.</p></li>
            <li><span>04</span><p>Encontre seus itens liberados em Meus Produtos.</p></li>
          </ol>
          <div className="mt-6 grid gap-2"><Link href="/produtos" className="btn-p inline-flex items-center justify-center gap-2">Ver produtos <ArrowRight size={14}/></Link><Link href="/faq" className="btn-o inline-flex items-center justify-center">Perguntas frequentes</Link></div>
        </aside>
      </div>
    </main>
  );
}
