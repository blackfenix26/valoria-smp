"use client"; import { useEffect, useState } from "react"; import { useCart } from "@/components/CartProvider"; import ProductCard from "@/components/ProductCard";
export default function Favoritos(){
  const {favs} = useCart(), [list,setList] = useState<any[]>([]);
  useEffect(()=>{ if(!favs.length) return setList([]); fetch("/api/products?ids="+favs.join(",")).then(r=>r.json()).then(setList) },[favs]);
  return <><h1 className="mb-4 text-2xl font-bold">Favoritos</h1>{!list.length&&<p className="text-mut">Toque no coração de um produto para salvá-lo aqui.</p>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(p=><ProductCard key={p.id} p={p}/>)}</div></>;
}
