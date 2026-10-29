"use client";
import { Heart, ShoppingCart, Check } from "lucide-react"; import { cartItemKey, useCart, Item } from "./CartProvider";
export default function AddButtons({p,big,showFavorite=true,card=false}:{p:Item;big?:boolean;showFavorite?:boolean;card?:boolean}){
  const {cart,favs,add,toggleFav} = useCart(), inCart = cart.some(i=>cartItemKey(i)===cartItemKey(p)), fav = favs.includes(p.id);
  return <div className="flex items-center gap-2">
    {showFavorite&&<button type="button" aria-label={fav?"Remover dos favoritos":"Adicionar aos favoritos"} aria-pressed={fav} onClick={()=>toggleFav(p.id)} className="rounded-full border border-white/10 p-2"><Heart size={14} className={fav?"fill-red-500 text-red-500":""}/></button>}
    <button type="button" aria-label={inCart?"Adicionar outra unidade ao carrinho":"Adicionar ao carrinho"} onClick={()=>add(p)} className={`btn-p flex items-center justify-center gap-2 ${card?"w-full !rounded-xl !px-3 !py-2.5 text-xs":"!px-3 !py-2"}`}>{inCart?<Check size={14}/>:<ShoppingCart size={14}/>} {(big||card)&&(inCart?"Adicionar mais":"Adicionar ao carrinho")}</button></div>;
}
