import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const day = new Date(new Date().setHours(0, 0, 0, 0));
  const since = new Date(day.getTime() - 6 * 864e5);
  const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const [prod, ord, usr, sales, week, top] = await Promise.all([
    db.product.count(),
    db.order.count({ where: { createdAt: { gte: day } } }),
    db.user.count({ where: { active: true } }),
    db.order.aggregate({
      _sum: { total: true },
      where: { status: "APPROVED", createdAt: { gte: day } },
    }),
    db.order.findMany({
      where: { status: "APPROVED", createdAt: { gte: since } },
    }),
    db.orderItem.groupBy({
      by: ["productId"],
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 5,
    }),
  ]);

  const names = await db.product.findMany({
    where: { id: { in: top.map((t) => t.productId) } },
  });

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(since.getTime() + i * 864e5);
    const value = week
      .filter((o) => o.createdAt.toDateString() === d.toDateString())
      .reduce((sum, o) => sum + o.total, 0);

    return {
      label: d.toLocaleDateString("pt-BR", { weekday: "short" }),
      value,
    };
  });

  const max = Math.max(1, ...days.map((d) => d.value));

  const metrics = [
    ["Produtos", prod],
    ["Pedidos hoje", ord],
    ["Usuários ativos", usr],
    ["Vendas hoje", brl(sales._sum.total ?? 0)],
  ];

  return (
    <>
      <h1 className="text-2xl font-bold">Bem-vindo, Administrador!</h1>
      <p className="mb-6 text-mut">Gerencie a Valoria BLCKX e mantenha a comunidade ativa.</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-black/20 p-5 shadow-[0_0_30px_rgba(29,78,216,0.12)]"
          >
            <p className="text-sm text-white/60">{label}</p>
            <p className="mt-3 text-2xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-card p-5">
          <h2 className="mb-3 font-semibold">Vendas (7 dias)</h2>
          <div className="flex h-40 items-end gap-2">
            {days.map((d) => (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-1 self-stretch text-[10px] text-mut">
                <div className="flex w-full flex-1 items-end">
                  <div
                    title={brl(d.value)}
                    style={{ height: `${(d.value / max) * 100}%` }}
                    className="w-full rounded-t bg-gradient-to-t from-blue-500 to-cyan-400"
                  />
                </div>
                {d.label}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-card p-5">
          <h2 className="mb-3 font-semibold">Ações rápidas</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <a href="/admin/produtos" className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-white hover:bg-blue-500/20">
              Gerenciar produtos
            </a>
            <a href="/admin/pedidos" className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80 hover:bg-white/10">
              Aprovar pedidos
            </a>
            <a href="/admin/atualizacoes" className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80 hover:bg-white/10">
              Atualizações
            </a>
            <a href="/admin/configuracoes" className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80 hover:bg-white/10">
              Configurações
            </a>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-card p-5">
            <h2 className="mb-3 font-semibold">Mais vendidos</h2>
            {!top.length && <p className="text-sm text-mut">Sem vendas ainda.</p>}
            {top.map((t) => (
              <div key={t.productId} className="flex items-center justify-between gap-3 border-b border-white/5 py-2 text-sm last:border-0">
                <span className="truncate">{names.find((n) => n.id === t.productId)?.name}</span>
                <b className="text-blue-300">{t._count.productId}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
