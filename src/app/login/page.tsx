"use client"; import { useState } from "react"; import { useRouter, useSearchParams } from "next/navigation"; import { Suspense } from "react";
function Form(){
  const r = useRouter(), q = useSearchParams(), [reg,setReg] = useState(q.get("tab")==="registro"), [err,setErr] = useState("");
  async function submit(e:React.FormEvent<HTMLFormElement>){ e.preventDefault(); setErr("");
    const formData = new FormData(e.currentTarget);
    const payload: Record<string, string> = {};
    formData.forEach((value, key) => {
      payload[key] = String(value);
    });
    const res = await fetch(`/api/auth/${reg?"register":"login"}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const d = await res.json(); if(!res.ok) return setErr(d.error); r.push(q.get("next")||(d.role==="ADMIN"?"/admin":"/cliente")); r.refresh(); }
  return <form onSubmit={submit} className="mx-auto mt-16 w-full max-w-sm space-y-3 rounded-2xl border border-white/10 bg-card p-6">
    <h1 className="text-xl font-bold">{reg?"Criar conta":"Entrar"}</h1>
    {reg && <><input name="name" placeholder="Nome" className="inp" required/><input name="username" placeholder="Usuário" className="inp" required/></>}
    <input name="email" type="email" placeholder="E-mail" className="inp" required/><input name="password" type="password" placeholder="Senha" className="inp" required/>
    {err && <p role="alert" className="text-sm text-red-400">{err}</p>}
    <button className="btn-p w-full">{reg?"Criar conta":"Entrar"}</button>
    <button type="button" onClick={()=>setReg(!reg)} className="w-full text-xs text-mut">{reg?"Já tenho conta":"Ainda não tenho conta"}</button></form>;
}
export default function Login(){ return <Suspense><Form/></Suspense> }
