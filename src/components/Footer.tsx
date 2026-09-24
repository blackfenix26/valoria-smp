import Link from "next/link";
import { getSettings } from "@/lib/db";

const FALLBACK_LINKS: Record<string, string> = {
  link_docs: "/wiki",
  link_terms: "/termos",
  link_privacy: "/privacidade",
  link_faq: "/faq",
  link_discord: "#",
  link_instagram: "#",
  link_tiktok: "#",
  link_youtube: "#",
};

export default async function Footer() {
  const s = await getSettings();

  const L = (k: string, n: string) => (
    <Link key={n} href={s[k] || FALLBACK_LINKS[k] || "#"} className="transition hover:text-white">
      {n}
    </Link>
  );

  return (
    <footer className="mt-20 border-t border-white/10 bg-surf">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr] lg:px-6">
        <div>
          <div className="flex items-center gap-3">
            <img src="/assets/valoria-logo.png" alt="Valoria SMP" className="h-12 w-12 object-contain" />
            <div className="text-xl font-black text-white">
              VALORIA <span className="rounded bg-black px-1.5 py-0.5 text-blue-400 shadow-[0_0_18px_rgba(59,130,246,0.5)]">SMP</span>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-mut">{s.footer_text || "Uma experiência Minecraft criada para aventureiros."}</p>
          <p className="mt-6 text-xs text-mut">© 2026 Valoria SMP. Todos os direitos reservados.</p>
        </div>

        <div>
          <h5 className="mb-4 text-xs font-bold tracking-wider text-white">INFORMAÇÕES</h5>
          <div className="grid gap-2 text-sm text-mut">
            {[
              ["link_docs", "Documentação"],
              ["link_terms", "Termos de Serviço"],
              ["link_privacy", "Política de Privacidade"],
              ["link_faq", "FAQ"],
            ].map(([k, n]) => L(k, n))}
            <Link href="/cliente/suporte" className="transition hover:text-white">Suporte</Link>
          </div>
        </div>

        <div>
          <h5 className="mb-4 text-xs font-bold tracking-wider text-white">COMUNIDADE</h5>
          <div className="grid gap-2 text-sm text-mut">
            {[
              ["link_discord", "Discord"],
              ["link_instagram", "Instagram"],
              ["link_tiktok", "TikTok"],
              ["link_youtube", "YouTube"],
            ].map(([k, n]) => L(k, n))}
          </div>
          <p className="mt-5 text-xs text-mut">Acompanhe novidades, eventos e atualizações da Valoria SMP.</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1400px] flex-wrap justify-between gap-3 px-4 py-4 text-xs text-mut lg:px-6">
          <span>♥ Feito para a comunidade Valoria</span>
          <div className="flex gap-5">
            <span>Valoria SMP</span>
            <span>Suporte</span>
            <span>Termos</span>
            <span>Privacidade</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
