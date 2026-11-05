"use client";

import Image from "next/image";
import Link from "next/link";
import { Castle, ShoppingCart, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

const links = [
  { label: "Início", href: "/", icon: "brand" },
  { label: "Loja", href: "/produtos", icon: "shop" },
  { label: "Reinos", href: "/reinos", icon: "castle" },
  { label: "Perfil", href: "/cliente/configuracoes", icon: "profile" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav aria-label="Navegação rápida" className="mobile-bottom-nav md:hidden">
      {links.map(({ label, href, icon }) => {
        const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`mobile-bottom-nav-link${active ? " is-active" : ""}`}>
            <span className="mobile-bottom-nav-icon">
              {icon === "brand" ? <Image src="/assets/valoria-logo.png" alt="" width={24} height={24} /> : null}
              {icon === "shop" ? <ShoppingCart size={21} strokeWidth={2.2} /> : null}
              {icon === "castle" ? <Castle size={21} strokeWidth={2.2} /> : null}
              {icon === "profile" ? <UserRound size={21} strokeWidth={2.2} /> : null}
            </span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
