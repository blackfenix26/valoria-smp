import Link from "next/link";
import { Search, User, Menu, Sun } from "lucide-react";
import { getSession } from "@/lib/auth";
import CartButton from "./CartButton";
import LogoutButton from "./LogoutButton";

const NAV = [["Início","/"],["Produtos","/produtos"],["Planos","/produtos?cat=Ranks"],["Mercado","/produtos"],["Atualizações","/atualizacoes"],["Wiki","/wiki"]];

export default async function Header(){
  const s = await getSession();
  return <header className="sticky top-0 z-50 border-b border-white/10 bg-[#03050A]/85 backdrop-blur-xl">
    <div className="mx-auto flex h-[72px] max-w-[1400px] items-center gap-3 px-4 lg:px-6">
      <details className="relative md:hidden"><summary className="cursor-pointer list-none rounded-xl p-2 hover:bg-white/5" aria-label="Menu"><Menu size={21}/></summary>
        <div className="absolute left-0 mt-3 w-56 rounded-2xl border border-white/10 bg-card/95 p-2 text-sm shadow-2xl backdrop-blur-xl">{NAV.map(([l,h])=><Link key={l} href={h} className="block rounded-xl p-3 hover:bg-blue-500/10 hover:text-white">{l}</Link>)}</div>
      </details>
      <Link href="/" className="flex shrink-0 items-center gap-2.5">
        <img src="/assets/valoria-logo.png" alt="Valoria SMP" className="h-10 w-10 object-contain"/>
        <span className="hidden text-lg font-black tracking-tight sm:block text-white">VALORIA <span className="rounded bg-black px-1.5 py-0.5 text-blue-400 shadow-[0_0_18px_rgba(59,130,246,0.5)]">SMP</span></span>
      </Link>
      <nav className="hidden gap-5 text-sm font-medium text-white/70 lg:flex">{NAV.map(([l,h])=><Link key={l} href={h} className="transition hover:text-white">{l}</Link>)}</nav>
      <div className="flex-1"/>
      <form action="/produtos" className="hidden max-w-[330px] flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm md:flex"><Search size={15} className="text-blue-300"/><input name="q" placeholder="Buscar produto..." aria-label="Buscar produto" className="w-full bg-transparent outline-none placeholder:text-white/40"/></form>
      <details className="relative"><summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl p-2 text-sm text-white/80 hover:bg-white/5"><User size={17}/><span className="hidden xl:inline">Área do Cliente</span></summary>
        <div className="absolute right-0 mt-3 w-60 rounded-2xl border border-white/10 bg-card/95 p-2 text-sm shadow-2xl backdrop-blur-xl">
          {!s && <><Link className="block rounded-xl p-3 hover:bg-white/5" href="/login">Entrar</Link><Link className="block rounded-xl p-3 hover:bg-white/5" href="/login?tab=registro">Criar conta</Link></>}
          {s && <Link className="block rounded-xl p-3 hover:bg-white/5" href="/cliente">Meu painel</Link>}
          {s?.role==="ADMIN" && <Link className="block rounded-xl p-3 text-blue-300 hover:bg-white/5" href="/admin">Área administrativa</Link>}
          {s && <LogoutButton className="block w-full rounded-xl p-3 text-left hover:bg-white/5"/>}
        </div>
      </details>
      <span className="hidden sm:inline" title="Português (Brasil)">🇧🇷</span>
      <button className="hidden rounded-xl p-2 text-white/70 hover:bg-white/5 hover:text-white sm:block" title="Tema"><Sun size={17}/></button>
      <CartButton/>
    </div>
  </header>;
}
