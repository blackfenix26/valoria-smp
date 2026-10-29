"use client"; import { useEffect, useState } from "react"; import { useCart } from "@/components/CartProvider"; import ProductCard from "@/components/ProductCard";
export default function Favoritos(){
  const {favs} = useCart(), [list,setList] = useState<any[]>([]);
  useEffect(()=>{ if(!favs.length) return setList([]); fetch("/api/products?ids="+favs.join(",")).then(r=>r.json()).then(setList) },[favs]);
  return <><h1 className="mb-4 text-2xl font-bold">Favoritos</h1>{!list.length&&<div className="glass p-8 text-center"><p className="text-mut">Você ainda não salvou produtos.</p><a href="/produtos" className="btn-p mt-5 inline-flex">Explorar produtos</a></div>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(p=><ProductCard key={p.id} p={p}/>)}</div></>;
}
