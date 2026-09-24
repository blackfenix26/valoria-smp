import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import SideNav from "@/components/SideNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (s?.role !== "ADMIN") redirect("/login?next=/admin");

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 lg:px-6">
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#090d13]/90 p-4 shadow-[0_0_35px_rgba(29,78,216,0.12)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-blue-300/80">Controle operacional</p>
          <h1 className="mt-2 text-2xl font-black text-white">Área administrativa BLCKX</h1>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm text-blue-200">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          Sistema online
        </div>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <SideNav
          items={[
            ["Dashboard", "/admin"],
            ["Atualizações", "/admin/atualizacoes"],
            ["Produtos", "/admin/produtos"],
            ["Categorias", "/admin/categorias"],
            ["Pedidos", "/admin/pedidos"],
            ["Usuários", "/admin/usuarios"],
            ["Cupons", "/admin/cupons"],
            ["Eventos", "/admin/eventos"],
            ["Banners", "/admin/banners"],
            ["Suporte", "/admin/suporte"],
            ["Configurações", "/admin/configuracoes"],
            ["Logs", "/admin/logs"],
          ]}
        />

        <section className="min-w-0 flex-1 rounded-3xl border border-white/10 bg-[#0a0d14]/70 p-4 shadow-[0_0_30px_rgba(15,23,42,0.35)] md:p-6">{children}</section>
      </div>
    </div>
  );
}
