import Link from "next/link"; import { db } from "@/lib/db"; import ProductCard from "@/components/ProductCard";
export const dynamic = "force-dynamic"; const PER = 12;
type SP = { q?:string; cat?:string; sort?:string; page?:string };
export default async function Produtos({searchParams}:{searchParams:Promise<SP>}){
  const sp = await searchParams;
  const page = Math.max(1,Number(sp.page)||1), cats = await db.category.findMany({orderBy:{name:"asc"}});
  const where = { active:true, ...(sp.q?{name:{contains:sp.q}}:{}), ...(sp.cat&&sp.cat!=="Todos"?{category:{name:sp.cat}}:{}) };
  const orderBy = sp.sort==="asc"?{price:"asc" as const}:sp.sort==="desc"?{price:"desc" as const}:{createdAt:"desc" as const};
  const [total,list] = await Promise.all([db.product.count({where}), db.product.findMany({where,orderBy,include:{category:true},skip:(page-1)*PER,take:PER})]);
  const ratingStats = list.length ? await db.review.groupBy({by:["productId"],where:{status:"APPROVED",productId:{in:list.map(product=>product.id)}},_avg:{stars:true},_count:{_all:true}}) : [];
  const ratedList = list.map(product=>{const stats=ratingStats.find(item=>item.productId===product.id);return {...product,ratingAverage:stats?stats._avg.stars:null,ratingCount:stats?stats._count._all:0}});
  const pages = Math.max(1,Math.ceil(total/PER)), href = (o:Partial<SP>)=>"/produtos?"+new URLSearchParams(Object.entries({...sp,...o}).filter(([,v])=>v) as [string,string][]).toString();
  return <main className="page-shell">
    <header className="storefront-hero mb-7 overflow-hidden rounded-3xl border border-white/10 px-5 py-7 sm:px-8 sm:py-9">
      <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><span className="brand-tag">Loja oficial</span><h1 className="mt-4 text-3xl font-black sm:text-4xl">Escolha sua próxima vantagem</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-mut">Produtos, combos e recursos para personalizar sua jornada na Valória SMP.</p></div><div className="grid grid-cols-3 gap-2 text-center text-[10px] text-mut sm:gap-3"><div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3"><b className="block text-sm text-white">PIX</b>Pagamento simples</div><div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3"><b className="block text-sm text-white">VIPs</b>Compare combos</div><div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3"><b className="block text-sm text-white">Seguro</b>Entrega após aprovação</div></div></div>
    </header>
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-mut">Catálogo</p><p className="mt-1 text-sm text-mut"><b className="text-white">{total}</b> {total===1?"produto encontrado":"produtos encontrados"}</p></div><Link href="/vips" className="text-sm font-semibold underline underline-offset-4">Comparar VIPs →</Link></div>
    <nav aria-label="Categorias de produtos" className="glass storefront-categories mb-5 p-3">
      <div className="flex gap-2 overflow-x-auto pb-1">{["Todos",...cats.map(c=>c.name)].map(c=><Link key={c} href={href({cat:c,page:"1"})} aria-current={(sp.cat||"Todos")===c?"page":undefined} className={`category-chip whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition ${(sp.cat||"Todos")===c?"category-chip-active border-blue-500 bg-blue-500/20 text-white":"border-white/10 bg-black/20 text-white/70 hover:text-white"}`}>{c}</Link>)}</div>
    </nav>
    <form aria-label="Filtrar produtos" className="storefront-filters mb-7 flex flex-col gap-3 rounded-2xl border border-white/10 bg-card/70 p-3 lg:flex-row lg:items-center">
      <div className="flex flex-1 gap-3">
        <label className="sr-only" htmlFor="product-search">Pesquisar produtos</label><input id="product-search" name="q" defaultValue={sp.q} placeholder="Pesquisar pelo nome de um produto..." className="inp max-w-none"/>{sp.cat&&<input type="hidden" name="cat" value={sp.cat}/>}
      </div>
      <label className="sr-only" htmlFor="product-sort">Ordenar produtos</label><select id="product-sort" name="sort" defaultValue={sp.sort||"new"} className="inp w-full lg:w-48"><option value="new">Mais recentes</option><option value="asc">Menor preço</option><option value="desc">Maior preço</option></select>
      <button className="btn-p min-h-11">Aplicar filtros</button>
    </form>
    {list.length?<div className="product-grid grid grid-cols-1 gap-5 min-[430px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">{ratedList.map((p,index)=><ProductCard key={p.id} p={p} index={index}/>)}</div>:<div className="storefront-empty rounded-2xl border border-dashed border-white/20 p-10 text-center"><p className="text-lg font-semibold">Nenhum produto encontrado</p><p className="mt-2 text-sm text-mut">Tente outra categoria ou pesquise por um nome diferente.</p><Link href="/produtos" className="btn-o mt-5 inline-flex">Limpar filtros</Link></div>}
    {total>0&&<nav aria-label="Paginação de produtos" className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between"><span>Página {page} de {pages} <span className="text-white/25">·</span> {total} {total===1?"produto":"produtos"}</span><div className="flex gap-2">{page>1&&<Link className="btn-o !py-1" href={href({page:String(page-1)})}>‹ Anterior</Link>}{page<pages&&<Link className="btn-o !py-1" href={href({page:String(page+1)})}>Próxima ›</Link>}</div></nav>}
  </main>;
}
