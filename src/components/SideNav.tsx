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
};

export default function SideNav({ items, eyebrow = "Admin", title = "Painel SMP" }: { items: [string, string][]; eyebrow?: string; title?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navQuery, setNavQuery] = useState("");
  const visibleItems = items.filter(([label]) => label.toLowerCase().includes(navQuery.trim().toLowerCase()));

  return (
    <aside className="rounded-3xl border border-white/10 bg-[#0a0d14]/80 p-3 shadow-[0_0_30px_rgba(29,78,216,0.12)] backdrop-blur-xl md:w-[260px] md:shrink-0">
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-black/20 p-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/15 text-blue-300">
          <BarChart3 size={18} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-blue-300/80">{eyebrow}</p>
          <h2 className="text-sm font-bold text-white">{title}</h2>
        </div>
      </div>

      <label className="sr-only" htmlFor="area-navigation">Navegação da área</label>
      <select id="area-navigation" value={items.find(([, href]) => pathname === href || (href !== "/admin" && pathname.startsWith(href)))?.[1] || ""} onChange={event => event.target.value && router.push(event.target.value)} className="inp mb-3 md:hidden">
        {items.map(([label, href]) => <option key={href} value={href}>{label}</option>)}
      </select>
      <nav className="hidden gap-2 pb-1 md:flex md:flex-col md:overflow-visible">
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
        {visibleItems.map(([label, href]) => {
          const Icon = ICONS[label] || BarChart3;
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 whitespace-nowrap rounded-2xl border px-3 py-2.5 text-sm transition ${
                active
                  ? "border-blue-500/50 bg-blue-500/12 text-white shadow-[0_0_20px_rgba(59,130,246,0.18)]"
                  : "border-transparent bg-white/[0.02] text-white/70 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
        {!visibleItems.length && <p className="px-3 py-4 text-sm text-white/50">Nenhuma seção encontrada.</p>}

        <div className="mt-2 border-t border-white/10 pt-2">
          <LogoutButton className="flex w-full items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-left text-sm text-red-300 transition hover:border-red-500/30 hover:bg-red-500/10" />
        </div>
      </nav>
    </aside>
  );
}
