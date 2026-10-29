"use client";
import { useState } from "react";

export default function ReviewForm({ productId, server = false }: { productId?: string; server?: boolean }) {
  const [stars, setStars] = useState(5), [comment, setComment] = useState(""), [message, setMessage] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMessage("");
    const endpoint = server ? "/api/server-reviews" : "/api/reviews";
    const body = server ? { stars, comment } : { productId, stars, comment };
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    setMessage(response.ok ? "Avaliação enviada para moderação." : data.error || "Não foi possível enviar.");
    if (response.ok) setComment("");
  }
  return <form onSubmit={submit} className="mt-4 rounded-2xl border border-white/10 bg-card p-4"><label className="text-xs text-mut">Sua nota<select value={stars} onChange={e=>setStars(Number(e.target.value))} className="inp mt-1"><option value="5">5 - Excelente</option><option value="4">4 - Muito bom</option><option value="3">3 - Bom</option><option value="2">2 - Pode melhorar</option><option value="1">1 - Ruim</option></select></label><textarea required minLength={10} maxLength={500} value={comment} onChange={e=>setComment(e.target.value)} placeholder="Escreva sua experiência..." className="inp mt-3 min-h-24"/><div className="mt-3 flex items-center gap-3"><button className="btn-p">Enviar avaliação</button>{message&&<span className="text-xs text-mut">{message}</span>}</div></form>;
}
