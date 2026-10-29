import { Activity, BellRing } from "lucide-react";
import { publishedUpdates } from "@/lib/db";
import UpdateCard from "@/components/UpdateCard";

export const dynamic = "force-dynamic";

export default async function Updates() {
  const list = await publishedUpdates();

  return <main className="page-shell max-w-7xl">
    <header className="updates-hero relative mb-8 overflow-hidden rounded-[30px] border border-white/10 p-6 sm:p-9">
      <div className="updates-hero-mark" aria-hidden="true"><Activity size={150}/></div>
      <div className="relative max-w-2xl">
        <span className="brand-tag"><BellRing size={13}/> Central da comunidade</span>
        <h1 className="mt-4 text-3xl font-black sm:text-5xl">Atualizações</h1>
        <p className="mt-3 max-w-xl leading-7 text-mut">Novidades, eventos e comunicados importantes do universo Valória, em um só lugar.</p>
      </div>
    </header>

    {list.length ? (
      <>
        <div className="mb-4 flex items-center justify-between">
          <p className="section-kicker">Mais recentes</p>
          <span className="text-xs text-mut">{list.length} {list.length === 1 ? "publicação" : "publicações"}</span>
        </div>
        <div className="updates-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((u) => <UpdateCard key={u.id} u={u} />)}
        </div>
      </>
    ) : (
      <section className="updates-empty glass rounded-3xl px-6 py-12 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-blue-300/15 bg-blue-400/10 text-blue-200"><BellRing size={24}/></span>
        <h2 className="mt-4 text-xl font-bold">Tudo em dia por aqui</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-mut">Ainda não há comunicados publicados. As novidades aparecerão nesta página.</p>
      </section>
    )}
  </main>;
}
