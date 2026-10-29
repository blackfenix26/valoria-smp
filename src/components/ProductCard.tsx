import Link from "next/link";
import { Star } from "lucide-react";
import AddButtons from "./AddButtons";
import FavoriteButton from "./FavoriteButton";

type P = { id:string; name:string; description:string; image:string; price:number; promoPrice:number|null; featured?:boolean; ratingAverage?:number|null; ratingCount?:number; category:{name:string} };
export default function ProductCard({p}:{p:P}){
  const price = p.promoPrice ?? p.price;
  const discount = p.promoPrice && p.price > 0 ? Math.round((1 - p.promoPrice / p.price) * 100) : 0;
  const brl = (n:number)=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  return <article className="product-card group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-card shadow-[0_14px_35px_rgba(0,0,0,.2)]">
    <div className="product-media relative isolate overflow-hidden">
      <Link href={`/produtos/${p.id}`} aria-label={`Ver ${p.name}`} className="absolute inset-0 z-0 grid place-items-center">
        <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-105"/>
      </Link>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent"/>
      <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">{p.featured&&<span className="product-highlight rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide">Destaque</span>}{discount>0&&<span className="product-discount rounded-full px-2.5 py-1 text-[10px] font-bold">-{discount}%</span>}</div>
      <FavoriteButton productId={p.id}/>
    </div>
    <div className="flex flex-1 flex-col p-4 sm:p-5">
      <div className="mb-2 flex items-center justify-between gap-3"><span className="product-category truncate">{p.category.name}</span>{(p.ratingCount??0)>0?<span className="flex shrink-0 items-center gap-1 text-xs"><Star size={12} className="fill-yellow-400 text-yellow-400"/>{p.ratingAverage?.toFixed(1)} <span className="text-mut">({p.ratingCount})</span></span>:<span className="shrink-0 text-[10px] text-mut">Sem avaliações</span>}</div>
      <Link href={`/produtos/${p.id}`} className="line-clamp-2 min-h-10 text-base font-bold leading-5 transition-colors hover:text-white">{p.name}</Link>
      <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-mut">{p.description}</p>
      <div className="mt-auto border-t border-white/10 pt-4"><div className="mb-3 flex min-h-10 items-end justify-between gap-2"><div><span className="block text-[9px] font-semibold uppercase tracking-[.14em] text-mut">Preço</span><b className="text-lg font-black">{brl(price)}</b></div>{p.promoPrice!==null&&<s className="pb-0.5 text-xs text-mut">{brl(p.price)}</s>}</div><AddButtons p={{id:p.id,name:p.name,price,image:p.image}} showFavorite={false} card/></div>
    </div>
  </article>;
}
