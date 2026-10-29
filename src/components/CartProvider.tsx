"use client";
import { createContext, useContext, useEffect, useState } from "react";
export type Item = { id: string; name: string; price: number; image: string; quantity?: number; realmId?: string; realmName?: string; cartKey?: string };
export const cartItemKey = (item: Item) => item.cartKey || `${item.id}::realm:${item.realmId || "none"}`;
type Ctx = { cart: Item[]; favs: string[]; add:(i:Item)=>void; remove:(key:string)=>void; clear:()=>void; toggleFav:(id:string)=>void; changeQty:(key:string, qty:number)=>void };
const C = createContext<Ctx>({cart:[],favs:[],add(){},remove(){},clear(){},toggleFav(){},changeQty(){}});
export const useCart = () => useContext(C);
export default function CartProvider({children}:{children:React.ReactNode}){
  const [cart,setCart] = useState<Item[]>([]), [favs,setFavs] = useState<string[]>([]), [ready,setReady] = useState(false);
  useEffect(()=>{ try{ const saved=JSON.parse(localStorage.getItem("cart")||"[]") as Item[]; setCart(saved.map(item=>({...item,cartKey:cartItemKey(item)}))); setFavs(JSON.parse(localStorage.getItem("favs")||"[]")) }catch{} setReady(true) },[]);
  useEffect(()=>{ if(!ready) return; try{ localStorage.setItem("cart",JSON.stringify(cart)); localStorage.setItem("favs",JSON.stringify(favs)); }catch{} },[cart,favs,ready]);
  return <C.Provider value={{cart,favs,
    add:i=>setCart(c=>{ const cartKey=cartItemKey(i), item = c.find(x=>cartItemKey(x)===cartKey); if(item){ return c.map(x=>cartItemKey(x)===cartKey?{...x,quantity:Math.max(1,(x.quantity||1)+1)}:x) } return [...c,{...i,cartKey,quantity:1}] }),
    remove:key=>setCart(c=>c.filter(x=>cartItemKey(x)!==key)), clear:()=>setCart([]),
    toggleFav:id=>setFavs(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id]),
    changeQty:(key,qty)=>setCart(c=>c.filter(x=>cartItemKey(x)!==key?true:Math.max(1,qty)>0).map(x=>cartItemKey(x)===key?{...x,quantity:Math.max(1,qty)}:x))}}>{children}</C.Provider>;
}
