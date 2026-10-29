import { db } from "@/lib/db";
import ApplicationForm from "@/components/ApplicationForm";
import { ArrowRight, BriefcaseBusiness, HeartHandshake, Sparkles } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function TrabalheConosco() {
  const opportunities = await db.workOpportunity.findMany({ where: { active: true }, orderBy: { category: "asc" } });
  return <main className="page-shell">
    <header className="team-hero relative mb-8 overflow-hidden rounded-[30px] border border-white/10 p-6 sm:p-9">
      <div className="team-hero-mark" aria-hidden="true"><HeartHandshake size={150}/></div>
      <div className="relative max-w-2xl">
        <span className="brand-tag"><Sparkles size={13}/> Equipe Valória</span>
        <h1 className="mt-4 text-3xl font-black sm:text-5xl">Construa a próxima fase com a gente.</h1>
        <p className="mt-3 max-w-xl leading-7 text-mut">Compartilhe seu talento, fortaleça a comunidade e ajude a criar experiências memoráveis.</p>
        {opportunities.length > 0 && <p className="mt-5 text-xs font-semibold uppercase tracking-[.15em] text-mut">{opportunities.length} {opportunities.length === 1 ? "oportunidade aberta" : "oportunidades abertas"}</p>}
      </div>
    </header>
    {!opportunities.length ? <section className="team-empty glass rounded-3xl px-6 py-12 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-violet-300/15 bg-violet-400/10 text-violet-200"><BriefcaseBusiness size={24}/></span>
      <h2 className="mt-4 text-xl font-bold">Nenhuma vaga aberta agora</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-mut">A equipe está completa no momento. As oportunidades aparecem aqui quando novas vagas forem abertas.</p>
    </section> : <div className="team-opportunity-grid grid gap-5 lg:grid-cols-2">{opportunities.map(job =>
      <article key={job.id} className="team-opportunity rounded-[24px] border border-white/10 bg-card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.17em] text-blue-300">{job.category}</p><h2 className="mt-2 text-xl font-bold">{job.title}</h2></div><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-blue-300/15 bg-blue-400/10 text-blue-200"><BriefcaseBusiness size={17}/></span></div>
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-mut">{job.description}</p>
        <div className="team-role-details mt-5 grid gap-4 sm:grid-cols-2">
          <div><h3 className="text-xs font-bold uppercase tracking-[.12em]">Requisitos</h3><p className="mt-2 whitespace-pre-line text-xs leading-5 text-mut">{job.requirements}</p></div>
          <div><h3 className="text-xs font-bold uppercase tracking-[.12em]">Responsabilidades</h3><p className="mt-2 whitespace-pre-line text-xs leading-5 text-mut">{job.responsibilities}</p></div>
        </div>
        <details className="team-application mt-5 border-t border-white/10 pt-4">
          <summary className="btn-o inline-flex cursor-pointer list-none items-center gap-2">Demonstrar interesse <ArrowRight size={14}/></summary>
          <ApplicationForm opportunityId={job.id}/>
        </details>
      </article>
    )}</div>}
  </main>;
}
