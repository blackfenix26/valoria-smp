import { notFound } from "next/navigation"; import { db } from "@/lib/db"; import AddButtons from "@/components/AddButtons";
export const dynamic = "force-dynamic";
export default async function Produto({params}:{params:{id:string}}){
  const p = await db.product.findUnique({where:{id:params.id},include:{category:true,reviews:{include:{user:{select:{name:true}}},orderBy:{createdAt:"desc"}}}});
  if(!p||!p.active) notFound(); const price = p.promoPrice??p.price, brl = (n:number)=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  return <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-vio/40 to-bg"><img src={p.image} alt={p.name} className="w-full object-cover"/></div>
    <div className="space-y-4"><span className="rounded bg-surf px-2 text-xs text-mut">{p.category.name}</span><h1 className="text-3xl font-bold">{p.name}</h1><p className="text-mut">{p.description}</p>
      <p className="text-3xl font-bold text-vio2">{brl(price)}{p.promoPrice&&<s className="ml-3 text-base font-normal text-mut">{brl(p.price)}</s>}</p>
      <AddButtons big p={{id:p.id,name:p.name,price,image:p.image}}/>
      <h2 className="pt-6 text-xl font-bold">Avaliações</h2>{p.reviews.length?p.reviews.map(r=><div key={r.id} className="rounded-xl border border-white/10 bg-card p-3 text-sm"><b>{r.user.name}</b> <span className="text-gold">{"★".repeat(r.stars)}</span><p className="text-mut">{r.comment}</p></div>):<p className="text-sm text-mut">Ainda sem avaliações.</p>}</div></main>;
}
