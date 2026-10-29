import { redirect } from "next/navigation";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import SideNav from "@/components/SideNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch {
    redirect("/login?next=/admin");
  }

  return (
    <div className="workspace-shell w-full px-4 py-6 lg:px-8">
      <div className="workspace-banner mb-5 flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#090d13]/90 p-5 shadow-[0_0_35px_rgba(29,78,216,0.12)] sm:p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="workspace-banner-icon grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-blue-300/15 bg-blue-400/10 text-blue-200"><ShieldCheck size={22}/></div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-300/80">Controle operacional</p>
            <h1 className="mt-1 text-xl font-black text-white sm:text-2xl">Área administrativa SMP</h1>
            <p className="mt-1 text-xs text-mut">Gerencie a loja, a comunidade e o conteúdo da Valória.</p>
          </div>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="admin-store-link inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white/80 transition hover:border-blue-300/30 hover:bg-blue-400/10 hover:text-white">Abrir site <ArrowUpRight size={15}/></a>
      </div>

      <div className="workspace-grid flex flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:gap-5">
        <SideNav
          items={[
            ["Dashboard", "/admin"],
            ["Pedidos", "/admin/pedidos"],
            ["Suporte", "/admin/suporte"],
            ["Candidaturas", "/admin/candidaturas"],
            ["Avaliações", "/admin/avaliacoes"],
            ["Sugestões de melhoria ADM", "/admin/sugestoes"],
            ["Produtos", "/admin/produtos"],
            ["Categorias", "/admin/categorias"],
            ["Organizar VIPs", "/admin/vips"],
            ["Cupons", "/admin/cupons"],
            ["Reinos", "/admin/reinos"],
            ["Destaque premium dos reinos", "/admin/destaque-reinos"],
            ["Eventos", "/admin/eventos"],
            ["Banners", "/admin/banners"],
            ["Patrocinadores", "/admin/patrocinadores"],
            ["Atualizações", "/admin/atualizacoes"],
            ["Wiki", "/admin/wiki"],
            ["FAQ", "/admin/faq"],
            ["Tópicos do site", "/admin/navegacao"],
            ["Oportunidades", "/admin/oportunidades"],
            ["Usuários", "/admin/usuarios"],
            ["Configurações", "/admin/configuracoes"],
            ["Logs", "/admin/logs"],
          ]}
        />

        <section className="workspace-panel min-w-0 flex-1 rounded-3xl border border-white/10 bg-[#0a0d14]/70 p-4 shadow-[0_0_30px_rgba(15,23,42,0.35)] sm:p-5 lg:p-6">{children}</section>
      </div>
    </div>
  );
}
