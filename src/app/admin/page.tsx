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
      where: { order: { is: { status: "APPROVED" } } },
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

  const quickActions = [
    { label: "Pedidos pendentes", value: pendingOrders, href: "/admin/pedidos", tone: "amber", accent: "Aprovar" },
    { label: "Tickets abertos", value: openTickets, href: "/admin/suporte", tone: "sky", accent: "Atender" },
    { label: "Candidaturas", value: pendingApplications, href: "/admin/candidaturas", tone: "emerald", accent: "Revisar" },
    { label: "Avaliações", value: pendingReviews + pendingServerReviews, href: "/admin/avaliacoes", tone: "violet", accent: "Validar" },
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
          <p className="admin-eyebrow">Visão geral</p>
          <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">Painel de operação</h1>
          <p className="mt-1 text-sm text-mut">Acompanhe as pendências, as vendas e as últimas movimentações da loja.</p>
        </div>
      </div>

      <section className="admin-hero-panel mb-5 rounded-[28px] border border-white/10 bg-[#0d1320]/90 p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300/80">Operação Valória</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-white sm:text-3xl">Resumo executivo da loja</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">Acesse diretamente as filas que precisam de atenção e resolva cada item sem percorrer o menu.</p>
          </div>

          <div className="grid w-full gap-2 sm:grid-cols-2 xl:max-w-xl xl:grid-cols-2">
            {quickActions.map((item) => (
              <a key={item.label} href={item.href} className={`admin-quick-stat admin-quick-stat-${item.tone} min-w-0 rounded-2xl border p-3 transition hover:-translate-y-0.5`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">{item.value ? item.accent : "Tudo em dia"}</span>
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
                </div>
                <div className="mt-4 flex items-end justify-between gap-2">
                  <div>
                    <p className="text-[11px] text-white/65">{item.label}</p>
                    <p className="mt-1 text-2xl font-black tracking-[-0.04em] text-white">{item.value}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/10 px-2 py-1 text-[10px] font-semibold text-white/70">Abrir fila</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <a key={metric.label} href={metric.href} className="admin-metric-card min-w-0 rounded-2xl border border-white/10 bg-card p-4 transition hover:-translate-y-1 hover:border-blue-400/30 hover:shadow-[0_18px_40px_rgba(37,99,235,0.15)] sm:p-5">
            <p className="truncate text-[10px] font-bold uppercase tracking-[.13em] text-mut">{metric.label}</p>
            <p className="mt-3 truncate text-2xl font-black tabular-nums text-white">{metric.value}</p>
            <p className="mt-1 truncate text-[11px] text-mut">{metric.detail}</p>
          </a>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="admin-dashboard-section min-w-0 rounded-2xl border border-white/10 bg-card p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-white">Vendas nos últimos 7 dias</h2>
              <p className="mt-1 text-xs text-mut">Somente pedidos aprovados</p>
            </div>
            <a href="/admin/pedidos" className="shrink-0 text-xs font-semibold text-blue-300 underline underline-offset-4">Ver pedidos</a>
          </div>
          <div className="flex h-40 items-end gap-2">
            {days.map((d) => (
              <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-1 self-stretch text-[10px] text-mut">
                <div className="flex w-full flex-1 items-end">
                  <div
                    title={brl(d.value)}
                    style={{ height: `${(d.value / max) * 100}%` }}
                    className="w-full min-h-1 rounded-t-xl bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400 shadow-[0_10px_25px_rgba(59,130,246,0.35)]"
                  />
                </div>
                <span className="uppercase">{d.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-dashboard-section min-w-0 rounded-2xl border border-white/10 bg-card p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-white">Mais vendidos</h2>
              <p className="mt-1 text-xs text-mut">Itens em pedidos aprovados</p>
            </div>
            <a href="/admin/produtos" className="shrink-0 text-xs font-semibold text-blue-300 underline underline-offset-4">Catálogo</a>
          </div>
          {!top.length && <p className="text-sm text-mut">Sem vendas aprovadas ainda.</p>}
          <div className="space-y-2">
            {top.map((t, index) => (
              <div key={t.productId} className="admin-popular-item flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm last:border-0">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-blue-500/15 text-[10px] font-bold text-blue-300">#{index + 1}</span>
                  <span className="truncate text-white/80">{names.find((n) => n.id === t.productId)?.name}</span>
                </div>
                <b className="shrink-0 tabular-nums text-white">{t._count.productId}</b>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="admin-dashboard-section mt-4 min-w-0 rounded-2xl border border-white/10 bg-card p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-white">Pedidos recentes</h2>
              <p className="mt-1 text-xs text-mut">Últimas movimentações recebidas</p>
            </div>
            <a href="/admin/pedidos" className="shrink-0 text-xs font-semibold text-blue-300 underline underline-offset-4">Todos</a>
          </div>
          {recentOrders.length ? (
            <div className="divide-y divide-white/10">
              {recentOrders.map((order) => (
                <a key={order.id} href="/admin/pedidos" className="flex min-w-0 items-center justify-between gap-3 py-3 first:pt-1 last:pb-1">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-white">{order.user.name}</span>
                    <span className="mt-1 block text-xs text-mut">{order.items.length} {order.items.length === 1 ? "item" : "itens"} · {order.createdAt.toLocaleDateString("pt-BR")}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-semibold text-white">{brl(order.total)}</span>
                    <span className="mt-1 block text-xs text-mut">{statusLabels[order.status] || order.status}</span>
                  </span>
                </a>
              ))}
            </div>
          ) : <p className="py-4 text-sm text-mut">Ainda não há pedidos.</p>}
      </section>
    </>
  );
}
