"use client";
import { createContext, useContext, useEffect, useState } from "react";
export type Item = { id: string; name: string; price: number; image: string; quantity?: number };
type Ctx = { cart: Item[]; favs: string[]; add:(i:Item)=>void; remove:(id:string)=>void; clear:()=>void; toggleFav:(id:string)=>void; changeQty:(id:string, qty:number)=>void };
const C = createContext<Ctx>({cart:[],favs:[],add(){},remove(){},clear(){},toggleFav(){},changeQty(){}});
export const useCart = () => useContext(C);
export default function CartProvider({children}:{children:React.ReactNode}){
  const [cart,setCart] = useState<Item[]>([]), [favs,setFavs] = useState<string[]>([]), [ready,setReady] = useState(false);
  useEffect(()=>{ try{ setCart(JSON.parse(localStorage.getItem("cart")||"[]")); setFavs(JSON.parse(localStorage.getItem("favs")||"[]")) }catch{} setReady(true) },[]);
  useEffect(()=>{ if(!ready) return; try{ localStorage.setItem("cart",JSON.stringify(cart)); localStorage.setItem("favs",JSON.stringify(favs)); }catch{} },[cart,favs,ready]);
  return <C.Provider value={{cart,favs,
    add:i=>setCart(c=>{ const item = c.find(x=>x.id===i.id); if(item){ return c.map(x=>x.id===i.id?{...x,quantity:Math.max(1,(x.quantity||1)+1)}:x) } return [...c,{...i,quantity:1}] }),
    remove:id=>setCart(c=>c.filter(x=>x.id!==id)), clear:()=>setCart([]),
    toggleFav:id=>setFavs(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id]),
    changeQty:(id,qty)=>setCart(c=>c.filter(x=>x.id!==id?true:Math.max(1,qty)>0).map(x=>x.id===id?{...x,quantity:Math.max(1,qty)}:x))}}>{children}</C.Provider>;
}
