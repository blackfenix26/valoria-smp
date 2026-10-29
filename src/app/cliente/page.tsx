import { redirect } from "next/navigation";
import { db, publishedUpdates } from "@/lib/db";
import { getSession } from "@/lib/auth";
import UpdateCard from "@/components/UpdateCard";
import Link from "next/link";

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

  const [u, orderCount, pendingCount, purchasedAggregate, ticketCount, recentOrders, purchasedItems, upd] = await Promise.all([
    db.user.findUnique({ where: { id: s.id }, select: { id: true, name: true, email: true, username: true, credits: true } }),
    db.order.count({ where: { userId: s.id } }),
    db.order.count({ where: { userId: s.id, paymentStatus: "PENDING", status: { not: "CANCELED" } } }),
    db.orderItem.aggregate({ where: { order: { userId: s.id, paymentStatus: "APPROVED", status: { not: "CANCELED" } } }, _sum: { quantity: true } }),
    db.ticket.count({ where: { userId: s.id, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    db.order.findMany({ where: { userId: s.id }, orderBy: { createdAt: "desc" }, take: 5, include: { items: { include: { product: { select: { name: true } } } } } }),
    db.orderItem.findMany({ where: { order: { userId: s.id, paymentStatus: "APPROVED", status: { not: "CANCELED" } } }, orderBy: { order: { createdAt: "desc" } }, take: 4, include: { product: { select: { name: true, image: true } }, order: { select: { createdAt: true } } } }),
    publishedUpdates(3),
  ]);

  if (!u) redirect("/login");

  const statusLabel = (status: string) => status === "PENDING" ? "Aguardando pagamento" : status === "APPROVED" ? "Pago" : status === "PROCESSING" ? "Em processamento" : status === "COMPLETED" ? "Concluído" : status === "CANCELED" ? "Cancelado" : status;

  return (
    <div className="space-y-6">
      <div className="client-welcome rounded-3xl border border-white/10 p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mut">Painel do jogador</p>
        <h1 className="mt-2 text-3xl font-black">Olá, {u.name}.</h1>
        <p className="mt-2 text-sm text-mut">Acompanhe seus pagamentos, entregas e novidades da Valória em um só lugar.</p>
        <div className="mt-5 flex flex-wrap gap-3"><Link href="/produtos" className="btn-p">Explorar a loja</Link><Link href="/cliente/suporte" className="btn-o">Precisa de ajuda?</Link></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Pedidos realizados", orderCount, "/cliente/pedidos"],
          ["Aguardando pagamento", pendingCount, "/cliente/pedidos"],
          ["Unidades liberadas", purchasedAggregate._sum.quantity ?? 0, "/cliente/produtos"],
          ["Tickets em andamento", ticketCount, "/cliente/suporte"],
        ].map(([label, value, href]) => (
          <Link key={String(label)} href={String(href)} className="client-metric rounded-2xl border border-white/10 bg-card p-4 transition hover:-translate-y-0.5 hover:border-white/25 sm:p-5">
            <p className="text-xs text-mut">{label}</p><p className="mt-3 text-2xl font-black">{String(value)}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold">Pedidos recentes</h2><p className="mt-1 text-xs text-mut">Status e próximos passos</p></div><Link href="/cliente/pedidos" className="text-xs font-semibold underline underline-offset-4">Ver todos</Link></div>
          {!recentOrders.length ? <div className="rounded-xl border border-dashed border-white/15 p-5 text-center"><p className="text-sm text-mut">Seus pedidos aparecerão aqui.</p><Link href="/produtos" className="mt-3 inline-flex text-sm font-semibold underline underline-offset-4">Ver produtos</Link></div> : <div className="space-y-2">{recentOrders.map(order => <Link key={order.id} href={`/cliente/pedidos?order=${order.id}`} className="block rounded-xl border border-white/10 bg-surf p-3 transition hover:border-white/25"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs text-mut">Pedido #{order.id.slice(-6).toUpperCase()} · {order.createdAt.toLocaleDateString("pt-BR")}</p><p className="mt-1 truncate text-sm font-semibold">{order.items.map(item => item.product.name).join(", ")}</p></div><span className="shrink-0 rounded-full border border-white/15 px-2 py-1 text-[10px]">{statusLabel(order.status)}</span></div></Link>)}</div>}
        </section>

        <section className="rounded-2xl border border-white/10 bg-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold">Entregas liberadas</h2><p className="mt-1 text-xs text-mut">Produtos com pagamento aprovado</p></div><Link href="/cliente/produtos" className="text-xs font-semibold underline underline-offset-4">Abrir produtos</Link></div>
          {!purchasedItems.length ? <div className="rounded-xl border border-dashed border-white/15 p-5 text-center"><p className="text-sm text-mut">Nenhuma entrega liberada ainda.</p><p className="mt-1 text-xs text-mut">Após a aprovação do pagamento, seus produtos aparecem aqui.</p></div> : <div className="space-y-2">{purchasedItems.map((item,index)=><div key={`${item.id}-${index}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-surf p-3"><img src={item.product.image} alt="" className="h-11 w-11 rounded-lg object-cover"/><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.product.name}</p><p className="text-xs text-mut">{item.order.createdAt.toLocaleDateString("pt-BR")}</p></div><span className="text-xs text-emerald-300">Liberado</span></div>)}</div>}
        </section>
      </div>

      <section><div className="mb-3 flex items-end justify-between"><div><h2 className="text-lg font-bold">Novidades da comunidade</h2><p className="mt-1 text-xs text-mut">Atualizações recentes da Valória</p></div><Link href="/atualizacoes" className="text-xs font-semibold underline underline-offset-4">Ver todas</Link></div>{upd.length?<div className="grid gap-4 md:grid-cols-3">{upd.map(update=><UpdateCard key={update.id} u={update}/>)}</div>:<p className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-mut">Nenhuma novidade publicada no momento.</p>}</section>
    </div>
  );
}

