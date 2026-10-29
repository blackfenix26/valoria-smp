"use client"; import { useMemo, useState } from "react"; import { useRouter } from "next/navigation"; import { Trash2 } from "lucide-react"; import { cartItemKey, useCart } from "@/components/CartProvider";
export default function Carrinho(){
  const {cart,remove,clear,changeQty} = useCart(), r = useRouter(), [coupon,setCoupon] = useState(""), [appliedCoupon,setAppliedCoupon] = useState<{code:string;percent:number}|null>(null), [couponError,setCouponError] = useState(""), [couponBusy,setCouponBusy] = useState(false), [err,setErr] = useState(""), [busy,setBusy] = useState(false);
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity || 1), 0), [cart]);
  const discount = appliedCoupon?.percent ?? 0;
  const total = subtotal * (1 - discount / 100);
  const brl = (n:number)=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

  async function applyCoupon(e:React.FormEvent){
    e.preventDefault(); setCouponError(""); setAppliedCoupon(null);
    if(!coupon.trim()) return;
    setCouponBusy(true);
    try{
      const response=await fetch("/api/coupons/validate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:coupon})});
      const data=await response.json();
      if(!response.ok) setCouponError(data.error||"Cupom inválido.");
      else {setAppliedCoupon(data);setCoupon(data.code);}
    }catch{setCouponError("Não foi possível validar o cupom. Tente novamente.");}
    finally{setCouponBusy(false);}
  }

  async function finish(){
    setBusy(true); setErr("");
    const res = await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:cart.map(i=>({id:i.id,realmId:i.realmId,quantity:i.quantity||1})),coupon:appliedCoupon?.code,couponPercent:appliedCoupon?.percent})});
    if(res.status===401){ r.push("/login?next=/carrinho"); return }
    const d = await res.json(); setBusy(false); if(!res.ok) return setErr(d.error);
    clear(); r.push(`/cliente/pedidos?order=${d.id}`);
  }

  return <main className="mx-auto max-w-3xl px-4 py-10"><h1 className="mb-6 text-3xl font-bold">Carrinho</h1>
    {!cart.length ? <div className="glass p-8 text-center"><p className="text-mut">Seu carrinho está vazio.</p><a href="/produtos" className="btn-p mt-5 inline-flex">Explorar produtos</a></div> : <div className="space-y-3">
      {cart.map(i=><div key={cartItemKey(i)} className="flex items-center gap-3 rounded-xl border border-white/10 bg-card p-3">
        <img src={i.image} alt="" className="h-14 w-14 rounded-lg object-cover"/>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{i.name}</div>
          {i.realmName&&<div className="mt-1 text-xs text-mut">Destaque para o reino: {i.realmName}</div>}
          <div className="mt-1 flex items-center gap-2 text-xs text-mut">
            <button type="button" onClick={()=>changeQty(cartItemKey(i),(i.quantity||1)-1)} className="rounded bg-white/5 px-2 py-1">-</button>
            <span>{i.quantity || 1}</span>
            <button type="button" onClick={()=>changeQty(cartItemKey(i),(i.quantity||1)+1)} className="rounded bg-white/5 px-2 py-1">+</button>
          </div>
        </div>
        <b>{brl(Number(i.price) * Number(i.quantity || 1))}</b>
        <button aria-label="Remover" onClick={()=>remove(cartItemKey(i))} className="text-red-400"><Trash2 size={16}/></button>
      </div>)}
      <div className="rounded-2xl border border-white/10 bg-card p-4">
        <form onSubmit={applyCoupon} className="flex flex-wrap items-center gap-2"><label htmlFor="coupon-code" className="sr-only">Código do cupom</label><input id="coupon-code" value={coupon} onChange={e=>{setCoupon(e.target.value);setAppliedCoupon(null);setCouponError("")}} placeholder="Código do cupom" className="inp max-w-[220px]"/><button disabled={couponBusy||!coupon.trim()} className="btn-o !px-4 !py-2">{couponBusy?"Verificando…":appliedCoupon?"Aplicado":"Aplicar"}</button>{appliedCoupon&&<span role="status" className="text-xs text-emerald-300">Desconto de {discount}% aplicado</span>}</form>{couponError&&<p role="alert" className="mt-2 text-xs text-red-400">{couponError}</p>}
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
