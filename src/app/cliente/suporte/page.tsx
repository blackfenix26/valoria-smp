"use client"; import { useEffect, useState } from "react";
const ST: Record<string,string> = {OPEN:"Aberto",IN_PROGRESS:"Em atendimento",RESOLVED:"Resolvido",CLOSED:"Fechado"};
export default function Suporte(){
  const [list,setList] = useState<any[]>([]), [err,setErr] = useState(""), [open,setOpen] = useState(false);
  const load = ()=>fetch("/api/tickets").then(r=>r.json()).then(setList); useEffect(()=>{ load() },[]);
  async function send(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload: Record<string, string> = {};
    formData.forEach((value, key) => {
      payload[key] = String(value);
    });
    const r = await fetch("/api/tickets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    if(!r.ok) return setErr((await r.json()).error); form.reset(); setErr(""); setOpen(false); load();
  }
  return <><div className="mb-4 flex items-center justify-between"><h1 className="text-2xl font-bold">Suporte</h1><button className="btn-p" onClick={()=>setOpen(!open)}>Novo Ticket</button></div>
    {open&&<form onSubmit={send} className="mb-6 space-y-3 rounded-2xl border border-white/10 bg-card p-5"><input name="subject" placeholder="Assunto" className="inp" required/>
      <select name="category" className="inp">{["Pagamento","Produto não recebido","Conta","Dúvida","Outro"].map(c=><option key={c}>{c}</option>)}</select><textarea name="message" placeholder="Descreva o problema" className="inp h-28" required/>
      {err&&<p role="alert" className="text-sm text-red-400">{err}</p>}<button className="btn-p">Enviar ticket</button></form>}
    {!list.length&&<p className="text-mut">Nenhum ticket aberto.</p>}
    <div className="space-y-3">{list.map(t=><div key={t.id} className="rounded-xl border border-white/10 bg-card p-4 text-sm"><div className="flex justify-between"><b>{t.subject}</b><span className="text-vio2">{ST[t.status]??t.status}</span></div><p className="text-mut">{t.message}</p>
      {t.reply&&<p className="mt-2 rounded-lg bg-surf p-3"><b>Resposta da equipe:</b> {t.reply}</p>}</div>)}</div></>;
}
