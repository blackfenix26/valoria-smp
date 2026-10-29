"use client"; import { useEffect, useRef, useState } from "react";
import { AlertCircle, Check, LoaderCircle, Plus, Search, X } from "lucide-react";
export type Fld = { key:string; label:string; type:"text"|"textarea"|"number"|"bool"|"date"|"select"|"image"|"color"; options?:[string,string][] };
export type Filter = { key:string; label:string; options:[string,string][] };
export type QuickAction = { label:string; value:string; className?:string; confirm?:string; whenStatuses?:string[] };
const get = (o:any,k:string)=>k.split(".").reduce((a:any,p)=>a?.[p],o);
const STATUS_LABELS:Record<string,string> = {PENDING:"Pendente",APPROVED:"Aprovado",PROCESSING:"Em andamento",COMPLETED:"Concluído",CANCELED:"Cancelado",OPEN:"Aberto",IN_PROGRESS:"Em atendimento",RESOLVED:"Resolvido",CLOSED:"Fechado",REVIEW:"Em análise",ACCEPTED:"Aceita",REJECTED:"Rejeitada",PLANNED:"Planejada",DONE:"Concluída",ARCHIVED:"Arquivada",ADMIN:"Administrador",USER:"Usuário"};
const show = (v:any)=>typeof v==="boolean"?(v?"Sim":"Não"):typeof v==="string"&&/^\d{4}-\d\d-\d\dT/.test(v)?new Date(v).toLocaleString("pt-BR"):(v??"—");
export default function CrudManager({model,title,fields,columns,canCreate=true,canDelete=true,idKey="id",hint,filters=[],quickActions=[],createLabel="Novo"}:{model:string;title:string;fields:Fld[];columns:{key:string;label:string}[];canCreate?:boolean;canDelete?:boolean;idKey?:string;hint?:string;filters?:Filter[];quickActions?:QuickAction[];createLabel?:string}){
  const searchRef = useRef<HTMLInputElement>(null);
  const [rows,setRows] = useState<any[]>([]), [f,setF] = useState<any|null>(null), [err,setErr] = useState(""), [q,setQ] = useState(""), [filterValues,setFilterValues] = useState<Record<string,string>>({}), [busy,setBusy] = useState<string|null>(null), [loading,setLoading] = useState(true), [saving,setSaving] = useState(false), url = `/api/admin/crud/${model}`;
  const load = async()=>{ setLoading(true); setErr(""); try { const r = await fetch(url); const data = await r.json(); if(!r.ok) throw new Error(data.error||"Não foi possível carregar os dados."); if(!Array.isArray(data)) throw new Error("A resposta do servidor está em um formato inesperado."); setRows(data); } catch(error) { setErr(error instanceof Error?error.message:"Não foi possível carregar os dados."); } finally { setLoading(false); } };
  useEffect(()=>{ void load() },[]);
  useEffect(()=>{
    const handleShortcut = (event:KeyboardEvent)=>{
      const target = event.target as HTMLElement | null;
      const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target?.isContentEditable;
      if(event.key==="/"&&!isTyping){event.preventDefault();searchRef.current?.focus()}
      if(event.key==="Escape"&&document.activeElement===searchRef.current){setQ("");searchRef.current?.blur()}
    };
    window.addEventListener("keydown",handleShortcut);
    return ()=>window.removeEventListener("keydown",handleShortcut);
  },[]);
  const blank = ()=>setF(Object.fromEntries(fields.map(x=>[x.key,x.type==="bool"?x.key==="active":x.type==="select"?x.options?.[0]?.[0]??"":x.type==="color"?"#64748b":""])));
  const edit = (r:any)=>{ const o = {...r}; fields.forEach(x=>{ if(x.type==="date"&&o[x.key]) o[x.key] = new Date(o[x.key]).toISOString().slice(0,16) }); setF(o) };
  async function save(e:React.FormEvent){ e.preventDefault(); if(saving)return; setErr(""); setSaving(true); try { const r = await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(f)}); const data = await r.json(); if(!r.ok) throw new Error(data.error||"Erro ao salvar."); setF(null); await load(); } catch(error) { setErr(error instanceof Error?error.message:"Erro ao salvar."); } finally { setSaving(false); } }
  async function quickUpdate(row:any, action:QuickAction){
    if(action.confirm && !confirm(action.confirm)) return;
    setBusy(`${row[idKey]}:${action.value}`);
    try { const r = await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:row[idKey],status:action.value})}); const data = await r.json(); if(!r.ok) throw new Error(data.error||"Erro ao atualizar."); await load(); }
    catch(error) { setErr(error instanceof Error?error.message:"Erro ao atualizar."); }
    finally { setBusy(null); }
  }
  async function del(r:any){ if(!confirm("Excluir este item?")) return; setBusy(`delete:${r[idKey]}`); setErr(""); try { const x = await fetch(url,{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({[idKey]:r[idKey]})}); const data = await x.json(); if(!x.ok) throw new Error(data.error||"Não foi possível excluir."); await load(); } catch(error) { setErr(error instanceof Error?error.message:"Não foi possível excluir."); } finally { setBusy(null); } }
  async function up(k:string,file?:File){ if(!file) return; setErr(""); try { const fd = new FormData(); fd.append("file",file); const r = await fetch("/api/admin/upload",{method:"POST",body:fd}), d = await r.json(); if(!r.ok) throw new Error(d.error||"Não foi possível enviar a imagem."); setF((p:any)=>({...p,[k]:d.url})); } catch(error) { setErr(error instanceof Error?error.message:"Não foi possível enviar a imagem."); } }
  const list = rows.filter(r=>JSON.stringify(columns.map(column=>get(r,column.key))).toLowerCase().includes(q.trim().toLowerCase()) && filters.every(filter=>!filterValues[filter.key]||String(get(r,filter.key))===filterValues[filter.key]));
  const hasFilters = !!q || Object.values(filterValues).some(Boolean);
  const clearFilters = ()=>{setQ("");setFilterValues({});};
  const cellContent = (row:any,column:{key:string;label:string})=>{
    const value = get(row,column.key);
    if(value===null||value===undefined||value==="") return <span className="text-white/35">—</span>;
    if(typeof value==="boolean") return <span className={`admin-value-badge ${value?"admin-value-positive":"admin-value-muted"}`}>{value?"Sim":"Não"}</span>;
    if(column.key==="status"||column.key==="role"){
      const label = filters.flatMap(filter=>filter.options).find(([option])=>option===String(value))?.[1]||STATUS_LABELS[String(value)]||String(value);
      const tone = ["APPROVED","COMPLETED","RESOLVED","ACCEPTED","DONE"].includes(String(value))?"admin-value-positive":["PENDING","OPEN","IN_PROGRESS","REVIEW","PROCESSING","PLANNED"].includes(String(value))?"admin-value-warning":["CANCELED","CLOSED","REJECTED","ARCHIVED"].includes(String(value))?"admin-value-negative":"admin-value-muted";
      return <span className={`admin-value-badge ${tone}`}>{label}</span>;
    }
    if(["price","promoPrice","total","credits"].includes(column.key)&&typeof value==="number") return value.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
    return show(value);
  };
  return <div className="admin-crud">
    <header className="admin-page-heading mb-5 flex flex-wrap items-end gap-3">
      <div className="min-w-[220px] flex-1"><p className="admin-eyebrow">Gerenciamento</p><h1 className="mt-1 text-2xl font-black">{title}</h1>{hint&&<p className="mt-2 max-w-3xl text-sm leading-6 text-mut">{hint}</p>}</div>
      <div className="flex flex-wrap items-center gap-2">
        {canCreate&&<button className="btn-p inline-flex min-h-10 items-center gap-2" onClick={blank}><Plus size={16}/> {createLabel}</button>}
        <button type="button" className="btn-o inline-flex min-h-10 items-center gap-2" onClick={()=>void load()} disabled={loading}><LoaderCircle size={15} className={loading?"animate-spin":""}/> Atualizar</button>
      </div>
    </header>
    {err&&<div role="alert" className="admin-error mb-4 flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300"><AlertCircle size={17} className="mt-0.5 shrink-0"/><p>{err}</p></div>}
    <div className="admin-crud-toolbar mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
      <label className="admin-search relative min-w-[190px] flex-1">
        <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mut"/>
        <input ref={searchRef} aria-label={`Buscar em ${title}`} value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar registros...  ( / )" className="inp min-h-10 pl-9"/>
      </label>
      {filters.length>1&&filters.map(filter=><select aria-label={`Filtrar por ${filter.label}`} key={filter.key} value={filterValues[filter.key]??""} onChange={e=>setFilterValues({...filterValues,[filter.key]:e.target.value})} className="inp min-h-10 w-auto min-w-[145px]"><option value="">{filter.label}: todos</option>{filter.options.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>)}
      <span className="rounded-lg bg-surf px-3 py-2 text-xs text-mut">{loading?"Carregando…":`${list.length} de ${rows.length} registros`}</span>
      {hasFilters&&<button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 px-2 py-2 text-xs font-semibold text-blue-200"><X size={14}/> Limpar filtros</button>}
    </div>
    {filters.length===1&&<div className="mb-4 flex flex-wrap gap-2"><button type="button" aria-pressed={!filterValues[filters[0].key]} className={`admin-filter-chip rounded-full border px-3 py-1.5 text-[11px] transition ${!filterValues[filters[0].key]?"admin-filter-chip-active":""}`} onClick={()=>setFilterValues({})}>Todos: {rows.length}</button>{filters[0].options.map(([value,label])=><button type="button" key={`${filters[0].key}-${value}`} aria-pressed={filterValues[filters[0].key]===value} className={`admin-filter-chip rounded-full border px-3 py-1.5 text-[11px] transition ${filterValues[filters[0].key]===value?"admin-filter-chip-active":""}`} onClick={()=>setFilterValues(current=>({...current,[filters[0].key]:current[filters[0].key]===value?"":value}))}>{label}: {rows.filter(r=>String(get(r,filters[0].key))===value).length}</button>)}</div>}
    {f && <form onSubmit={save} className="admin-editor mb-6 grid gap-4 rounded-2xl border border-blue-400/20 bg-card p-4 sm:p-5 md:grid-cols-2">
      <div className="md:col-span-2 flex items-center justify-between gap-3 border-b border-white/10 pb-3"><div><p className="admin-eyebrow">{f[idKey]?"Editar registro":"Novo registro"}</p><h2 className="mt-1 text-lg font-bold">{title}</h2></div><button type="button" aria-label="Fechar formulário" className="btn-o !min-h-9 !px-3 !py-2" onClick={()=>setF(null)}><X size={16}/></button></div>
      {fields.map(x=><label key={x.key} className={`space-y-1 text-xs text-mut ${x.type==="textarea"?"md:col-span-2":""}`}>{x.label}
        {x.type==="textarea"?<textarea className="inp h-24" value={f[x.key]??""} onChange={e=>setF({...f,[x.key]:e.target.value})}/>
        :x.type==="bool"?<input type="checkbox" className="ml-2" checked={!!f[x.key]} onChange={e=>setF({...f,[x.key]:e.target.checked})}/>
        :x.type==="select"?<select className="inp" value={f[x.key]??""} onChange={e=>setF({...f,[x.key]:e.target.value})}>{x.options?.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
        :x.type==="image"?<div className="space-y-1"><input className="inp" value={f[x.key]??""} onChange={e=>setF({...f,[x.key]:e.target.value})} placeholder="URL ou envie um arquivo"/><input type="file" accept="image/*" onChange={e=>up(x.key,e.target.files?.[0])}/></div>
        :x.type==="color"?<div className="flex items-center gap-3"><input type="color" value={f[x.key]||"#64748b"} onChange={e=>setF({...f,[x.key]:e.target.value})} className="h-11 w-16 cursor-pointer rounded-lg border border-white/10 bg-card p-1"/><input className="inp" value={f[x.key]??""} onChange={e=>setF({...f,[x.key]:e.target.value})} placeholder="#64748b"/></div>
        :<input className="inp" type={x.type==="number"?"number":x.type==="date"?"datetime-local":"text"} step="any" value={f[x.key]??""} onChange={e=>setF({...f,[x.key]:e.target.value})}/>}</label>)}
      <div className="flex flex-wrap gap-2 border-t border-white/10 pt-3 md:col-span-2"><button disabled={saving} className="btn-p inline-flex min-h-10 items-center gap-2">{saving?<><LoaderCircle size={15} className="animate-spin"/> Salvando...</>:<><Check size={15}/> Salvar</>}</button><button type="button" className="btn-o min-h-10" onClick={()=>setF(null)} disabled={saving}>Cancelar</button></div></form>}
    <div className="admin-table-wrap overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full min-w-max text-left text-sm"><thead className="bg-surf text-[10px] uppercase tracking-wider text-mut"><tr>{columns.map(c=><th key={c.key} scope="col" className="whitespace-nowrap px-4 py-3">{c.label}</th>)}<th scope="col" className="px-4 py-3 text-right">Ações</th></tr></thead>
      <tbody>{list.map(r=><tr key={r[idKey]} className="admin-table-row border-t border-white/5">{columns.map(c=><td key={c.key} title={typeof get(r,c.key)==="string"?get(r,c.key):undefined} className="max-w-[360px] px-4 py-3">{cellContent(r,c)}</td>)}
        <td className="px-4 py-3 text-right"><div className="flex flex-wrap justify-end gap-x-3 gap-y-2">{quickActions.filter(action=>!action.whenStatuses||action.whenStatuses.includes(String(r.status))).map(action=><button type="button" key={action.value} disabled={busy===`${r[idKey]}:${action.value}`} className={`admin-action ${action.className??"text-blue-300"}`} onClick={()=>quickUpdate(r,action)}>{busy===`${r[idKey]}:${action.value}`?"Salvando...":action.label}</button>)}<button type="button" className="admin-action text-vio2" onClick={()=>edit(r)}>Editar</button>{canDelete&&<button type="button" disabled={busy===`delete:${r[idKey]}`} className="admin-action text-red-400" onClick={()=>del(r)}>{busy===`delete:${r[idKey]}`?"Excluindo...":"Excluir"}</button>}</div></td></tr>)}
        {!loading&&!list.length&&<tr><td colSpan={columns.length+1} className="p-10 text-center text-mut">{rows.length?"Nenhum registro corresponde à busca ou aos filtros.":"Ainda não há registros cadastrados."}{rows.length>0&&hasFilters&&<button type="button" onClick={clearFilters} className="ml-2 font-semibold text-blue-300 underline underline-offset-2">Limpar filtros</button>}</td></tr>}
        {loading&&!rows.length&&<tr><td colSpan={columns.length+1} className="p-10 text-center text-mut"><span className="inline-flex items-center gap-2"><LoaderCircle size={16} className="animate-spin"/> Carregando registros...</span></td></tr>}</tbody></table>
    </div></div>;
}
