"use client";
import { useEffect, useState } from "react";

type Product = { id: string; name: string; price: number };
export default function DestaqueReinos() {
  const [products, setProducts] = useState<Product[]>([]), [productId, setProductId] = useState(""), [message, setMessage] = useState(""), [error, setError] = useState(""), [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/realm-feature").then(async response => {
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Não foi possível carregar produtos."); return; }
      setProducts(data.products); setProductId(data.productId);
    }).catch(() => setError("Não foi possível carregar produtos.")).finally(() => setLoading(false));
  }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setError(""); setMessage("");
    const response = await fetch("/api/admin/realm-feature", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Não foi possível salvar."); return; }
    setMessage("Produto de destaque salvo. Novas compras serão ativadas após aprovação do pagamento.");
  }
  return <main className="max-w-3xl"><h1 className="text-2xl font-bold">Destaque premium dos reinos</h1><p className="mt-2 text-sm text-mut">Selecione o produto da loja que representa a vitrine premium. Ao aprovar um pedido com esse produto, a página do reino cujo e-mail de líder corresponde ao comprador será destacada. O recurso altera apenas a apresentação no site, sem benefício de jogo.</p><form onSubmit={save} className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-card p-5"><label className="block text-sm">Produto de destaque<select value={productId} onChange={event=>setProductId(event.target.value)} disabled={loading} className="inp mt-2"><option value="">Desativado</option>{products.map(product=><option key={product.id} value={product.id}>{product.name} · {product.price.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</option>)}</select></label>{!loading&&!products.length&&<p className="text-sm text-amber-300">Cadastre e ative primeiro um produto para o destaque.</p>}{error&&<p role="alert" className="text-sm text-red-400">{error}</p>}{message&&<p role="status" className="text-sm text-emerald-300">{message}</p>}<button disabled={loading} className="btn-p">Salvar configuração</button></form></main>;
}