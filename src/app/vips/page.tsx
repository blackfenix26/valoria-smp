import Link from "next/link";
import { ArrowRight, Check, Crown, ShieldCheck, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { parseProductBenefits } from "@/lib/product-content";
export const dynamic = "force-dynamic";

export default async function VipsPage() {
  const categories = await db.category.findMany({ select: { id: true, name: true } });
  const comboCategoryIds = categories
    .filter(category => category.name.toLowerCase().includes("combo"))
    .map(category => category.id);
  const products = await db.product.findMany({
    where: { active: true, categoryId: { in: comboCategoryIds } },
    include: { category: true },
    orderBy: [{ vipOrder: "asc" }, { featured: "desc" }, { price: "desc" }],
  });
  const comparisons = products.map(product => {
    let configured: {title:string;detail:string}[]=[];
    try { const value=JSON.parse(product.vipBenefits||""); if(Array.isArray(value)) configured=value; } catch {}
    const benefits=configured.length ? configured : parseProductBenefits(product.description);
    const currentPrice=product.promoPrice??product.price;
    const savings=product.promoPrice!==null&&product.price>0&&product.promoPrice<product.price?Math.round((1-currentPrice/product.price)*100):0;
    return { product, benefits, savings };
  });
  const featuredProductId = comparisons.find(item => item.product.featured)?.product.id;
  const benefitTitles = [...new Set(comparisons.flatMap(item => item.benefits.map(benefit => benefit.title)))];
  const brl = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return <main className="page-shell max-w-7xl">
    <header className="vip-hero vip-page-hero relative mb-8 overflow-hidden rounded-[30px] border border-white/10 px-5 py-8 sm:px-8 sm:py-10">
      <div className="vip-hero-mark" aria-hidden="true">V</div>
      <div className="relative max-w-3xl">
        <span className="brand-tag"><Crown size={13}/> Planos e vantagens</span>
        <h1 className="mt-4 text-3xl font-black sm:text-5xl">Escolha seu próximo nível.</h1>
        <p className="mt-3 max-w-2xl leading-7 text-mut">Compare o que cada combo oferece e encontre o que combina com a sua jornada.</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-mut"><span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-blue-300"/> Benefícios descritos com transparência</span><span className="inline-flex items-center gap-1.5"><Sparkles size={14} className="text-violet-300"/> Escolha sem compromisso</span></div>
      </div>
    </header>
    {!comparisons.length ? <div className="vip-empty glass rounded-3xl p-8 text-center sm:p-12"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-violet-300/15 bg-violet-400/10 text-violet-200"><Crown size={24}/></span><h2 className="mt-4 text-xl font-bold">Novos combos em breve</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-mut">Enquanto isso, explore os produtos disponíveis na loja.</p><Link href="/produtos" className="btn-p mt-5 inline-flex items-center gap-2">Explorar produtos <ArrowRight size={15}/></Link></div> : <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="section-kicker">Opções disponíveis</p><p className="mt-1 text-sm text-mut">{comparisons.length} {comparisons.length===1?"combo ativo":"combos ativos"}</p></div><Link href="/produtos" className="text-xs font-semibold underline underline-offset-4">Ver todos os produtos →</Link></div>
      <section className="grid items-stretch gap-5 lg:grid-cols-2">
        {comparisons.map(({ product, benefits, savings }) => <article key={product.id} className={`vip-card vip-plan group relative flex min-w-0 flex-col overflow-hidden rounded-[26px] border bg-card ${product.featured ? "vip-card-featured border-white/40" : "border-white/10"}`}>
          <div className={`vip-plan-cover relative p-5 pb-5 sm:p-6 ${product.id===featuredProductId?"vip-plan-cover-featured":""}`}>
            <div className="flex min-h-7 items-center justify-between gap-3"><p className="text-[10px] font-bold uppercase tracking-[.17em] text-mut">{product.category.name}</p>{product.id===featuredProductId&&<span className="product-highlight rounded-full px-3 py-1.5 text-[10px] font-bold">Destaque</span>}</div>
            <h2 className="mt-4 text-2xl font-black sm:text-3xl">{product.name}</h2>
            <p className="mt-2 text-sm text-mut">{benefits.length} {benefits.length===1?"benefício":"benefícios"} incluídos</p>
            <div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><span className="mb-1 block text-[9px] font-bold uppercase tracking-[.17em] text-mut">{savings>0?"Oferta por":"Investimento"}</span><div className="flex flex-wrap items-baseline gap-x-2 gap-y-1"><b className="text-3xl font-black tabular-nums">{brl(product.promoPrice ?? product.price)}</b>{savings>0&&<><s className="text-sm text-mut">{brl(product.price)}</s><span className="vip-savings-tag rounded-full px-2.5 py-1 text-[10px] font-bold">-{savings}%</span></>}</div></div><Link href={`/produtos/${product.id}`} className="btn-p inline-flex min-h-11 items-center gap-2">Ver plano <ArrowRight size={15}/></Link></div>
          </div>
          <div className="vip-plan-divider mx-5 h-px sm:mx-6"/>
          <div className="flex-1 p-5 sm:p-6"><h3 className="mb-3 text-[10px] font-bold uppercase tracking-[.17em] text-mut">O que está incluído</h3>{benefits.length?<ul className="grid gap-2 sm:grid-cols-2">{benefits.map((benefit,index)=><li key={`${benefit.title}-${index}`} className="vip-benefit rounded-xl border border-white/10 bg-surf/50 p-3"><b className="flex items-start gap-2 text-sm"><Check size={15} className="mt-0.5 shrink-0 text-emerald-300"/>{benefit.title}</b>{benefit.detail&&<p className="mt-1 pl-[23px] text-xs leading-5 text-mut">{benefit.detail}</p>}</li>)}</ul>:<p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-mut">Consulte a descrição completa do plano para ver os detalhes.</p>}</div>
        </article>)}
      </section>
      {comparisons.length>1&&<section className="vip-comparison mt-12"><div className="mb-4"><span className="section-kicker">Lado a lado</span><h2 className="mt-2 text-xl font-bold sm:text-2xl">Compare os benefícios</h2><p className="mt-1 text-sm text-mut">Veja rapidamente o que muda entre os combos.</p></div><div className="overflow-x-auto rounded-2xl border border-white/10"><table className="vip-compare min-w-[640px] w-full border-collapse text-left text-sm"><thead><tr><th className="sticky left-0 z-10 p-4">Benefício</th>{comparisons.map(({product})=><th key={product.id} className="p-4">{product.name}</th>)}</tr></thead><tbody>{benefitTitles.map(title=><tr key={title} className="border-t border-white/10"><th className="sticky left-0 z-10 p-4 font-semibold">{title}</th>{comparisons.map(({product,benefits})=>{const benefit=benefits.find(item=>item.title===title);return <td key={product.id} className="p-4 text-mut">{benefit?benefit.detail||"Incluído":"—"}</td>})}</tr>)}</tbody></table></div></section>}
    </>}
    <p className="mt-8 text-xs text-mut">Confira a descrição e as informações de compatibilidade na página de cada produto.</p>
  </main>;
}
