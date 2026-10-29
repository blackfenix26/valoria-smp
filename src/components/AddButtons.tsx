"use client";
import { useEffect, useState } from "react";
import { Heart, ShoppingCart, Check } from "lucide-react"; import { cartItemKey, useCart, Item } from "./CartProvider";
export default function AddButtons({p,big,showFavorite=true,card=false,maxQuantity=99}:{p:Item;big?:boolean;showFavorite?:boolean;card?:boolean;maxQuantity?:number}){
  const {cart,favs,add,toggleFav} = useCart(), current = cart.find(i=>cartItemKey(i)===cartItemKey(p)), inCart = !!current, fav = favs.includes(p.id);
  const available = Math.max(0,Math.min(99,maxQuantity-(current?.quantity||0)));
  const [quantity,setQuantity] = useState(1);
  useEffect(()=>{setQuantity(value=>Math.min(Math.max(1,value),Math.max(1,available)))},[available]);
  return <div className={`flex items-center gap-2 ${card?"flex-wrap":""}`}>
    {showFavorite&&<button type="button" aria-label={fav?"Remover dos favoritos":"Adicionar aos favoritos"} aria-pressed={fav} onClick={()=>toggleFav(p.id)} className="rounded-full border border-white/10 p-2"><Heart size={14} className={fav?"fill-red-500 text-red-500":""}/></button>}
    <label className={`inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-black/10 px-2.5 ${card?"min-h-10":"min-h-11"}`}>
      <span className="text-[10px] font-semibold text-mut">Qtd.</span>
      <select aria-label={`Quantidade de ${p.name} para adicionar`} value={quantity} disabled={!available} onChange={event=>setQuantity(Number(event.target.value))} className="w-12 bg-transparent text-sm font-bold text-white outline-none disabled:opacity-50">
        {Array.from({length:Math.max(1,available)},(_,index)=>index+1).map(value=><option key={value} value={value} className="bg-[#111827] text-white">{value}</option>)}
      </select>
    </label>
    <button type="button" aria-label={available?`Adicionar ${quantity} ${quantity===1?"unidade":"unidades"} de ${p.name} ao carrinho`:`Limite de ${maxQuantity} unidade${maxQuantity===1?"":"s"} atingido`} disabled={!available} onClick={()=>add(p,quantity)} className={`btn-p flex min-w-0 flex-1 items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50 ${card?"!rounded-xl !px-3 !py-2.5 text-xs":"!px-3 !py-2"}`}>{inCart?<Check size={14}/>:<ShoppingCart size={14}/>} {(big||card)&&(available?(inCart?`Adicionar ${quantity} ${quantity===1?"unidade":"unidades"}`:"Adicionar ao carrinho"):"Limite atingido")}</button></div>;
}
