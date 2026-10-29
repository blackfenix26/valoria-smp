"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search, X } from "lucide-react";

type Entry = { category: string; title: string; summary?: string; content: string };
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function KnowledgeSearch({ entries, faq = false }: { entries: Entry[]; faq?: boolean }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categories = useMemo(() => [...new Set(entries.map(entry => entry.category).filter(Boolean))], [entries]);
  const filtered = useMemo(() => {
    const term = normalize(query.trim());
    return entries.filter(item => {
      const matchesCategory = activeCategory === null || item.category === activeCategory;
      const matchesQuery = !term || normalize(`${item.category} ${item.title} ${item.summary || ""} ${item.content}`).includes(term);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, entries, query]);

  function clearSearch() {
    setQuery("");
    setActiveCategory(null);
  }

  return <section className="knowledge-library min-w-0">
    <div className="knowledge-search glass mb-4 flex items-center gap-3 p-3 sm:p-4">
      <Search size={18} aria-hidden="true" className="shrink-0 text-blue-300"/>
      <label htmlFor={faq ? "faq-search" : "knowledge-search"} className="sr-only">{faq ? "Buscar perguntas" : "Buscar na wiki"}</label>
      <input
        id={faq ? "faq-search" : "knowledge-search"}
        type="search"
        value={query}
        onChange={event => setQuery(event.target.value)}
        placeholder={faq ? "Buscar pergunta ou categoria..." : "Buscar artigo, sistema ou regra..."}
        className="inp min-w-0 border-0 bg-transparent !p-2 shadow-none focus:!ring-0"
      />
      {query && <button type="button" onClick={() => setQuery("")} aria-label="Limpar busca" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-mut transition hover:bg-white/10 hover:text-white"><X size={16}/></button>}
    </div>

    {categories.length > 1 && <div className="knowledge-categories mb-5 flex gap-2 overflow-x-auto pb-2" aria-label="Filtrar por categoria">
      {["Todas", ...categories].map(category => <button
        key={category}
        type="button"
        aria-pressed={category === "Todas" ? activeCategory === null : activeCategory === category}
        onClick={() => setActiveCategory(category === "Todas" ? null : category)}
        className={`knowledge-category shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition ${(category === "Todas" ? activeCategory === null : activeCategory === category) ? "knowledge-category-active" : ""}`}
      >{category}</button>)}
    </div>}

    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-sm font-bold">{faq ? "Perguntas frequentes" : "Artigos e guias"}</h2>
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-mut" aria-live="polite">{filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}</span>
        {(query || activeCategory !== null) && <button type="button" onClick={clearSearch} className="text-[11px] font-semibold text-blue-200 underline underline-offset-2">Limpar filtros</button>}
      </div>
    </div>

    {filtered.length ? <div className="grid gap-4 md:grid-cols-2">{filtered.map((item, index) =>
      <article key={`${item.category}-${item.title}-${index}`} className="knowledge-card glass rounded-2xl p-5 sm:p-6">
        <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-blue-200/75"><BookOpen size={13} aria-hidden="true"/>{item.category}</p>
        {faq ? <details className="knowledge-answer mt-3">
          <summary className="cursor-pointer text-base font-bold leading-snug">{item.title}</summary>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-mut">{item.content}</p>
        </details> : <>
          <h3 className="mt-3 text-lg font-bold leading-snug">{item.title}</h3>
          {item.summary && <p className="mt-2 text-sm leading-6 text-mut">{item.summary}</p>}
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-mut">{item.content}</p>
        </>}
      </article>
    )}</div> : <div className="glass rounded-2xl px-6 py-10 text-center">
      <Search size={22} aria-hidden="true" className="mx-auto text-mut"/>
      <p className="mt-3 font-semibold">{query || activeCategory !== null ? "Nenhum resultado encontrado" : "Ainda não há conteúdo publicado"}</p>
      <p className="mt-1 text-sm text-mut">{query || activeCategory !== null ? "Tente outro termo ou limpe os filtros." : "Novos guias serão adicionados aqui."}</p>
      {(query || activeCategory !== null) && <button type="button" onClick={clearSearch} className="btn-o mt-4 inline-flex">Limpar busca e filtros</button>}
    </div>}
  </section>;
}
