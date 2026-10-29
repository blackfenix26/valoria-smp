import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Crown, Map, ShoppingBag, UsersRound } from "lucide-react";
import { db, publishedUpdates, getSettings } from "@/lib/db";
import UpdateCard from "@/components/UpdateCard";
import ProductCard from "@/components/ProductCard";
export const dynamic = "force-dynamic";
const PARC = [["Valoria Network","Rede oficial"],["Eldoria","Servidor parceiro"],["Kronix","Servidor parceiro"],["NovaCraft","Servidor parceiro"],["Arcadia","Servidor parceiro"],["MythicMC","Servidor parceiro"],["Dragon SMP","Servidor parceiro"],["Realm Studios","Servidor parceiro"]];
export default async function Home(){
  const [updates,cfg,banner,event,reviews,serverReviews,storeProducts] = await Promise.all([
    publishedUpdates(3), getSettings(),
    db.banner.findFirst({where:{active:true}}), db.event.findFirst({where:{active:true,endsAt:{gte:new Date()}},orderBy:{startsAt:"asc"}}),
    db.review.findMany({where:{status:"APPROVED"},take:8,orderBy:{createdAt:"desc"},include:{user:{select:{name:true}},product:{select:{name:true}}}}),
    db.serverReview.findMany({where:{status:"APPROVED"},take:6,orderBy:{createdAt:"desc"},include:{user:{select:{name:true}}}}),
    db.product.findMany({where:{active:true,OR:[{featured:true},{promoPrice:{not:null}}]},orderBy:[{featured:"desc"},{createdAt:"desc"}],take:16,include:{category:true}})]);
  const featuredProducts = storeProducts
    .filter(product=>product.featured||(product.promoPrice!==null&&product.promoPrice<product.price))
    .slice(0,4);
  const productRatings = featuredProducts.length
    ? await db.review.groupBy({by:["productId"],where:{status:"APPROVED",productId:{in:featuredProducts.map(product=>product.id)}},_avg:{stars:true},_count:{_all:true}})
    : [];
  const ratedFeaturedProducts = featuredProducts.map(product=>{
    const stats=productRatings.find(item=>item.productId===product.id);
    return {...product,ratingAverage:stats?stats._avg.stars:null,ratingCount:stats?stats._count._all:0};
  });
  let parc = PARC; try{ if(cfg.partners) parc = JSON.parse(cfg.partners) }catch{}
  const heroTagline = (banner?.title ?? cfg.hero_title ?? "Produtos para uma experiência inesquecível no | Valoria SMP.").replace(/\s*\|\s*/g," ").trim();
  const hero = banner?.image || "/assets/hero-valoria.jpg";
  return <main>
    <section className="home-hero relative min-h-[520px] overflow-hidden border-b border-white/10">
      <img src={hero} alt="" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover object-[center_44%] md:object-center"/>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,5,10,.88)_0%,rgba(3,5,10,.62)_42%,rgba(3,5,10,.12)_100%)]"/>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,#7c3cff20,transparent_38%)]"/>
      <div className="relative mx-auto flex min-h-[560px] max-w-[1400px] items-center px-4 py-16 lg:min-h-[600px] lg:px-6 lg:py-20"><div className="reveal max-w-2xl">
        <span className="hero-kicker inline-flex rounded-full border border-white/25 bg-black/35 px-4 py-2 text-[11px] font-bold tracking-[.16em] text-white backdrop-blur">★ O UNIVERSO DE VALORIA SMP</span>
        <h1 className="mt-5 text-5xl font-black leading-[.98] sm:text-6xl lg:text-7xl">Valoria <span className="grad">SMP</span></h1>
        <p className="mt-5 max-w-xl text-lg font-semibold leading-7 text-white">{heroTagline}</p>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base">{banner?.description ?? cfg.hero_subtitle ?? "Explore produtos, vantagens e experiências exclusivas para sua jornada em Valoria SMP."}</p>
        <div className="mt-7 flex flex-wrap gap-3"><Link href={banner?.link||"/reinos"} className="btn-p">{banner?.buttonText||"Conhecer os Reinos"}</Link><Link href="/produtos" className="btn-o">Explorar produtos</Link></div>
        <div className="mt-7 grid max-w-xl grid-cols-3 gap-2 text-[10px] text-white/65 sm:mt-8 sm:gap-3"><div className="hero-proof"><b>VIPs</b><span>Compare combos</span></div><div className="hero-proof"><b>PIX</b><span>Checkout via PIX</span></div><div className="hero-proof"><b>Entrega</b><span>Após aprovação</span></div></div>
      </div></div>
    </section>
    <div className="border-b border-white/10 bg-surf"><div className="mx-auto grid max-w-[1400px] grid-cols-2 items-center gap-3 px-4 py-4 sm:grid-cols-3 lg:grid-cols-[auto_repeat(4,1fr)] lg:gap-6 lg:px-6"><b className="col-span-2 text-xs font-bold uppercase tracking-[.18em] text-mut sm:col-span-3 lg:col-span-1">Parceiros</b>{parc.slice(0,4).map(([n,d])=><div key={n} className="flex min-w-0 items-center gap-2 text-xs"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-xs font-black">{n[0]}</span><div className="min-w-0"><b className="block truncate">{n}</b><div className="truncate text-[9px] uppercase text-mut">{d}</div></div></div>)}</div></div>
    <div className="home-content mx-auto max-w-[1400px] space-y-12 px-4 py-8 lg:px-6">
      <section className="event-panel relative overflow-hidden rounded-3xl border border-vio/30 bg-gradient-to-r from-vio/60 via-vio/30 to-blu/40 p-5 shadow-[0_0_45px_#7c3cff20] md:p-6">
        <img src={event?.image||"/assets/cubo-roxo.png"} alt="" className="float-soft absolute -right-2 -top-8 h-40 w-40 object-contain opacity-80"/><div className="relative flex flex-wrap items-center gap-5"><img src="/assets/cubo-roxo.png" alt="" className="float-soft h-16 w-16 object-contain"/><div className="min-w-[200px] flex-1"><small className="rounded bg-vio px-2 py-1 text-[9px] font-bold">EVENTO ESPECIAL</small><h2 className="mt-1 text-xl font-black">{event?.name ?? "Temporada Valoria: Ascensão"}</h2><p className="text-sm text-white/70">{event?.description ?? "Participe do evento e desbloqueie recompensas exclusivas."}</p></div><Link href={event?.link||"/atualizacoes"} className="shine-hover rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black">Ver evento →</Link></div>
      </section>
      <section className="home-feature-grid grid gap-4 md:grid-cols-3" aria-label="Destaques da Valória">
        <Link href="/reinos" className="feature-card feature-card-realm">
          <div className="feature-card-head"><span className="feature-card-icon"><Map size={21}/></span><span className="feature-card-index">01 <span>/</span> EXPLORAR</span></div>
          <div className="feature-card-copy"><span className="section-kicker">Comunidade</span><h2>Reinos vivos</h2><p>Explore líderes, histórias e culturas que tornam cada jornada ímpar.</p></div>
          <span className="feature-card-link">Explorar reinos <ArrowRight size={16}/></span>
        </Link>
        <Link href="/vips" className="feature-card feature-card-vip">
          <div className="feature-card-head"><span className="feature-card-icon"><Crown size={21}/></span><span className="feature-card-index">02 <span>/</span> DESCOBRIR</span></div>
          <div className="feature-card-copy"><span className="section-kicker">Benefícios</span><h2>VIPs premium</h2><p>Compare as vantagens e escolha o pacote ideal para o seu estilo.</p></div>
          <span className="feature-card-link">Comparar planos <ArrowRight size={16}/></span>
        </Link>
        <Link href="/produtos" className="feature-card feature-card-shop">
          <div className="feature-card-head"><span className="feature-card-icon"><ShoppingBag size={21}/></span><span className="feature-card-index">03 <span>/</span> PERSONALIZAR</span></div>
          <div className="feature-card-copy"><span className="section-kicker">Loja</span><h2>Itens e combos</h2><p>Encontre kits e conteúdos para elevar sua experiência.</p></div>
          <span className="feature-card-link">Abrir loja <ArrowRight size={16}/></span>
        </Link>
      </section>
      <section className="rounded-[28px] border border-white/10 bg-[#111316]/90 p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><span className="section-kicker">Por que jogar na Valoria</span><h2 className="mt-2 text-2xl font-black md:text-3xl">Uma experiência pensada para o longo prazo</h2></div><Link href="/produtos" className="text-sm font-semibold underline underline-offset-4">Descobrir produtos →</Link></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="stat-pill"><strong>Reinos</strong><span>Histórias para explorar</span></div>
          <div className="stat-pill"><strong>Combos</strong><span>Benefícios para comparar</span></div>
          <div className="stat-pill"><strong>Comunidade</strong><span>Um lugar para fazer parte</span></div>
        </div>
      </section>
      <section className="storefront-section"><div className="flex flex-wrap items-end justify-between gap-4"><div><span className="section-kicker">Explore a comunidade</span><h2 className="mt-2 text-2xl font-black md:text-3xl">Mais para viver a Valória</h2><p className="mt-1 text-sm text-mut">Descubra histórias, combos e oportunidades além da loja.</p></div><Link href="/produtos" className="text-sm font-semibold underline underline-offset-4">Abrir loja →</Link></div><div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Link href="/reinos" className="home-discovery home-discovery-realm"><span className="home-discovery-icon"><UsersRound size={19}/></span><span className="section-kicker">Comunidade</span><h3>Conheça os Reinos</h3><p>Veja líderes, identidades e histórias que formam o mundo da Valória.</p><span className="home-discovery-link">Explorar reinos <ArrowRight size={15}/></span></Link>
        <Link href="/vips" className="home-discovery home-discovery-vip"><span className="home-discovery-icon"><Crown size={19}/></span><span className="section-kicker">Personalização</span><h3>Compare os VIPs</h3><p>Confira benefícios e escolha o combo que combina com sua jornada.</p><span className="home-discovery-link">Ver comparação <ArrowRight size={15}/></span></Link>
        <Link href="/trabalhe-conosco" className="home-discovery home-discovery-team"><span className="home-discovery-icon"><BriefcaseBusiness size={19}/></span><span className="section-kicker">Faça parte</span><h3>Trabalhe Conosco</h3><p>Encontre oportunidades para ajudar a construir a comunidade.</p><span className="home-discovery-link">Ver oportunidades <ArrowRight size={15}/></span></Link>
      </div></section>
      {ratedFeaturedProducts.length>0&&<section className="storefront-section"><div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><span className="section-kicker">Seleção da loja</span><h2 className="mt-2 text-2xl font-black md:text-3xl">Destaques e ofertas</h2><p className="mt-1 text-sm text-mut">Confira os itens em evidência e aproveite as ofertas disponíveis.</p></div><Link href="/produtos" className="text-sm font-semibold underline underline-offset-4">Ver catálogo completo →</Link></div><div className="product-grid grid grid-cols-1 gap-5 min-[430px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">{ratedFeaturedProducts.map((product,index)=><ProductCard key={product.id} p={product} index={index}/>)}</div></section>}
      {updates.length>0 && <section className="storefront-section"><div className="mb-4 flex items-end justify-between"><div><span className="section-kicker">O mundo muda</span><h2 className="mt-2 text-2xl font-black">Últimas atualizações</h2><p className="text-sm text-mut">Novidades e informações importantes do servidor.</p></div><Link href="/atualizacoes" className="text-sm font-semibold underline underline-offset-4">Ver todas →</Link></div><div className="grid gap-4 md:grid-cols-3">{updates.map(u=><UpdateCard key={u.id} u={u}/>)}</div></section>}
      {reviews.length>0 && <section><h2 className="mb-4 text-2xl font-black">O que nossos usuários pensam</h2><div className="flex snap-x gap-4 overflow-x-auto pb-2">{reviews.map(r=><div key={r.id} className="w-72 shrink-0 snap-start rounded-2xl border border-white/10 bg-card p-4"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-vio to-blu font-bold">{r.user.name[0]}</span><div><b className="text-sm">{r.user.name}</b><div className="text-xs text-gold">{"★".repeat(r.stars)}</div></div></div><p className="mt-3 text-sm leading-5 text-mut">{r.comment}</p><p className="mt-3 text-[10px] text-mut">{r.product.name} · {r.createdAt.toLocaleDateString("pt-BR")}</p></div>)}</div></section>}
      {serverReviews.length>0 && <section><h2 className="mb-4 text-2xl font-black">A comunidade sobre o servidor</h2><div className="grid gap-4 md:grid-cols-3">{serverReviews.map(r=><div key={r.id} className="rounded-2xl border border-white/10 bg-card p-4"><b>{r.user.name}</b><div className="text-xs text-gold">{"★".repeat(r.stars)}</div><p className="mt-3 text-sm leading-5 text-mut">{r.comment}</p></div>)}</div></section>}
    </div>
  </main>;
}
