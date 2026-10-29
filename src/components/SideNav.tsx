"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Package,
  Tags,
  ShoppingCart,
  Users,
  TicketPercent,
  CalendarRange,
  ImageIcon,
  Headset,
  Settings,
  FileText,
  Home,
  ShoppingBag,
  Heart,
  FileClock,
  LogOut,
  Search,
  BookOpen,
  Briefcase,
  Building2,
  ClipboardList,
  Compass,
  Crown,
  Megaphone,
  MessageSquare,
  Sparkles,
  Star,
  ChevronDown,
} from "lucide-react";
import LogoutButton from "./LogoutButton";
import { useState } from "react";

const ICONS: Record<string, typeof BarChart3> = {
  Dashboard: BarChart3,
  Atualizações: FileText,
  Produtos: Package,
  Categorias: Tags,
  Pedidos: ShoppingCart,
  Usuários: Users,
  Cupons: TicketPercent,
  Eventos: CalendarRange,
  Banners: ImageIcon,
  Suporte: Headset,
  Configurações: Settings,
  Logs: FileClock,
  Início: Home,
  "Meus Pedidos": ShoppingBag,
  "Meus Produtos": Package,
  Favoritos: Heart,
  "Organizar VIPs": Crown,
  Reinos: Compass,
  "Destaque premium dos reinos": Sparkles,
  Oportunidades: Briefcase,
  "Trabalhe Conosco": Briefcase,
  Candidaturas: ClipboardList,
  Wiki: BookOpen,
  FAQ: MessageSquare,
  Patrocinadores: Building2,
  "Tópicos do site": Compass,
  Avaliações: Star,
  "Avaliar servidor": Star,
  "Sugestões de melhoria ADM": MessageSquare,
};

export default function SideNav({ items, eyebrow = "Admin", title = "Painel SMP" }: { items: [string, string][]; eyebrow?: string; title?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navQuery, setNavQuery] = useState("");
  const visibleItems = items.filter(([label]) => label.toLowerCase().includes(navQuery.trim().toLowerCase()));
  const isAdmin = items.some(([, href]) => href === "/admin");
  const groups = isAdmin ? [
    { title: "Visão geral", links: visibleItems.filter(([, href]) => href === "/admin") },
    { title: "Operações", links: visibleItems.filter(([, href]) => ["/admin/pedidos", "/admin/suporte", "/admin/candidaturas", "/admin/avaliacoes", "/admin/sugestoes", "/admin/oportunidades"].includes(href)) },
    { title: "Loja e ofertas", links: visibleItems.filter(([, href]) => ["/admin/produtos", "/admin/categorias", "/admin/vips", "/admin/cupons"].includes(href)) },
    { title: "Mundo Valória", links: visibleItems.filter(([, href]) => ["/admin/reinos", "/admin/destaque-reinos", "/admin/eventos", "/admin/banners", "/admin/patrocinadores"].includes(href)) },
    { title: "Conteúdo", links: visibleItems.filter(([, href]) => ["/admin/atualizacoes", "/admin/wiki", "/admin/faq", "/admin/navegacao"].includes(href)) },
    { title: "Sistema", links: visibleItems.filter(([, href]) => ["/admin/usuarios", "/admin/configuracoes", "/admin/logs"].includes(href)) },
  ] : [{ title: "", links: visibleItems }];
  const currentLabel = items.find(([, href]) => pathname === href || (href !== "/admin" && pathname.startsWith(href)))?.[0];
  const renderLink = ([label, href]: [string, string]) => {
    const Icon = ICONS[label] || BarChart3;
    const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));

    return <Link
      key={href}
      href={href}
      aria-current={active ? "page" : undefined}
      title={label}
      className={`workspace-nav-link flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[13px] transition ${
        active
          ? "border-blue-500/35 bg-blue-500/12 text-white shadow-[inset_3px_0_0_#60a5fa,0_0_20px_rgba(59,130,246,0.12)]"
          : "border-transparent bg-white/[0.02] text-white/65 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <Icon size={16} className={active ? "text-blue-300" : "text-white/45"} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300"/>}
    </Link>;
  };

  return (
    <aside className="workspace-sidebar rounded-3xl border border-white/10 bg-[#0a0d14]/80 p-3 shadow-[0_0_30px_rgba(29,78,216,0.12)] backdrop-blur-xl md:sticky md:top-24 md:max-h-[calc(100vh-7rem)] md:w-[270px] md:shrink-0 md:overflow-y-auto">
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-black/20 p-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/15 text-blue-300">
          <BarChart3 size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.25em] text-blue-300/80">{eyebrow}</p>
          <h2 className="text-sm font-bold text-white">{title}</h2>
        </div>
        {isAdmin && <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300">Admin</span>}
      </div>

      <label className="sr-only" htmlFor="area-navigation">Navegação da área</label>
      <div className="relative mb-3 md:hidden">
        <select id="area-navigation" value={items.find(([, href]) => pathname === href || (href !== "/admin" && pathname.startsWith(href)))?.[1] || ""} onChange={event => event.target.value && router.push(event.target.value)} className="inp appearance-none pr-10">
          {groups.map(group => <optgroup key={group.title || "account"} label={group.title || "Minha conta"}>
            {group.links.map(([label, href]) => <option key={href} value={href}>{label}</option>)}
          </optgroup>)}
        </select>
        <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-mut"/>
      </div>
      <nav aria-label="Navegação do painel" className="hidden gap-4 pb-1 md:flex md:flex-col">
        {items.length > 8 && (
          <label className="relative mb-1 block">
            <Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={navQuery}
              onChange={event => setNavQuery(event.target.value)}
              aria-label="Buscar seção"
              placeholder="Buscar seção..."
              className="inp min-h-11 pl-9 text-sm"
            />
          </label>
        )}
        {groups.map(group => group.links.length > 0 && (group.title ? (
          <details key={group.title} className="workspace-nav-group" open={group.links.some(([, href]) => pathname === href || (href !== "/admin" && pathname.startsWith(href))) || Boolean(navQuery)}>
            <summary>{group.title}<ChevronDown size={14} aria-hidden="true"/></summary>
            <div className="workspace-nav-group-links">{group.links.map(renderLink)}</div>
          </details>
        ) : <div key="account" className="space-y-1.5">{group.links.map(renderLink)}</div>))}
        {!visibleItems.length && <p className="px-3 py-4 text-sm text-white/50">Nenhuma seção encontrada.</p>}

        <div className="mt-2 border-t border-white/10 pt-2">
          <LogoutButton className="flex w-full items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-left text-sm text-red-300 transition hover:border-red-500/30 hover:bg-red-500/10" />
        </div>
      </nav>
      {currentLabel && <p className="mt-3 truncate border-t border-white/10 px-3 pt-3 text-[10px] text-mut md:hidden">Atual: <span className="font-semibold">{currentLabel}</span></p>}
    </aside>
  );
}
