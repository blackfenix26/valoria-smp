"use client"; import Link from "next/link"; import { useMemo, useState } from "react"; import { useRouter } from "next/navigation"; import { ArrowLeft, LockKeyhole, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"; import { cartItemKey, useCart } from "@/components/CartProvider";
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
    try {
      const res = await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:cart.map(i=>({id:i.id,realmId:i.realmId,quantity:i.quantity||1})),coupon:appliedCoupon?.code,couponPercent:appliedCoupon?.percent})});
      const d = await res.json();
      if(res.status===401){ r.push("/login?next=/carrinho"); return }
      if(!res.ok) return setErr(d.error || "Não foi possível criar o pedido.");
      clear(); r.push(`/cliente/pedidos?order=${d.id}`);
    } catch {
      setErr("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="cart-page mx-auto w-full max-w-6xl px-4 py-8 sm:py-12 lg:px-6">
    <div className="mb-7"><Link href="/produtos" className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-mut transition hover:text-white"><ArrowLeft size={14}/> Continuar comprando</Link><span className="section-kicker block">Sua seleção</span><h1 className="mt-2 text-3xl font-black sm:text-4xl">Carrinho</h1><p className="mt-2 text-sm text-mut">{cart.length ? `${cart.length} ${cart.length === 1 ? "produto" : "produtos"} aguardando por você` : "Confira sua seleção antes de finalizar."}</p></div>
    {!cart.length ? <div className="cart-empty glass rounded-[28px] p-8 text-center sm:p-12"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-blue-300/15 bg-blue-400/10 text-blue-200"><ShoppingBag size={26}/></span><h2 className="mt-5 text-xl font-bold">Seu carrinho está vazio</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-mut">Explore a loja e encontre itens para sua próxima jornada em Valoria.</p><Link href="/produtos" className="btn-p mt-6 inline-flex min-h-11 items-center">Explorar produtos</Link></div> : <div className="grid items-start gap-5 lg:grid-cols-[1fr_360px]">
      <section className="space-y-3">
        {cart.map(i=><article key={cartItemKey(i)} className="cart-item flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-card p-3 sm:gap-4 sm:p-4">
          <Link href={`/produtos/${i.id}`} className="cart-item-image h-16 w-16 shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-20"><img src={i.image} alt={i.name} className="h-full w-full object-contain p-1"/></Link>
          <div className="min-w-0 flex-1">
            <Link href={`/produtos/${i.id}`} className="line-clamp-2 text-sm font-bold transition hover:text-blue-200 sm:text-base">{i.name}</Link>
            {i.realmName&&<div className="mt-1 truncate text-xs text-mut">Destaque para {i.realmName}</div>}
            <div className="mt-3 inline-flex items-center gap-3 rounded-lg border border-white/10 bg-black/10 p-1">
              <button type="button" aria-label={`Diminuir quantidade de ${i.name}`} onClick={()=>changeQty(cartItemKey(i),(i.quantity||1)-1)} className="grid h-7 w-7 place-items-center rounded-md transition hover:bg-white/10"><Minus size={13}/></button>
              <span className="min-w-4 text-center text-xs font-bold tabular-nums">{i.quantity || 1}</span>
              <button type="button" aria-label={`Aumentar quantidade de ${i.name}`} onClick={()=>changeQty(cartItemKey(i),(i.quantity||1)+1)} className="grid h-7 w-7 place-items-center rounded-md transition hover:bg-white/10"><Plus size={13}/></button>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2"><b className="text-sm tabular-nums sm:text-base">{brl(Number(i.price) * Number(i.quantity || 1))}</b><button aria-label={`Remover ${i.name}`} onClick={()=>remove(cartItemKey(i))} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-mut transition hover:bg-red-400/10 hover:text-red-300"><Trash2 size={13}/> Remover</button></div>
        </article>)}
      </section>
      <aside className="cart-summary rounded-2xl border border-white/10 bg-card p-5 sm:p-6">
        <h2 className="text-base font-bold">Resumo do pedido</h2>
        <form onSubmit={applyCoupon} className="mt-4">
          <label htmlFor="coupon-code" className="mb-2 block text-xs font-semibold text-white/75">Cupom de desconto</label>
          <div className="flex gap-2"><input id="coupon-code" value={coupon} onChange={e=>{setCoupon(e.target.value);setAppliedCoupon(null);setCouponError("")}} placeholder="Digite seu cupom" className="inp min-w-0"/><button disabled={couponBusy||!coupon.trim()} className="btn-o !px-3 !py-2">{couponBusy?"...":appliedCoupon?"OK":"Aplicar"}</button></div>
          {appliedCoupon&&<p role="status" className="mt-2 text-xs text-emerald-300">Desconto de {discount}% aplicado</p>}
          {couponError&&<p role="alert" className="mt-2 text-xs text-red-400">{couponError}</p>}
        </form>
        <div className="cart-totals mt-5 space-y-3 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between text-mut"><span>Subtotal</span><span className="text-white">{brl(subtotal)}</span></div>
          <div className="flex justify-between text-mut"><span>Desconto</span><span className="text-emerald-300">-{brl(subtotal-total)}</span></div>
          <div className="flex justify-between border-t border-white/10 pt-3 text-base font-black"><span>Total</span><span>{brl(total)}</span></div>
        </div>
        {err&&<p role="alert" className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-300">{err}</p>}
        <button disabled={busy} onClick={finish} className="btn-p mt-5 flex min-h-12 w-full items-center justify-center">{busy?"Preparando pedido...":"Finalizar pedido"}</button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-mut"><LockKeyhole size={12}/> Pagamento via PIX após confirmação do pedido</p>
      </aside>
    </div>}</main>;
}
