"use client";
import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle, Plus, Trash2 } from "lucide-react";
type Suggestion = { id: string; title: string; description: string; priority: string; status: string; createdAt: string; author: { name: string } };
const statusLabels: Record<string, string> = { OPEN: "Aberta", REVIEW: "Em análise", PLANNED: "Planejada", DONE: "Concluída", ARCHIVED: "Arquivada" };
const priorityLabels: Record<string, string> = { LOW: "Baixa", NORMAL: "Normal", HIGH: "Alta", URGENT: "Urgente" };
export default function Sugestoes() {
  const [items, setItems] = useState<Suggestion[]>([]), [form, setForm] = useState({ title: "", description: "", priority: "NORMAL", status: "OPEN" }), [editing, setEditing] = useState<string | null>(null), [filter, setFilter] = useState(""), [message, setMessage] = useState(""), [error, setError] = useState(""), [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [deleting, setDeleting] = useState<string | null>(null);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/sugestoes");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar as sugestões.");
      if (!Array.isArray(data)) throw new Error("A resposta do servidor está em um formato inesperado.");
      setItems(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar as sugestões.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void load(); }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setMessage("");
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/admin/sugestoes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing ? { ...form, id: editing } : form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar.");
      setForm({ title: "", description: "", priority: "NORMAL", status: "OPEN" });
      setEditing(null);
      setMessage("Sugestão salva.");
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }
  async function remove(id: string) {
    if (!confirm("Excluir esta sugestão?")) return;
    setDeleting(id);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/admin/sugestoes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível excluir.");
      setMessage("Sugestão excluída.");
      await load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Não foi possível excluir.");
    } finally {
      setDeleting(null);
    }
  }
  const visible = items.filter(item => !filter || item.status === filter);
  return <div>
    <header className="admin-page-heading mb-5 flex flex-wrap items-end justify-between gap-3">
      <div><p className="admin-eyebrow">Organização interna</p><h1 className="mt-1 text-2xl font-black">Sugestões da equipe</h1><p className="mt-2 text-sm text-mut">Registre ideias e acompanhe sua execução em um só lugar.</p></div>
      <label className="space-y-1 text-xs text-mut">Filtrar por status<select aria-label="Filtrar sugestões por status" value={filter} onChange={e=>setFilter(e.target.value)} className="inp w-auto min-w-48"><option value="">Todos os status</option>{Object.entries(statusLabels).map(([value, label])=><option key={value} value={value}>{label}</option>)}</select></label>
    </header>
    {error&&<div role="alert" className="admin-error mb-4 flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300"><AlertCircle size={17} className="mt-0.5 shrink-0"/>{error}</div>}
    {message&&<p role="status" className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-sm text-emerald-300">{message}</p>}
    <form onSubmit={save} className="admin-editor grid gap-3 rounded-2xl border border-white/10 bg-card p-4 sm:p-5 md:grid-cols-2">
      <div className="md:col-span-2"><p className="admin-eyebrow">{editing ? "Editando sugestão" : "Nova sugestão"}</p><p className="mt-1 text-xs text-mut">Deixe o problema e a próxima ação claros para a equipe.</p></div>
      <label className="space-y-1 text-xs text-mut">Título<input required maxLength={140} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Título da melhoria" className="inp"/></label>
      <label className="space-y-1 text-xs text-mut">Prioridade<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} className="inp"><option value="LOW">Baixa</option><option value="NORMAL">Normal</option><option value="HIGH">Alta</option><option value="URGENT">Urgente</option></select></label>
      <label className="space-y-1 text-xs text-mut md:col-span-2">Descrição<textarea required maxLength={5000} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Descreva a melhoria, problema ou ideia..." className="inp min-h-24"/></label>
      <label className="space-y-1 text-xs text-mut">Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="inp">{Object.entries(statusLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
      <div className="flex flex-wrap items-end gap-2"><button disabled={saving} className="btn-p inline-flex min-h-10 items-center gap-2">{saving?<><LoaderCircle size={15} className="animate-spin"/> Salvando...</>:<><Plus size={15}/>{editing ? "Salvar alteração" : "Adicionar sugestão"}</>}</button>{editing&&<button type="button" onClick={()=>{setEditing(null);setForm({title:"",description:"",priority:"NORMAL",status:"OPEN"})}} className="btn-o min-h-10" disabled={saving}>Cancelar</button>}</div>
    </form>
    <div className="mb-3 mt-6 flex items-center justify-between gap-3"><h2 className="text-sm font-bold">Fila de melhorias</h2><span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-mut">{loading?"Carregando…":`${visible.length} de ${items.length}`}</span></div>
    {loading&&!items.length&&<p className="rounded-2xl border border-white/10 bg-card p-8 text-center text-sm text-mut"><LoaderCircle size={16} className="mr-2 inline animate-spin"/>Carregando sugestões…</p>}
    <div className="space-y-3">{visible.map(item=><article key={item.id} className="admin-update-row rounded-2xl border border-white/10 bg-card p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><h2 className="font-bold text-white">{item.title}</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-mut">{item.description}</p></div><div className="flex gap-2 text-[10px]"><span className="admin-value-badge admin-value-muted">{statusLabels[item.status]||item.status}</span><span className={`admin-value-badge ${item.priority==="URGENT"?"admin-value-negative":item.priority==="HIGH"?"admin-value-warning":"admin-value-muted"}`}>{priorityLabels[item.priority]||item.priority}</span></div></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs text-mut"><span>Por {item.author?.name||"Administrador"} · {new Date(item.createdAt).toLocaleDateString("pt-BR")}</span><div className="flex gap-4"><button type="button" onClick={()=>{setEditing(item.id);setForm({title:item.title,description:item.description,priority:item.priority,status:item.status})}} className="font-semibold text-blue-300">Editar</button><button type="button" disabled={deleting===item.id} onClick={()=>void remove(item.id)} className="inline-flex items-center gap-1 font-semibold text-red-300 disabled:opacity-50">{deleting===item.id?<LoaderCircle size={13} className="animate-spin"/>:<Trash2 size={13}/>}Excluir</button></div></div></article>)}</div>
    {!loading&&!visible.length&&<p className="rounded-2xl border border-dashed border-white/20 p-8 text-center text-sm text-mut">{items.length?"Nenhuma sugestão corresponde ao filtro.":"Nenhuma sugestão cadastrada ainda."}</p>}
  </div>;
}
