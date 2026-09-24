import { redirect } from "next/navigation";
import { db, publishedUpdates } from "@/lib/db";
import { getSession } from "@/lib/auth";
import UpdateCard from "@/components/UpdateCard";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Pago",
  PROCESSING: "Processando",
  COMPLETED: "Concluído",
  CANCELED: "Cancelado",
};

export default async function Cliente() {
  const s = await getSession();
  if (!s) redirect("/login?next=/cliente");

  const u = await db.user.findUnique({
    where: { id: s.id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: { include: { product: true } } },
      },
    },
  });

  if (!u) redirect("/login");

  const upd = await publishedUpdates(3);
  const produtos = u.orders.flatMap((o) =>
    o.items.map((i) => ({ ...i.product, orderId: o.id, createdAt: o.createdAt }))
  );
  const pedidosRecentes = u.orders.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-[#0b1220] to-black/20 p-5">
        <p className="text-sm uppercase tracking-[0.25em] text-blue-300/80">Bem-vindo</p>
        <h1 className="mt-2 text-3xl font-black text-white">Olá, {u.name}!</h1>
        <p className="mt-2 text-sm text-white/70">Seu painel foi atualizado para acompanhar pedidos, produtos e novidades da comunidade.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Pedidos", u.orders.length],
          ["Saldo", u.credits.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })],
          ["Produtos adquiridos", produtos.length],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-white/10 bg-card p-5 shadow-[0_0_25px_rgba(29,78,216,0.08)]">
            <p className="text-sm text-white/60">{label}</p>
            <p className="mt-3 text-2xl font-black text-white">{String(value)}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Pedidos recentes</h2>
            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-blue-200">Resumo</span>
          </div>

          <div className="space-y-3">
            {pedidosRecentes.map((o) => (
              <div key={o.id} className="rounded-xl border border-white/10 bg-surf p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-white">#{o.id.slice(-6)}</span>
                  <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-blue-200">
                    {statusLabel[o.status] ?? o.status}
                  </span>
                </div>
                <div className="mt-2 text-white/70">{o.items.map((i) => i.product.name).join(", ")}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Produtos adquiridos</h2>
            <span className="text-xs text-white/50">Disponíveis</span>
          </div>

          <div className="space-y-3">
            {produtos.slice(0, 4).map((p) => (
              <div key={p.id + p.orderId} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-surf p-3 text-sm">
                <span className="font-medium text-white">{p.name}</span>
                <span className="text-xs text-white/50">{new Date(p.createdAt).toLocaleString("pt-BR")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-bold text-white">Fique por dentro</h2>
        <div className="grid gap-4 md:grid-cols-3">{upd.map((x) => <UpdateCard key={x.id} u={x} />)}</div>
      </div>
    </div>
  );
}

