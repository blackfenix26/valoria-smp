"use client"; import { useEffect, useState } from "react";
type U = { id?:string; title:string; summary:string; content:string; image?:string|null; category:string; status:string; publishAt?:string };
const EMPTY: U = { title:"", summary:"", content:"", image:"", category:"NOVIDADE", status:"DRAFT" };
export default function AdminUpdates(){
  const [list,setList] = useState<U[]>([]), [f,setF] = useState<U|null>(null);
  const load = async()=> setList(await (await fetch("/api/admin/updates")).json());
  useEffect(()=>{ load() },[]);
  async function save(e:React.FormEvent){ e.preventDefault(); await fetch("/api/admin/updates",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(f)}); setF(null); load(); }
  async function del(id:string){ if(confirm("Excluir esta atualização?")){ await fetch("/api/admin/updates",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})}); load(); } }
  return <><div className="mb-4 flex items-center justify-between"><h1 className="text-2xl font-bold">Atualizações</h1><button className="btn-p" onClick={()=>setF(EMPTY)}>+ Nova Atualização</button></div>
    {f && <form onSubmit={save} className="mb-6 space-y-3 rounded-2xl border border-white/10 bg-card p-5">
      <input className="inp" placeholder="Título" value={f.title} onChange={e=>setF({...f,title:e.target.value})} required/>
      <input className="inp" placeholder="Descrição curta" value={f.summary} onChange={e=>setF({...f,summary:e.target.value})} required/>
      <textarea className="inp h-32" placeholder="Conteúdo" value={f.content} onChange={e=>setF({...f,content:e.target.value})} required/>
      <input className="inp" placeholder="URL da imagem" value={f.image??""} onChange={e=>setF({...f,image:e.target.value})}/>
      <div className="grid gap-3 md:grid-cols-3">
        <select className="inp" value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{["EVENTO","NOVIDADE","MANUTENCAO","LOJA","IMPORTANTE"].map(c=><option key={c}>{c}</option>)}</select>
        <select className="inp" value={f.status} onChange={e=>setF({...f,status:e.target.value})}><option value="DRAFT">Rascunho</option><option value="PUBLISHED">Publicado</option><option value="SCHEDULED">Agendado</option></select>
        <input type="datetime-local" className="inp" onChange={e=>setF({...f,publishAt:e.target.value})}/></div>
      <div className="flex gap-2"><button className="btn-p">Salvar</button><button type="button" className="btn-o" onClick={()=>setF(null)}>Cancelar</button></div></form>}
    <div className="space-y-2">{list.map(u=><div key={u.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-card p-3 text-sm">
      <span className="flex-1"><b>{u.title}</b> <span className="text-mut">· {u.category} · {u.status}</span></span>
      <button className="text-vio2" onClick={()=>setF(u)}>Editar</button><button className="text-red-400" onClick={()=>del(u.id!)}>Excluir</button></div>)}</div></>;
}
