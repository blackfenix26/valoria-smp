"use client";
import Link from "next/link"; import { ShoppingCart } from "lucide-react"; import { useCart } from "./CartProvider";
export default function CartButton(){ const {cart} = useCart();
  const count = cart.reduce((sum,item)=>sum + Number(item.quantity || 1), 0);
  return <Link href="/carrinho" aria-label="Carrinho" className="relative"><ShoppingCart size={18}/><i className="absolute -right-2 -top-2 rounded-full bg-blue-600 px-1.5 text-[10px] font-bold not-italic text-white shadow-[0_0_16px_rgba(59,130,246,0.8)]">{count}</i></Link> }
