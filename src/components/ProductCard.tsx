import Link from "next/link";
import { Heart, Star } from "lucide-react";
import AddButtons from "./AddButtons";

type P = { id:string; name:string; description:string; image:string; price:number; promoPrice:number|null; category:{name:string} };
export default function ProductCard({p}:{p:P}){
  const price = p.promoPrice ?? p.price;
  const brl = (n:number)=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  return <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-card/90 shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-blue-500/60 hover:shadow-blue-500/10">
    <Link href={`/produtos/${p.id}`} className="relative block h-48 overflow-hidden bg-[radial-gradient(circle_at_center,#1D4ED830,transparent_65%)]">
      <span className="absolute left-3 top-3 z-10 rounded-md bg-black/70 px-2 py-1 text-[10px] font-bold text-blue-400 ring-1 ring-blue-500/50">Destaque</span>
      <button type="button" aria-label="Favoritar" className="absolute right-3 top-3 z-10 rounded-lg border border-white/10 bg-black/30 p-2 text-white/70 backdrop-blur hover:text-white"><Heart size={14}/></button>
      <img src={p.image} alt={p.name} className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105"/>
    </Link>
    <div className="flex flex-1 flex-col gap-2 p-4">
      <Link href={`/produtos/${p.id}`} className="font-bold transition hover:text-blue-400">{p.name}</Link>
      <p className="line-clamp-2 min-h-8 text-xs leading-4 text-mut">{p.description}</p>
      <span className="w-fit rounded-md bg-surf px-2 py-1 text-[10px] text-mut">{p.category.name}</span>
      <div className="flex items-center gap-1 text-xs"><Star size={12} className="fill-yellow-400 text-yellow-400"/>4.8 <span className="text-mut">(128)</span></div>
      <div className="mt-auto flex items-end justify-between gap-2 pt-2"><div className="font-black text-blue-400">{brl(price)}{p.promoPrice&&<s className="ml-2 text-xs font-normal text-mut">{brl(p.price)}</s>}</div><AddButtons p={{id:p.id,name:p.name,price,image:p.image}}/></div>
    </div>
  </article>;
}
