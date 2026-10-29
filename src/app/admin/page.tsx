import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const day = new Date(new Date().setHours(0, 0, 0, 0));
  const since = new Date(day.getTime() - 6 * 864e5);
  const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const [prod, ord, usr, sales, week, top, pendingOrders, openTickets, pendingApplications, pendingReviews, pendingServerReviews, recentOrders] = await Promise.all([
    db.product.count({ where: { active: true } }),
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
    db.order.count({ where: { status: "PENDING" } }),
    db.ticket.count({ where: { status: "OPEN" } }),
    db.jobApplication.count({ where: { status: "PENDING" } }),
    db.review.count({ where: { status: "PENDING" } }),
    db.serverReview.count({ where: { status: "PENDING" } }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { name: true } }, items: true },
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
    { label: "Produtos ativos", value: prod, href: "/admin/produtos", detail: "Catálogo da loja" },
    { label: "Pedidos hoje", value: ord, href: "/admin/pedidos", detail: "Todos os status" },
    { label: "Usuários ativos", value: usr, href: "/admin/usuarios", detail: "Contas habilitadas" },
    { label: "Vendas hoje", value: brl(sales._sum.total ?? 0), href: "/admin/pedidos", detail: "Pagamentos aprovados" },
  ];

  const queues = [
    { label: "Pedidos aguardando", value: pendingOrders, href: "/admin/pedidos", tone: "text-amber-300" },
    { label: "Tickets abertos", value: openTickets, href: "/admin/suporte", tone: "text-sky-300" },
    { label: "Candidaturas novas", value: pendingApplications, href: "/admin/candidaturas", tone: "text-emerald-300" },
    { label: "Avaliações pendentes", value: pendingReviews + pendingServerReviews, href: "/admin/avaliacoes", tone: "text-violet-300" },
  ];

  const statusLabels: Record<string, string> = {
    PENDING: "Pendente",
    APPROVED: "Aprovado",
    PROCESSING: "Processando",
    COMPLETED: "Concluído",
    CANCELED: "Cancelado",
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mut">Visão geral</p>
          <h1 className="mt-1 text-2xl font-bold">Painel de operação</h1>
          <p className="mt-1 text-sm text-mut">Acompanhe filas importantes e atividade recente da loja.</p>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="btn-o min-h-11 inline-flex items-center justify-center">Abrir loja</a>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <a key={metric.label} href={metric.href} className="min-w-0 rounded-xl border border-white/10 bg-card p-4 transition hover:border-white/25 hover:bg-white/[0.06]">
            <p className="truncate text-xs text-mut">{metric.label}</p>
            <p className="mt-2 truncate text-xl font-black">{metric.value}</p>
            <p className="mt-1 truncate text-[11px] text-mut">{metric.detail}</p>
          </a>
        ))}
      </div>

      <section className="mt-6 rounded-xl border border-white/10 bg-card p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold">Precisa de atenção</h2>
            <p className="mt-1 text-xs text-mut">Itens que aguardam uma ação da equipe.</p>
          </div>
          <span className="text-xs text-mut">{queues.reduce((total, item) => total + item.value, 0)} em aberto</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {queues.map((item) => (
            <a key={item.label} href={item.href} className="flex min-h-16 items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 transition hover:border-white/25 hover:bg-white/[0.06]">
              <span className="text-sm leading-snug text-white/75">{item.label}</span>
              <span className={`text-xl font-black tabular-nums ${item.tone}`}>{item.value}</span>
            </a>
          ))}
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <section className="min-w-0 rounded-xl border border-white/10 bg-card p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Vendas nos últimos 7 dias</h2>
              <p className="mt-1 text-xs text-mut">Somente pedidos aprovados</p>
            </div>
            <a href="/admin/pedidos" className="shrink-0 text-xs underline underline-offset-4">Ver pedidos</a>
          </div>
          <div className="flex h-40 items-end gap-2">
            {days.map((d) => (
              <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-1 self-stretch text-[10px] text-mut">
                <div className="flex w-full flex-1 items-end">
                  <div
                    title={brl(d.value)}
                    style={{ height: `${(d.value / max) * 100}%` }}
                    className="w-full min-h-1 rounded-t bg-gradient-to-t from-blue-500 to-cyan-400"
                  />
                </div>
                {d.label}
              </div>
            ))}
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-white/10 bg-card p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Pedidos recentes</h2>
              <p className="mt-1 text-xs text-mut">Últimas movimentações recebidas</p>
            </div>
            <a href="/admin/pedidos" className="shrink-0 text-xs underline underline-offset-4">Todos</a>
          </div>
          {recentOrders.length ? (
            <div className="divide-y divide-white/10">
              {recentOrders.map((order) => (
                <a key={order.id} href="/admin/pedidos" className="flex min-w-0 items-center justify-between gap-3 py-3 first:pt-1 last:pb-1">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{order.user.name}</span>
                    <span className="mt-1 block text-xs text-mut">{order.items.length} {order.items.length === 1 ? "item" : "itens"} · {order.createdAt.toLocaleDateString("pt-BR")}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-semibold">{brl(order.total)}</span>
                    <span className="mt-1 block text-xs text-mut">{statusLabels[order.status] || order.status}</span>
                  </span>
                </a>
              ))}
            </div>
          ) : <p className="py-4 text-sm text-mut">Ainda não há pedidos.</p>}
        </section>
      </div>

      <section className="mt-4 rounded-xl border border-white/10 bg-card p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Mais vendidos</h2>
            <p className="mt-1 text-xs text-mut">Por quantidade de itens em pedidos</p>
          </div>
          <a href="/admin/produtos" className="shrink-0 text-xs underline underline-offset-4">Catálogo</a>
        </div>
        {!top.length && <p className="text-sm text-mut">Sem vendas ainda.</p>}
        {top.map((t) => (
          <div key={t.productId} className="flex items-center justify-between gap-3 border-b border-white/5 py-2 text-sm last:border-0">
            <span className="truncate">{names.find((n) => n.id === t.productId)?.name}</span>
            <b className="shrink-0 tabular-nums">{t._count.productId}</b>
          </div>
        ))}
      </section>
    </>
  );
}
