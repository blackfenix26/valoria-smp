import Link from "next/link";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { db, publishedUpdates, getSettings } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import UpdateCard from "@/components/UpdateCard";
export const dynamic = "force-dynamic";
const PARC = [["Valoria Network","Rede oficial"],["Eldoria","Servidor parceiro"],["Kronix","Servidor parceiro"],["NovaCraft","Servidor parceiro"],["Arcadia","Servidor parceiro"],["MythicMC","Servidor parceiro"],["Dragon SMP","Servidor parceiro"],["Realm Studios","Servidor parceiro"]];
const CATS=["Todos","Ranks","Cosméticos","Kits","Moedas","Pets","Skins","Mapas","Texturas","Outros"];
export default async function Home(){
  const [products,updates,cfg,banner,event,reviews] = await Promise.all([
    db.product.findMany({where:{active:true},orderBy:[{featured:"desc"},{createdAt:"desc"}],include:{category:true},take:6}), publishedUpdates(3), getSettings(),
    db.banner.findFirst({where:{active:true}}), db.event.findFirst({where:{active:true,endsAt:{gte:new Date()}},orderBy:{startsAt:"asc"}}),
    db.review.findMany({take:8,orderBy:{createdAt:"desc"},include:{user:{select:{name:true}},product:{select:{name:true}}}})]);
  let parc = PARC; try{ if(cfg.partners) parc = JSON.parse(cfg.partners) }catch{}
  const [t1,t2] = (banner?.title ?? cfg.hero_title ?? "Produtos para uma experiência inesquecível no | Valoria SMP.").split("|");
  const hero = banner?.image || "/assets/hero-valoria.jpg";
  return <main>
    <section className="relative min-h-[520px] overflow-hidden border-b border-white/10" style={{backgroundImage:`linear-gradient(90deg,#03050Af2 0%,#03050Ab8 38%,#03050A22 100%),url(${hero})`,backgroundSize:"cover",backgroundPosition:"center"}}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,#7c3cff30,transparent_35%)]"/>
      <div className="relative mx-auto flex min-h-[520px] max-w-[1400px] items-center px-4 py-20 lg:px-6"><div className="max-w-2xl">
        <span className="inline-flex rounded-full border border-vio/60 bg-black/30 px-4 py-2 text-[11px] font-bold tracking-wider text-white backdrop-blur">★ O UNIVERSO DE VALORIA SMP</span>
        <h1 className="mt-5 text-4xl font-black leading-[1.02] md:text-6xl">{t1}{t2&&<span className="grad">{t2}</span>}</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-white/70">{banner?.description ?? cfg.hero_subtitle ?? "Explore produtos, vantagens e experiências exclusivas para sua jornada em Valoria SMP."}</p>
        <div className="mt-7 flex flex-wrap gap-3"><Link href={banner?.link||"/atualizacoes"} className="btn-p">{banner?.buttonText||"Conhecer Valoria SMP"}</Link><Link href="/produtos" className="btn-o">Explorar produtos</Link></div>
      </div></div>
    </section>
    <div className="overflow-x-auto border-b border-white/10 bg-surf"><div className="mx-auto flex min-w-max max-w-[1400px] items-center gap-8 px-4 py-3 lg:px-6"><b className="text-base">Parceiros</b>{parc.map(([n,d])=><div key={n} className="flex items-center gap-2 text-xs"><span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-vio to-blu text-xs font-black">{n[0]}</span><div><b>{n}</b><div className="text-[9px] uppercase text-mut">{d}</div></div></div>)}</div></div>
    <div className="mx-auto max-w-[1400px] space-y-12 px-4 py-8 lg:px-6">
      <section className="relative overflow-hidden rounded-3xl border border-vio/30 bg-gradient-to-r from-vio/60 via-vio/30 to-blu/40 p-5 shadow-[0_0_45px_#7c3cff20] md:p-6">
        <img src={event?.image||"/assets/cubo-roxo.png"} alt="" className="absolute -right-2 -top-8 h-40 w-40 object-contain opacity-80"/><div className="relative flex flex-wrap items-center gap-5"><img src="/assets/cubo-roxo.png" alt="" className="h-16 w-16 object-contain"/><div className="min-w-[200px] flex-1"><small className="rounded bg-vio px-2 py-1 text-[9px] font-bold">EVENTO ESPECIAL</small><h2 className="mt-1 text-xl font-black">{event?.name ?? "Temporada Valoria: Ascensão"}</h2><p className="text-sm text-white/70">{event?.description ?? "Participe do evento e desbloqueie recompensas exclusivas."}</p></div><Link href={event?.link||"/atualizacoes"} className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black">Ver evento →</Link></div>
      </section>
      <section id="produtos"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-black md:text-3xl">Produtos oficiais da Valoria SMP</h2><p className="mt-1 text-sm text-mut">Encontre tudo o que precisa para sua experiência em Valoria SMP.</p></div><Link href="/produtos" className="text-sm font-semibold text-vio2">Ver todos os produtos →</Link></div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">{CATS.map((c,i)=><Link key={c} href={i?`/produtos?cat=${encodeURIComponent(c)}`:"/produtos"} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${i===0?"bg-vio text-white":"bg-card text-mut hover:text-white"}`}>{c}</Link>)}</div>
        <div className="mt-3 flex flex-wrap gap-3"><form action="/produtos" className="flex min-w-[260px] flex-1 items-center gap-2 rounded-xl border border-white/10 bg-card px-3 py-2.5"><Search size={15} className="text-mut"/><input name="q" placeholder="Pesquisar por nome do produto" className="w-full bg-transparent text-sm outline-none"/><button className="rounded-lg bg-vio px-4 py-2 text-xs font-bold">Pesquisar</button></form><button className="flex items-center gap-2 rounded-xl border border-white/10 bg-card px-4 py-2.5 text-xs"><SlidersHorizontal size={14}/> Todos os filtros</button><button className="rounded-xl border border-white/10 bg-card px-4 py-2.5 text-xs">Ocultar adquiridos</button><button className="flex items-center gap-2 rounded-xl border border-white/10 bg-card px-4 py-2.5 text-xs">Mais recentes <ChevronDown size={14}/></button></div>
        <h3 className="mb-4 mt-7 text-xl font-black">Em destaque</h3><div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">{products.map(p=><ProductCard key={p.id} p={p}/>)}</div>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-card px-4 py-3 text-xs text-mut"><span>Página 1 de 2 · 17 produtos</span><div className="flex gap-1"><button className="rounded-lg px-3 py-1 hover:bg-white/5">‹</button><button className="rounded-lg bg-vio px-3 py-1 text-white">1</button><button className="rounded-lg px-3 py-1 hover:bg-white/5">2</button><button className="rounded-lg px-3 py-1 hover:bg-white/5">›</button></div></div>
      </section>
      {updates.length>0 && <section><div className="mb-4 flex items-end justify-between"><div><h2 className="text-2xl font-black">Últimas atualizações</h2><p className="text-sm text-mut">Novidades e informações importantes do servidor.</p></div><Link href="/atualizacoes" className="text-sm text-vio2">Ver todas →</Link></div><div className="grid gap-4 md:grid-cols-3">{updates.map(u=><UpdateCard key={u.id} u={u}/>)}</div></section>}
      {reviews.length>0 && <section><h2 className="mb-4 text-2xl font-black">O que nossos usuários pensam</h2><div className="flex snap-x gap-4 overflow-x-auto pb-2">{reviews.map(r=><div key={r.id} className="w-72 shrink-0 snap-start rounded-2xl border border-white/10 bg-card p-4"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-vio to-blu font-bold">{r.user.name[0]}</span><div><b className="text-sm">{r.user.name}</b><div className="text-xs text-gold">{"★".repeat(r.stars)}</div></div></div><p className="mt-3 text-sm leading-5 text-mut">{r.comment}</p><p className="mt-3 text-[10px] text-mut">{r.product.name} · {r.createdAt.toLocaleDateString("pt-BR")}</p></div>)}</div></section>}
    </div>
  </main>;
}
