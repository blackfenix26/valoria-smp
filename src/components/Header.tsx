import Link from "next/link";
import { Search, User, Menu } from "lucide-react";
import { getSession } from "@/lib/auth";
import CartButton from "./CartButton";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "./ThemeToggle";

const DEFAULT_NAV: [string, string, boolean][] = [["Início","/",true],["Produtos","/produtos",true],["VIPs","/vips",true],["Planos","/produtos?cat=Ranks",true],["Mercado","/produtos",true],["Reinos","/reinos",true],["Trabalhe Conosco","/trabalhe-conosco",true],["Atualizações","/atualizacoes",true],["Wiki","/wiki",true]];

export default async function Header(){
  const s = await getSession();
  const { getSettings } = await import("@/lib/db");
  const settings = await getSettings();
  let nav = DEFAULT_NAV;
  try { nav = JSON.parse(settings.site_nav); } catch {}
  for (const required of [["VIPs", "/vips", true], ["Reinos", "/reinos", true], ["Trabalhe Conosco", "/trabalhe-conosco", true]] as [string, string, boolean][]) {
    const existing = nav.find((item) => item[0].toLowerCase() === required[0].toLowerCase() || item[1] === required[1]);
    if (existing) {
      existing[0] = required[0];
      existing[1] = required[1];
      existing[2] = true;
    } else nav.push(required);
  }
  nav = nav.filter((item, index, items) => items.findIndex(candidate => candidate[1] === item[1]) === index);
  nav = nav.filter((item) => item[2]);
  return <header className="site-header sticky top-0 z-50 border-b border-white/10 bg-[#03050A]/85 backdrop-blur-xl">
    <div className="mx-auto flex h-[72px] max-w-[1400px] items-center gap-3 px-4 lg:px-6">
      <details className="relative xl:hidden"><summary className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-xl transition hover:bg-white/10" aria-label="Abrir menu"><Menu size={21}/></summary>
        <div className="mobile-nav-panel absolute left-0 mt-3 max-h-[calc(100dvh-6rem)] w-[min(88vw,20rem)] overflow-y-auto rounded-2xl border border-white/10 p-3 text-sm shadow-2xl backdrop-blur-xl"><form action="/produtos" className="mb-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3"><Search size={15} className="shrink-0 text-mut"/><input name="q" placeholder="Buscar produtos..." aria-label="Buscar produtos" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-white/40"/><button aria-label="Pesquisar" className="py-3 text-xs font-semibold">Buscar</button></form>{nav.map(([l,h])=><Link key={l} href={h} className="block min-h-11 rounded-xl px-3 py-3 transition hover:bg-white/10 hover:text-white">{l}</Link>)}</div>
      </details>
      <Link href="/" className="site-brand flex shrink-0 items-center gap-2.5">
        <img src="/assets/valoria-logo.png" alt="Valoria SMP" className="h-10 w-10 object-contain"/>
        <span className="site-brand-name hidden text-lg font-black tracking-tight sm:block text-white">VALORIA <span className="site-brand-mark rounded bg-black px-1.5 py-0.5 text-blue-400 shadow-[0_0_18px_rgba(59,130,246,0.5)]">SMP</span></span>
      </Link>
      <nav className="hidden gap-5 text-sm font-medium text-white/70 xl:flex">{nav.map(([l,h])=><Link key={l} href={h} className="nav-link transition hover:text-white">{l}</Link>)}</nav>
      <div className="flex-1"/>
      <form action="/produtos" className="header-search hidden max-w-[240px] flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm 2xl:flex"><Search size={15} className="text-blue-300"/><input name="q" placeholder="Buscar produto..." aria-label="Buscar produto" className="w-full bg-transparent outline-none placeholder:text-white/40"/></form>
      <details className="relative"><summary aria-label="Área do cliente" className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-xl text-sm text-white/80 transition hover:bg-white/10"><User size={18}/><span className="sr-only">Área do Cliente</span></summary>
        <div className="absolute right-0 mt-3 w-60 rounded-2xl border border-white/10 bg-card/95 p-2 text-sm shadow-2xl backdrop-blur-xl">
          {!s && <><Link className="block rounded-xl p-3 hover:bg-white/5" href="/login">Entrar</Link><Link className="block rounded-xl p-3 hover:bg-white/5" href="/login?tab=registro">Criar conta</Link></>}
          {s && <Link className="block rounded-xl p-3 hover:bg-white/5" href="/cliente">Meu painel</Link>}
          {s?.role==="ADMIN" && <Link className="block rounded-xl p-3 text-blue-300 hover:bg-white/5" href="/admin">Área administrativa</Link>}
          {s && <LogoutButton className="block w-full rounded-xl p-3 text-left hover:bg-white/5"/>}
        </div>
      </details>
      <span className="hidden sm:inline" title="Português (Brasil)">🇧🇷</span>
      <div className="block"><ThemeToggle/></div>
      <CartButton/>
    </div>
  </header>;
}
