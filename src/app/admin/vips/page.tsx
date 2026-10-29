"use client";
import { useEffect, useState } from "react";

type Benefit = { title: string; detail: string };
type Product = { id: string; name: string; description: string; price: number; promoPrice: number | null; featured: boolean; vipOrder: number; vipBenefits: string | null; category: { name: string } };

function parseBenefits(description: string): Benefit[] {
  const marks = [...description.matchAll(/[\p{Extended_Pictographic}]/gu)];
  return marks.map((mark, index) => {
    const content = description.slice((mark.index || 0) + mark[0].length, marks[index + 1]?.index ?? description.length).trim();
    const [title, ...detail] = content.split(/\s+[—·:]\s+/);
    return { title: title.trim() || content, detail: detail.join(" · ").trim() };
  }).filter(item => item.title);
}

export default function OrganizarVips() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredId, setFeaturedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/crud/product");
      const rows = await response.json() as Product[];
      if (!response.ok) throw new Error("Não foi possível carregar os produtos.");
      if (!Array.isArray(rows)) throw new Error("A resposta do servidor está em um formato inesperado.");
      const combos = rows.filter(row => row.category?.name.toLowerCase().includes("combo"))
        .map(row => ({ ...row, vipOrder: row.vipOrder || 0 }))
        .sort((a, b) => a.vipOrder - b.vipOrder || a.name.localeCompare(b.name));
      setProducts(combos);
      setFeaturedId(combos.find(product => product.featured)?.id || "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar os produtos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function benefits(product: Product): Benefit[] {
    try { const parsed = JSON.parse(product.vipBenefits || ""); if (Array.isArray(parsed)) return parsed; } catch {}
    return parseBenefits(product.description);
  }

  function updateBenefit(product: Product, index: number, patch: Partial<Benefit>) {
    const next = benefits(product).map((benefit, itemIndex) => itemIndex === index ? { ...benefit, ...patch } : benefit);
    setProducts(current => current.map(item => item.id === product.id ? { ...item, vipBenefits: JSON.stringify(next) } : item));
  }

  function move(index: number, direction: number) {
    const target = index + direction;
    if (target < 0 || target >= products.length) return;
    const next = [...products];
    [next[index], next[target]] = [next[target], next[index]];
    setProducts(next.map((product, itemIndex) => ({ ...product, vipOrder: itemIndex + 1 })));
  }

  async function save() {
    setError(""); setMessage(""); setBusy(true);
    try {
      for (const [index, product] of products.entries()) {
        const response = await fetch("/api/admin/crud/product", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: product.id, vipOrder: index + 1, vipBenefits: product.vipBenefits, featured: product.id === featuredId }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Falha ao salvar ${product.name}.`);
      }
      setMessage("Ordem, destaque e benefícios dos VIPs salvos.");
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar a organização dos VIPs.");
    } finally {
      setBusy(false);
    }
  }

  return <main>
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-bold">Organizar VIPs</h1><p className="mt-2 max-w-2xl text-sm text-mut">Ordene os combos, escolha um único destaque e revise os benefícios da comparação pública.</p></div><button disabled={busy} onClick={save} className="btn-p">{busy ? "Salvando…" : "Salvar organização"}</button></header>
    {error && <p role="alert" className="mb-4 text-sm text-red-400">{error}</p>}{message && <p role="status" className="mb-4 text-sm text-emerald-300">{message}</p>}
    <div className="mb-5 flex flex-wrap gap-3 text-sm"><span className="rounded-lg border border-white/10 px-3 py-2">{products.length} combos listados</span><span className="rounded-lg border border-white/10 px-3 py-2">{featuredId ? 1 : 0} em destaque</span><button type="button" onClick={() => setFeaturedId("")} className="rounded-lg border border-white/10 px-3 py-2 text-mut hover:text-white">Remover destaque</button></div>
    <div className="space-y-4">{products.map((product, index) => <article key={product.id} className="rounded-2xl border border-white/10 bg-card p-5"><div className="flex flex-wrap items-start gap-4"><div className="flex flex-col gap-2"><button disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Mover ${product.name} para cima`} className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-30">↑</button><button disabled={index === products.length - 1} onClick={() => move(index, 1)} aria-label={`Mover ${product.name} para baixo`} className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-30">↓</button></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold">{product.name}</h2><span className="text-xs text-mut">{product.category.name} · R$ {(product.promoPrice ?? product.price).toFixed(2).replace(".", ",")}</span></div><p className="mt-2 text-xs text-mut">Posição {index + 1} · {benefits(product).length} benefícios</p></div><label className="flex items-center gap-2 text-sm"><input type="radio" name="featured-vip" checked={featuredId === product.id} onChange={() => setFeaturedId(product.id)} /> Destaque da comparação</label></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{benefits(product).map((benefit, benefitIndex) => <div key={`${benefit.title}-${benefitIndex}`} className="grid gap-2 rounded-xl border border-white/10 p-3"><input value={benefit.title} onChange={event => updateBenefit(product, benefitIndex, { title: event.target.value })} aria-label={`Título do benefício ${benefitIndex + 1}`} className="inp"/><input value={benefit.detail} onChange={event => updateBenefit(product, benefitIndex, { detail: event.target.value })} aria-label={`Descrição do benefício ${benefitIndex + 1}`} className="inp"/><button type="button" onClick={() => setProducts(current => current.map(item => item.id === product.id ? { ...item, vipBenefits: JSON.stringify(benefits(product).filter((_, itemIndex) => itemIndex !== benefitIndex)) } : item))} className="justify-self-start text-xs text-red-300">Remover benefício</button></div>)}</div><div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={() => setProducts(current => current.map(item => item.id === product.id ? { ...item, vipBenefits: JSON.stringify([...benefits(product), { title: "Novo benefício", detail: "" }]) } : item))} className="btn-o !px-3 !py-2 text-xs">+ Adicionar benefício</button><details className="text-xs text-mut"><summary className="cursor-pointer py-2">Descrição original</summary><p className="mt-2 whitespace-pre-line">{product.description}</p></details></div></article>)}</div>
    {loading && <p className="rounded-xl border border-white/10 bg-card p-8 text-center text-sm text-mut">Carregando combos…</p>}
    {!loading && !products.length && <p className="rounded-xl border border-dashed border-white/20 p-8 text-center text-sm text-mut">Nenhum combo ativo foi encontrado.</p>}
  </main>;
}
