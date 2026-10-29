"use client";
import { createContext, useContext, useEffect, useState } from "react";
export type Item = { id: string; name: string; price: number; image: string; quantity?: number; realmId?: string; realmName?: string; cartKey?: string };
export const cartItemKey = (item: Item) => item.cartKey || `${item.id}::realm:${item.realmId || "none"}`;
type Ctx = { cart: Item[]; favs: string[]; add:(i:Item, quantity?:number)=>void; remove:(key:string)=>void; clear:()=>void; toggleFav:(id:string)=>void; changeQty:(key:string, qty:number)=>void };
const C = createContext<Ctx>({cart:[],favs:[],add(){},remove(){},clear(){},toggleFav(){},changeQty(){}});
export const useCart = () => useContext(C);
export default function CartProvider({children}:{children:React.ReactNode}){
  const [cart,setCart] = useState<Item[]>([]), [favs,setFavs] = useState<string[]>([]), [ready,setReady] = useState(false);
  useEffect(()=>{ try{ const saved=JSON.parse(localStorage.getItem("cart")||"[]") as Item[]; setCart(saved.filter(item=>item&&typeof item.id==="string").map(item=>({...item,cartKey:cartItemKey(item),quantity:Math.min(99,Math.max(1,Math.floor(Number(item.quantity)||1)))}))); setFavs(JSON.parse(localStorage.getItem("favs")||"[]")) }catch{} setReady(true) },[]);
  useEffect(()=>{ if(!ready) return; try{ localStorage.setItem("cart",JSON.stringify(cart)); localStorage.setItem("favs",JSON.stringify(favs)); }catch{} },[cart,favs,ready]);
  return <C.Provider value={{cart,favs,
    add:(i,quantity=1)=>setCart(c=>{ const cartKey=cartItemKey(i), item = c.find(x=>cartItemKey(x)===cartKey), amount=Math.min(99,Math.max(1,Math.floor(Number(quantity)||1))); if(item){ return c.map(x=>cartItemKey(x)===cartKey?{...x,quantity:Math.min(99,Math.max(1,(x.quantity||1)+amount))}:x) } return [...c,{...i,cartKey,quantity:amount}] }),
    remove:key=>setCart(c=>c.filter(x=>cartItemKey(x)!==key)), clear:()=>setCart([]),
    toggleFav:id=>setFavs(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id]),
    changeQty:(key,qty)=>setCart(c=>c.map(x=>cartItemKey(x)===key?{...x,quantity:Math.min(99,Math.max(1,Math.floor(Number(qty)||1)))}:x))}}>{children}</C.Provider>;
}
