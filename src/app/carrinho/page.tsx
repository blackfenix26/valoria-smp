"use client"; import { useMemo, useState } from "react"; import { useRouter } from "next/navigation"; import { Trash2 } from "lucide-react"; import { useCart } from "@/components/CartProvider";
export default function Carrinho(){
  const {cart,remove,clear,changeQty} = useCart(), r = useRouter(), [coupon,setCoupon] = useState(""), [err,setErr] = useState(""), [busy,setBusy] = useState(false);
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity || 1), 0), [cart]);
  const discount = coupon ? 10 : 0;
  const total = subtotal * (1 - discount / 100);
  const brl = (n:number)=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

  async function finish(){
    setBusy(true); setErr("");
    const res = await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:cart.map(i=>({id:i.id,quantity:i.quantity||1})),coupon})});
    if(res.status===401){ r.push("/login?next=/carrinho"); return }
    const d = await res.json(); setBusy(false); if(!res.ok) return setErr(d.error);
    clear(); r.push(`/cliente/pedidos?order=${d.id}`);
  }

  return <main className="mx-auto max-w-3xl px-4 py-10"><h1 className="mb-6 text-3xl font-bold">Carrinho</h1>
    {!cart.length ? <p className="text-mut">Seu carrinho está vazio. Explore os produtos para começar.</p> : <div className="space-y-3">
      {cart.map(i=><div key={i.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-card p-3">
        <img src={i.image} alt="" className="h-14 w-14 rounded-lg object-cover"/>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{i.name}</div>
          <div className="mt-1 flex items-center gap-2 text-xs text-mut">
            <button type="button" onClick={()=>changeQty(i.id,(i.quantity||1)-1)} className="rounded bg-white/5 px-2 py-1">-</button>
            <span>{i.quantity || 1}</span>
            <button type="button" onClick={()=>changeQty(i.id,(i.quantity||1)+1)} className="rounded bg-white/5 px-2 py-1">+</button>
          </div>
        </div>
        <b>{brl(Number(i.price) * Number(i.quantity || 1))}</b>
        <button aria-label="Remover" onClick={()=>remove(i.id)} className="text-red-400"><Trash2 size={16}/></button>
      </div>)}
      <div className="rounded-2xl border border-white/10 bg-card p-4">
        <div className="flex gap-2"><input value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="Cupom" className="inp max-w-[200px]"/><span className="self-center text-xs text-mut">{coupon ? `Desconto: ${discount}%` : 'Sem cupom'}</span></div>
        <div className="mt-4 space-y-2 text-sm text-mut">
          <div className="flex justify-between"><span>Subtotal</span><b className="text-white">{brl(subtotal)}</b></div>
          <div className="flex justify-between"><span>Desconto</span><b className="text-white">-{brl(subtotal - total)}</b></div>
          <div className="flex justify-between text-lg font-bold text-white"><span>Total</span><span>{brl(total)}</span></div>
        </div>
      </div>
      {err&&<p role="alert" className="text-sm text-red-400">{err}</p>}
      <button disabled={busy} onClick={finish} className="btn-p w-full">{busy?"Enviando...":"Finalizar pedido"}</button>
    </div>}</main>;
}
