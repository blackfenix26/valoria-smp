"use client";
import { useEffect, useState } from "react";

export default function Patrocinadores() {
  const [items, setItems] = useState<[string, string][]>([]), [message, setMessage] = useState(""), [error, setError] = useState("");
  useEffect(() => { fetch("/api/admin/site-content").then(async (r) => { const data = await r.json(); if (r.ok) setItems(JSON.parse(data.partners)); else setError(data.error); }); }, []);
  function add() { setItems([...items, ["", ""]]); setMessage(""); }
  function update(index: number, field: 0 | 1, value: string) { setItems(items.map((item, itemIndex) => itemIndex === index ? (field === 0 ? [value, item[1]] : [item[0], value]) : item)); }
  function remove(index: number) { setItems(items.filter((_, itemIndex) => itemIndex !== index)); }
  async function save() {
    setMessage(""); setError("");
    if (items.some(([name, description]) => !name.trim() || !description.trim())) { setError("Preencha o nome e a descrição de todos os patrocinadores."); return; }
    const r = await fetch("/api/admin/site-content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ partners: JSON.stringify(items) }) });
    const data = await r.json(); if (!r.ok) return setError(data.error || "Não foi possível salvar."); setMessage("Patrocinadores salvos.");
  }
  return <div><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">Patrocinadores</h1><p className="mt-2 text-sm text-mut">Adicione e edite os parceiros exibidos no site.</p></div><button onClick={add} className="btn-p">+ Adicionar patrocinador</button></div><div className="mt-6 space-y-3">{items.map(([name, description], index) => <div key={index} className="grid gap-3 rounded-2xl border border-white/10 bg-card p-4 md:grid-cols-[1fr_1.5fr_auto]"><input value={name} onChange={e=>update(index, 0, e.target.value)} placeholder="Nome do patrocinador" className="inp"/><input value={description} onChange={e=>update(index, 1, e.target.value)} placeholder="Descrição ou categoria" className="inp"/><button onClick={()=>remove(index)} className="rounded-xl border border-red-400/40 px-3 py-2 text-sm text-red-300 hover:bg-red-400/10">Remover</button></div>)}{!items.length&&<div className="rounded-2xl border border-dashed border-white/20 p-8 text-center text-sm text-mut">Nenhum patrocinador cadastrado.</div>}</div>{error&&<p className="mt-3 text-sm text-red-400">{error}</p>}{message&&<p className="mt-3 text-sm text-emerald-300">{message}</p>}<button onClick={save} className="btn-p mt-5">Salvar patrocinadores</button></div>;
}
