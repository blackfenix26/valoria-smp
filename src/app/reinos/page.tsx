import Link from "next/link";
import { ArrowRight, Crown, Map, Shield } from "lucide-react";
import type { CSSProperties } from "react";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Reinos() {
  const realms = await db.realm.findMany({ where: { active: true }, orderBy: [{ featured: "desc" }, { name: "asc" }] });

  return <main className="page-shell">
    <header className="realm-hero relative mb-8 overflow-hidden rounded-[30px] border border-white/10 p-6 sm:p-9">
      <div className="realm-hero-art" aria-hidden="true"><Map size={150}/></div>
      <div className="relative max-w-2xl">
        <span className="brand-tag"><Shield size={13}/> Comunidade</span>
        <h1 className="mt-4 text-3xl font-black sm:text-5xl">Reinos da Valória</h1>
        <p className="mt-3 max-w-xl leading-7 text-mut">Conheça os povos, líderes e especialidades que dão vida ao mundo da Valória.</p>
        {realms.length > 0 && <p className="mt-5 text-xs font-semibold uppercase tracking-[.15em] text-mut">{realms.length} {realms.length === 1 ? "reino para descobrir" : "reinos para descobrir"}</p>}
      </div>
    </header>
    {!realms.length ? <section className="realm-empty glass rounded-3xl px-6 py-12 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-blue-300/15 bg-blue-400/10 text-blue-200"><Crown size={24}/></span>
      <h2 className="mt-4 text-xl font-bold">Novos reinos em breve</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-mut">Estamos preparando as próximas histórias da Valória. Volte para conhecer as novidades.</p>
    </section> : <div className="realm-grid grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{realms.map(realm =>
      <article key={realm.id} className="realm-card group overflow-hidden rounded-[24px] border border-white/10 bg-card" style={{ "--realm-accent": realm.color } as CSSProperties}>
        <div className="realm-card-media relative overflow-hidden">
          {realm.banner ? <img src={realm.banner} alt="" className="h-full w-full object-cover transition duration-500"/> : <div className="realm-card-placeholder h-full w-full"/>}
          <div className="realm-color-bar"/>
          {realm.featured && <span className="realm-featured absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold"><Crown size={12}/> Em destaque</span>}
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            {realm.logo ? <img src={realm.logo} alt="" className="realm-logo h-12 w-12 rounded-2xl object-cover"/> : <span className="realm-logo grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-lg font-black text-white" style={{ backgroundColor: realm.color }}>{realm.name.slice(0, 1)}</span>}
            <div className="min-w-0"><h2 className="truncate text-xl font-bold">{realm.name}</h2><p className="mt-1 text-xs text-mut">Liderado por {realm.leader}</p></div>
          </div>
          <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-mut">{realm.description}</p>
          <Link href={`/reinos/${realm.id}`} className="realm-card-link mt-5 inline-flex items-center gap-2 text-sm font-bold">Explorar reino <ArrowRight size={15}/></Link>
        </div>
      </article>
    )}</div>}
  </main>;
}
