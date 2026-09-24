"use client"; import { useEffect, useState } from "react";
export type Fld = { key:string; label:string; type:"text"|"textarea"|"number"|"bool"|"date"|"select"|"image"; options?:[string,string][] };
const get = (o:any,k:string)=>k.split(".").reduce((a:any,p)=>a?.[p],o);
const show = (v:any)=>typeof v==="boolean"?(v?"Sim":"Não"):typeof v==="string"&&/^\d{4}-\d\d-\d\dT/.test(v)?new Date(v).toLocaleString("pt-BR"):(v??"—");
export default function CrudManager({model,title,fields,columns,canCreate=true,canDelete=true,idKey="id",hint}:{model:string;title:string;fields:Fld[];columns:{key:string;label:string}[];canCreate?:boolean;canDelete?:boolean;idKey?:string;hint?:string}){
  const [rows,setRows] = useState<any[]>([]), [f,setF] = useState<any|null>(null), [err,setErr] = useState(""), [q,setQ] = useState(""), url = `/api/admin/crud/${model}`;
  const load = async()=>{ const r = await fetch(url); setRows(r.ok?await r.json():[]) };
  useEffect(()=>{ load() },[]);
  const blank = ()=>setF(Object.fromEntries(fields.map(x=>[x.key,x.type==="bool"?x.key==="active":x.type==="select"?x.options?.[0]?.[0]??"":""])));
  const edit = (r:any)=>{ const o = {...r}; fields.forEach(x=>{ if(x.type==="date"&&o[x.key]) o[x.key] = new Date(o[x.key]).toISOString().slice(0,16) }); setF(o) };
  async function save(e:React.FormEvent){ e.preventDefault(); setErr(""); const r = await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(f)});
    if(!r.ok) return setErr((await r.json()).error||"Erro ao salvar."); setF(null); load() }
  async function del(r:any){ if(!confirm("Excluir este item?")) return; const x = await fetch(url,{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({[idKey]:r[idKey]})}); if(!x.ok) alert((await x.json()).error); load() }
  async function up(k:string,file?:File){ if(!file) return; const fd = new FormData(); fd.append("file",file); const r = await fetch("/api/admin/upload",{method:"POST",body:fd}), d = await r.json(); r.ok?setF((p:any)=>({...p,[k]:d.url})):setErr(d.error) }
  const list = rows.filter(r=>JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  return <><div className="mb-4 flex flex-wrap items-center gap-3"><h1 className="flex-1 text-2xl font-bold">{title}</h1>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar..." className="inp max-w-[200px]"/>{canCreate&&<button className="btn-p" onClick={blank}>+ Novo</button>}</div>
    {hint&&<p className="mb-4 text-xs text-mut">{hint}</p>}
    {f && <form onSubmit={save} className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-card p-5 md:grid-cols-2">
      {fields.map(x=><label key={x.key} className={`space-y-1 text-xs text-mut ${x.type==="textarea"?"md:col-span-2":""}`}>{x.label}
        {x.type==="textarea"?<textarea className="inp h-24" value={f[x.key]??""} onChange={e=>setF({...f,[x.key]:e.target.value})}/>
        :x.type==="bool"?<input type="checkbox" className="ml-2" checked={!!f[x.key]} onChange={e=>setF({...f,[x.key]:e.target.checked})}/>
        :x.type==="select"?<select className="inp" value={f[x.key]??""} onChange={e=>setF({...f,[x.key]:e.target.value})}>{x.options?.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
        :x.type==="image"?<div className="space-y-1"><input className="inp" value={f[x.key]??""} onChange={e=>setF({...f,[x.key]:e.target.value})} placeholder="URL ou envie um arquivo"/><input type="file" accept="image/*" onChange={e=>up(x.key,e.target.files?.[0])}/></div>
        :<input className="inp" type={x.type==="number"?"number":x.type==="date"?"datetime-local":"text"} step="any" value={f[x.key]??""} onChange={e=>setF({...f,[x.key]:e.target.value})}/>}</label>)}
      {err&&<p role="alert" className="text-sm text-red-400 md:col-span-2">{err}</p>}<div className="flex gap-2 md:col-span-2"><button className="btn-p">Salvar</button><button type="button" className="btn-o" onClick={()=>setF(null)}>Cancelar</button></div></form>}
    <div className="overflow-x-auto rounded-2xl border border-white/10"><table className="w-full text-left text-sm"><thead className="bg-surf text-xs text-mut"><tr>{columns.map(c=><th key={c.key} className="p-3">{c.label}</th>)}<th/></tr></thead>
      <tbody>{list.map(r=><tr key={r[idKey]} className="border-t border-white/5">{columns.map(c=><td key={c.key} className="p-3">{show(get(r,c.key))}</td>)}
        <td className="whitespace-nowrap p-3 text-right"><button className="text-vio2" onClick={()=>edit(r)}>Editar</button>{canDelete&&<button className="ml-3 text-red-400" onClick={()=>del(r)}>Excluir</button>}</td></tr>)}
        {!list.length&&<tr><td colSpan={columns.length+1} className="p-6 text-center text-mut">Nada por aqui ainda.</td></tr>}</tbody></table></div></>;
}
