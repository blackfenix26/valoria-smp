"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

function Form() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [register, setRegister] = useState(searchParams.get("tab") === "registro");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);

    const formData = new FormData(event.currentTarget);
    const payload: Record<string, string> = {};
    formData.forEach((value, key) => {
      payload[key] = String(value);
    });

    try {
      const response = await fetch(`/api/auth/${register ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Não foi possível acessar sua conta.");
        return;
      }

      router.push(searchParams.get("next") || (data.role === "ADMIN" ? "/admin" : "/cliente"));
      router.refresh();
    } catch {
      setError("Não foi possível conectar. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page mx-auto grid min-h-[min(760px,calc(100vh-190px))] w-full max-w-6xl items-center gap-8 px-4 py-10 lg:grid-cols-[1fr_.85fr] lg:px-6">
      <section className="auth-story relative hidden min-h-[520px] flex-col justify-between overflow-hidden rounded-[32px] border border-white/10 p-8 lg:flex xl:p-10">
        <div className="absolute inset-0 -z-10">
          <Image src="/assets/hero-valoria.jpg" alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover opacity-45"/>
          <div className="absolute inset-0 bg-gradient-to-br from-[#080b12]/50 via-[#080b12]/75 to-[#080b12]"/>
        </div>
        <Link href="/" className="flex items-center gap-3">
          <Image src="/assets/valoria-logo.png" alt="Valoria SMP" width={48} height={48} className="object-contain"/>
          <span className="text-lg font-black tracking-tight">VALORIA <span className="text-blue-300">SMP</span></span>
        </Link>
        <div className="max-w-lg">
          <span className="brand-tag"><Sparkles size={13}/> Sua jornada continua</span>
          <h1 className="mt-5 text-4xl font-black leading-tight xl:text-5xl">Entre no universo de Valoria.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/70">Acesse seus pedidos, benefícios e novidades da comunidade em um só lugar.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60"><ShieldCheck size={16} className="text-blue-300"/> Acesso protegido à sua conta</div>
      </section>

      <section className="auth-panel mx-auto w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center gap-3 lg:hidden">
          <Image src="/assets/valoria-logo.png" alt="Valoria SMP" width={42} height={42} className="object-contain"/>
          <span className="text-lg font-black">VALORIA <span className="text-blue-300">SMP</span></span>
        </Link>
        <div className="auth-card rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl sm:p-8">
          <span className="section-kicker">{register ? "Comece sua aventura" : "Bem-vindo de volta"}</span>
          <h2 className="mt-2 text-2xl font-black">{register ? "Criar sua conta" : "Entrar na Valoria"}</h2>
          <p className="mt-2 text-sm leading-6 text-mut">{register ? "Crie seu perfil para acompanhar compras e fazer parte da comunidade." : "Acesse seus pedidos, produtos e configurações."}</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {register && <>
              <label className="block space-y-1.5 text-xs font-semibold text-white/75">Nome
                <input name="name" autoComplete="name" placeholder="Como podemos chamar você?" className="inp" required/>
              </label>
              <label className="block space-y-1.5 text-xs font-semibold text-white/75">Nome de usuário
                <input name="username" autoComplete="username" placeholder="Escolha seu usuário" className="inp" required/>
              </label>
            </>}
            <label className="block space-y-1.5 text-xs font-semibold text-white/75">E-mail
              <input name="email" type="email" autoComplete="email" placeholder="voce@email.com" className="inp" required/>
            </label>
            <label className="block space-y-1.5 text-xs font-semibold text-white/75">Senha
              <input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} placeholder="Sua senha" className="inp" required/>
            </label>
            {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2.5 text-sm text-red-300">{error}</p>}
            <button disabled={busy} className="btn-p flex min-h-12 w-full items-center justify-center gap-2">
              {busy ? "Aguarde..." : register ? "Criar conta" : "Entrar"}
              {!busy && <ArrowRight size={16}/>}
            </button>
          </form>

          <div className="auth-divider my-6 flex items-center gap-3 text-[10px] uppercase tracking-[.16em] text-mut"><span/> acesso à comunidade <span/></div>
          <button type="button" onClick={() => { setRegister(!register); setError(""); }} className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold transition hover:border-blue-300/30 hover:bg-white/[.04]">
            {register ? "Já tem uma conta? Entrar" : "Ainda não tem conta? Criar agora"}
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-mut">Ao continuar, você concorda com nossos <Link href="/termos" className="font-semibold underline underline-offset-4">Termos</Link> e nossa <Link href="/privacidade" className="font-semibold underline underline-offset-4">Política de Privacidade</Link>.</p>
      </section>
    </main>
  );
}

export default function Login() {
  return <Suspense fallback={<main className="grid min-h-[60vh] place-items-center text-sm text-mut">Carregando acesso...</main>}><Form/></Suspense>;
}
