import Link from "next/link"; import { db } from "@/lib/db"; import ProductCard from "@/components/ProductCard";
export const dynamic = "force-dynamic"; const PER = 12;
type SP = { q?:string; cat?:string; sort?:string; page?:string };
export default async function Produtos({searchParams:sp}:{searchParams:SP}){
  const page = Math.max(1,Number(sp.page)||1), cats = await db.category.findMany({orderBy:{name:"asc"}});
  const where = { active:true, ...(sp.q?{name:{contains:sp.q}}:{}), ...(sp.cat&&sp.cat!=="Todos"?{category:{name:sp.cat}}:{}) };
  const orderBy = sp.sort==="asc"?{price:"asc" as const}:sp.sort==="desc"?{price:"desc" as const}:{createdAt:"desc" as const};
  const [total,list] = await Promise.all([db.product.count({where}), db.product.findMany({where,orderBy,include:{category:true},skip:(page-1)*PER,take:PER})]);
  const pages = Math.max(1,Math.ceil(total/PER)), href = (o:Partial<SP>)=>"/produtos?"+new URLSearchParams(Object.entries({...sp,...o}).filter(([,v])=>v) as [string,string][]).toString();
  return <main className="page-shell">
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <span className="brand-tag">Loja oficial</span>
        <h1 className="mt-3 section-title">Produtos SMP</h1>
      </div>
      <p className="text-sm text-white/60">{total} itens disponíveis para você.</p>
    </div>
    <div className="glass mb-6 p-3">
      <div className="flex gap-2 overflow-x-auto pb-1">{["Todos",...cats.map(c=>c.name)].map(c=><Link key={c} href={href({cat:c,page:"1"})} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium ${(sp.cat||"Todos")===c?"border-blue-500 bg-blue-500/20 text-white":"border-white/10 bg-black/20 text-white/70 hover:text-white"}`}>{c}</Link>)}</div>
    </div>
    <form className="mb-6 flex flex-col gap-3 lg:flex-row">
      <div className="flex flex-1 gap-3">
        <input name="q" defaultValue={sp.q} placeholder="Pesquisar por nome do produto..." className="inp max-w-sm"/>{sp.cat&&<input type="hidden" name="cat" value={sp.cat}/>}
      </div>
      <select name="sort" defaultValue={sp.sort||"new"} className="inp w-full lg:w-44"><option value="new">Mais recentes</option><option value="asc">Menor preço</option><option value="desc">Maior preço</option></select>
      <button className="btn-p">Filtrar</button>
    </form>
    {list.length?<div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{list.map(p=><ProductCard key={p.id} p={p}/>)}</div>:<div className="glass p-8 text-center text-white/70">Nenhum produto encontrado. Tente outra categoria ou termo.</div>}
    <div className="mt-6 flex flex-col gap-3 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between"><span>Página {page} de {pages} • {total} produtos</span><div className="flex gap-2">{page>1&&<Link className="btn-o !py-1" href={href({page:String(page-1)})}>‹ Anterior</Link>}{page<pages&&<Link className="btn-o !py-1" href={href({page:String(page+1)})}>Próxima ›</Link>}</div></div>
  </main>;
}
