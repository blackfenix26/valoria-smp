"use client";
import Link from "next/link"; import { ShoppingCart } from "lucide-react"; import { useCart } from "./CartProvider";
export default function CartButton(){ const {cart} = useCart();
  const count = cart.reduce((sum,item)=>sum + Number(item.quantity || 1), 0);
  return <Link href="/carrinho" aria-label={`Carrinho, ${count} itens`} className="relative grid h-11 min-w-11 place-items-center rounded-xl transition hover:bg-white/10"><ShoppingCart size={19}/><i className="absolute right-0.5 top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[10px] font-bold not-italic text-black">{count}</i></Link> }
