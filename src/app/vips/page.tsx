import Link from "next/link";
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
    const savings=product.promoPrice!==null&&product.price>0?Math.round((1-currentPrice/product.price)*100):0;
    return { product, benefits, savings };
  });
  const featuredProductId = comparisons.find(item => item.product.featured)?.product.id;
  const benefitTitles = [...new Set(comparisons.flatMap(item => item.benefits.map(benefit => benefit.title)))];
  const brl = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return <main className="page-shell max-w-7xl">
    <header className="vip-hero relative mb-8 overflow-hidden rounded-2xl border border-white/10 px-5 py-8 sm:px-8 sm:py-10">
      <div className="vip-hero-mark" aria-hidden="true">V</div>
      <div className="relative max-w-3xl">
      <span className="brand-tag">Planos e VIPs</span>
      <h1 className="mt-4 text-3xl font-black sm:text-4xl">Sua próxima jornada começa aqui</h1>
      <p className="mt-3 max-w-2xl leading-7 text-mut">Compare os benefícios e escolha o combo ideal para sua jornada.</p>
      <p className="mt-2 text-xs text-mut">Benefícios conforme cadastrados pela equipe; sem vantagens competitivas adicionais.</p>
      </div>
    </header>
    {!comparisons.length ? <p className="glass p-8 text-center text-mut">Não há combos ativos no momento.</p> : <>
      <section className="grid items-stretch gap-5 lg:grid-cols-2">
        {comparisons.map(({ product, benefits, savings }) => <article key={product.id} className={`vip-card group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card ${product.featured ? "vip-card-featured border-white/40" : "border-white/10"}`}>
          <div className="vip-card-top p-5 pb-4 sm:p-6 sm:pb-5">
              <div className="flex min-h-7 items-center justify-between gap-3"><p className="text-xs font-semibold uppercase text-mut">{product.category.name}</p>{product.id===featuredProductId&&<span className="product-highlight rounded-md px-2 py-1 text-[10px] font-bold">Destaque</span>}</div>
              <h2 className="mt-3 text-2xl font-black sm:text-3xl">{product.name}</h2>
            <p className="mt-2 text-sm text-mut">{benefits.length} benefícios incluídos</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><b className="text-3xl font-black">{brl(product.promoPrice ?? product.price)}</b>{product.promoPrice!==null&&<><s className="text-sm text-mut">{brl(product.price)}</s>{savings>0&&<span className="rounded-full border border-white/15 px-2 py-1 text-[10px] font-semibold">-{savings}%</span>}</>}</div><Link href={`/produtos/${product.id}`} className="btn-p inline-flex justify-center">Ver e comprar</Link></div>
          </div>
          <div className="mx-5 h-px bg-white/10 sm:mx-6"/>
          <div className="flex-1 p-5 sm:p-6"><h3 className="mb-3 text-xs font-semibold uppercase text-mut">O que está incluído</h3><ul className="grid gap-2 sm:grid-cols-2">{benefits.map((benefit,index)=><li key={`${benefit.title}-${index}`} className="vip-benefit rounded-xl border border-white/10 bg-surf/50 p-3"><b className="text-sm">{benefit.title}</b>{benefit.detail&&<p className="mt-1 text-xs leading-5 text-mut">{benefit.detail}</p>}</li>)}</ul></div>
        </article>)}
      </section>
      {comparisons.length>1&&<section className="mt-12"><div className="mb-4"><h2 className="text-xl font-bold sm:text-2xl">Compare os benefícios</h2><p className="mt-1 text-sm text-mut">Veja rapidamente o que muda entre os combos.</p></div><div className="overflow-x-auto rounded-2xl border border-white/10"><table className="vip-compare min-w-[640px] w-full border-collapse text-left text-sm"><thead><tr><th className="sticky left-0 z-10 p-4">Benefício</th>{comparisons.map(({product})=><th key={product.id} className="p-4">{product.name}</th>)}</tr></thead><tbody>{benefitTitles.map(title=><tr key={title} className="border-t border-white/10"><th className="sticky left-0 z-10 p-4 font-semibold">{title}</th>{comparisons.map(({product,benefits})=>{const benefit=benefits.find(item=>item.title===title);return <td key={product.id} className="p-4 text-mut">{benefit?benefit.detail||"Incluído":"—"}</td>})}</tr>)}</tbody></table></div></section>}
    </>}
    <p className="mt-8 text-xs text-mut">Confira a descrição completa e informações de compatibilidade na página de cada produto.</p>
  </main>;
}
