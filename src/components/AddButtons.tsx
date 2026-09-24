"use client";
import { Heart, ShoppingCart, Check } from "lucide-react"; import { useCart, Item } from "./CartProvider";
export default function AddButtons({p,big}:{p:Item;big?:boolean}){
  const {cart,favs,add,toggleFav} = useCart(), inCart = cart.some(i=>i.id===p.id), fav = favs.includes(p.id);
  return <div className="flex items-center gap-2">
    <button aria-label="Favoritar" onClick={()=>toggleFav(p.id)} className="rounded-full border border-white/10 p-2"><Heart size={14} className={fav?"fill-red-500 text-red-500":""}/></button>
    <button aria-label="Adicionar ao carrinho" onClick={()=>add(p)} className="btn-p flex items-center gap-1 !px-3 !py-2">{inCart?<Check size={14}/>:<ShoppingCart size={14}/>}{big&&(inCart?"No carrinho":"Adicionar ao carrinho")}</button></div>;
}
