"use client";
import { Heart } from "lucide-react";
import { useCart } from "@/components/CartProvider";

export default function FavoriteButton({ productId }: { productId: string }) {
  const { favs, toggleFav } = useCart();
  const favorite = favs.includes(productId);
  return <button type="button" aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"} aria-pressed={favorite} title={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"} onClick={() => toggleFav(productId)} className="absolute right-3 top-3 z-20 rounded-lg border border-white/10 bg-black/60 p-2 text-white backdrop-blur transition hover:scale-105 hover:bg-black/80"><Heart size={14} className={favorite ? "fill-red-500 text-red-500" : ""}/></button>;
}
