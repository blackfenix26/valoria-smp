"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, LoaderCircle, RefreshCw, Save } from "lucide-react";
import type { StoreCategory } from "@/lib/store-category-order";

export default function CategoryOrderManager({ categories, initialOrder }: { categories: StoreCategory[]; initialOrder: StoreCategory[] }) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    setOrder(current => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setMessage("");
  }

  async function saveOrder() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/crud/setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "store_category_order", value: JSON.stringify(order.map(category => category.id)) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar a ordem.");
      setMessage("Ordem das linhas salva.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar a ordem.");
    } finally {
      setSaving(false);
    }
  }

  const knownIds = new Set(order.map(category => category.id));
  const completeOrder = [...order, ...categories.filter(category => !knownIds.has(category.id)).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))];

  return (
    <section className="mb-6 rounded-2xl border border-white/10 bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold">Ordem das linhas da loja</h2>
          <p className="mt-1 max-w-2xl text-sm text-mut">Organize as categorias exibidas no catálogo para celular. Categorias novas aparecem no final até serem reposicionadas.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-o inline-flex min-h-10 items-center gap-2" onClick={() => router.refresh()}>
            <RefreshCw size={15} /> Atualizar categorias
          </button>
          <button type="button" className="btn-p inline-flex min-h-10 items-center gap-2" onClick={saveOrder} disabled={saving}>
            {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
            Salvar ordem
          </button>
        </div>
      </div>

      {completeOrder.length ? (
        <ol className="mt-4 space-y-2">
          {completeOrder.map((category, index) => (
            <li key={category.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-300">{index + 1}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{category.name}</span>
              <button type="button" aria-label={`Mover ${category.name} para cima`} title="Mover para cima" onClick={() => move(index, -1)} disabled={index === 0} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 disabled:opacity-30"><ArrowUp size={16} /></button>
              <button type="button" aria-label={`Mover ${category.name} para baixo`} title="Mover para baixo" onClick={() => move(index, 1)} disabled={index === completeOrder.length - 1} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 disabled:opacity-30"><ArrowDown size={16} /></button>
            </li>
          ))}
        </ol>
      ) : <p className="mt-4 rounded-xl border border-dashed border-white/15 p-4 text-sm text-mut">Crie categorias abaixo para montar as linhas da loja.</p>}

      {message && <p role="status" className="mt-3 text-sm text-mut">{message}</p>}
    </section>
  );
}
