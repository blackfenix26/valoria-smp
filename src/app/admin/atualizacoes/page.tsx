"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CalendarClock, FileText, LoaderCircle, Pencil, Plus, Send, Trash2 } from "lucide-react";

type Update = { id?: string; title: string; summary: string; content: string; image?: string | null; category: string; status: string; publishAt?: string };
const EMPTY: Update = { title: "", summary: "", content: "", image: "", category: "NOVIDADE", status: "DRAFT" };
const STATUS: Record<string, string> = { DRAFT: "Rascunho", PUBLISHED: "Publicado", SCHEDULED: "Agendado" };

export default function AdminUpdates() {
  const [list, setList] = useState<Update[]>([]);
  const [form, setForm] = useState<Update | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/updates");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar as atualizações.");
      if (!Array.isArray(data)) throw new Error("A resposta do servidor está em um formato inesperado.");
      setList(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar as atualizações.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function edit(update: Update) {
    setError("");
    setMessage("");
    setForm({ ...update, publishAt: update.publishAt ? new Date(update.publishAt).toISOString().slice(0, 16) : "" });
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form || saving) return;
    setError("");
    setMessage("");
    if (form.status === "SCHEDULED" && !form.publishAt) {
      setError("Defina a data e o horário para agendar esta atualização.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/admin/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar a atualização.");
      setForm(null);
      setMessage("Atualização salva.");
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar a atualização.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Excluir esta atualização?")) return;
    setDeleting(id);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/updates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível excluir a atualização.");
      setMessage("Atualização excluída.");
      await load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Não foi possível excluir a atualização.");
    } finally {
      setDeleting(null);
    }
  }

  return <main className="admin-updates">
    <header className="admin-page-heading mb-5 flex flex-wrap items-end justify-between gap-3">
      <div><p className="admin-eyebrow">Conteúdo do site</p><h1 className="mt-1 text-2xl font-black">Atualizações</h1><p className="mt-2 text-sm text-mut">Crie comunicados, publique novidades ou agende atualizações.</p></div>
      <div className="flex items-center gap-2"><button type="button" className="btn-o inline-flex min-h-10 items-center gap-2" onClick={()=>void load()} disabled={loading}><LoaderCircle size={15} className={loading?"animate-spin":""}/> Atualizar</button><button type="button" className="btn-p inline-flex min-h-10 items-center gap-2" onClick={()=>{setError("");setMessage("");setForm({...EMPTY});}}><Plus size={16}/> Nova atualização</button></div>
    </header>

    {error && <div role="alert" className="admin-error mb-4 flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300"><AlertCircle size={17} className="mt-0.5 shrink-0"/>{error}</div>}
    {message && <p role="status" className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-sm text-emerald-300">{message}</p>}

    {form && <form onSubmit={save} className="admin-editor mb-6 grid gap-4 rounded-2xl border border-blue-400/20 bg-card p-4 sm:p-5">
      <div className="flex items-center gap-3 border-b border-white/10 pb-3"><span className="grid h-10 w-10 place-items-center rounded-xl border border-blue-300/15 bg-blue-400/10 text-blue-200"><FileText size={18}/></span><div><p className="admin-eyebrow">{form.id ? "Editar publicação" : "Nova publicação"}</p><h2 className="mt-1 font-bold">{form.title || "Sem título"}</h2></div></div>
      <label className="space-y-1 text-xs text-mut">Título<input className="inp" placeholder="Título da atualização" value={form.title} onChange={event=>setForm({...form,title:event.target.value})} required maxLength={140}/></label>
      <label className="space-y-1 text-xs text-mut">Resumo curto<input className="inp" placeholder="Uma frase para apresentar a novidade" value={form.summary} onChange={event=>setForm({...form,summary:event.target.value})} required maxLength={250}/></label>
      <label className="space-y-1 text-xs text-mut">Conteúdo completo<textarea className="inp min-h-36" placeholder="Detalhes da atualização" value={form.content} onChange={event=>setForm({...form,content:event.target.value})} required/></label>
      <label className="space-y-1 text-xs text-mut">URL da imagem<input className="inp" type="url" placeholder="https://..." value={form.image??""} onChange={event=>setForm({...form,image:event.target.value})}/></label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-xs text-mut">Categoria<select className="inp" value={form.category} onChange={event=>setForm({...form,category:event.target.value})}>{["EVENTO","NOVIDADE","MANUTENCAO","LOJA","IMPORTANTE"].map(category=><option key={category} value={category}>{category}</option>)}</select></label>
        <label className="space-y-1 text-xs text-mut">Visibilidade<select className="inp" value={form.status} onChange={event=>setForm({...form,status:event.target.value})}><option value="DRAFT">Rascunho</option><option value="PUBLISHED">Publicado</option><option value="SCHEDULED">Agendado</option></select></label>
        <label className="space-y-1 text-xs text-mut"><span className="inline-flex items-center gap-1"><CalendarClock size={13}/> Data de publicação</span><input type="datetime-local" className="inp" value={form.publishAt??""} onChange={event=>setForm({...form,publishAt:event.target.value})}/></label>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-white/10 pt-3"><button disabled={saving} className="btn-p inline-flex min-h-10 items-center gap-2">{saving?<><LoaderCircle size={15} className="animate-spin"/> Salvando...</>:<><Send size={14}/> Salvar atualização</>}</button><button type="button" className="btn-o min-h-10" onClick={()=>setForm(null)} disabled={saving}>Cancelar</button></div>
    </form>}

    <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-sm font-bold">Publicações cadastradas</h2><span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-mut">{list.length} {list.length===1?"registro":"registros"}</span></div>
    <div className="space-y-2">
      {list.map(update=><article key={update.id} className="admin-update-row flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-card p-3 sm:p-4">
        {update.image ? <img src={update.image} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover"/> : <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-blue-300/10 bg-blue-400/5 text-blue-200"><FileText size={18}/></span>}
        <div className="min-w-[180px] flex-1"><h3 className="font-semibold">{update.title}</h3><p className="mt-1 truncate text-xs text-mut">{update.category} · {update.publishAt?new Date(update.publishAt).toLocaleString("pt-BR"):"Sem data"}</p></div>
        <span className={`admin-update-status admin-update-status-${update.status?.toLowerCase()} rounded-full px-2.5 py-1 text-[10px] font-bold`}>{STATUS[update.status]||update.status}</span>
        <div className="flex items-center gap-3"><button type="button" className="admin-action inline-flex items-center gap-1 text-blue-300" onClick={()=>edit(update)}><Pencil size={13}/> Editar</button><button type="button" disabled={deleting===update.id} className="admin-action inline-flex items-center gap-1 text-red-300" onClick={()=>update.id&&remove(update.id)}>{deleting===update.id?<LoaderCircle size={13} className="animate-spin"/>:<Trash2 size={13}/>} Excluir</button></div>
      </article>)}
      {!loading&&!list.length&&<div className="rounded-2xl border border-dashed border-white/15 p-10 text-center"><FileText size={22} className="mx-auto text-mut"/><p className="mt-3 font-semibold">{error?"Não foi possível exibir os registros":"Nenhuma atualização cadastrada"}</p><p className="mt-1 text-sm text-mut">Use “Nova atualização” para criar a primeira publicação.</p></div>}
      {loading&&<p className="rounded-2xl border border-white/10 p-8 text-center text-sm text-mut"><LoaderCircle size={16} className="mr-2 inline animate-spin"/> Carregando atualizações...</p>}
    </div>
  </main>;
}
