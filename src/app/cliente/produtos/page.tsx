import Link from "next/link"; import { db } from "@/lib/db"; import { getSession } from "@/lib/auth"; export const dynamic = "force-dynamic";
export default async function MeusProdutos(){
  const s = (await getSession())!;
  const items = await db.orderItem.findMany({
    where: { order: { userId: s.id, status: { in: ["APPROVED", "COMPLETED", "PROCESSING"] } } },
    include: { product: true, order: true },
    orderBy: { order: { createdAt: "desc" } }
  });
  return <><h1 className="mb-4 text-2xl font-bold">Meus Produtos</h1>{!items.length&&<p className="text-mut">Seus produtos aparecem aqui depois que o pagamento for aprovado.</p>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map(i=><div key={i.id} className="overflow-hidden rounded-2xl border border-white/10 bg-card"><img src={i.product.image} alt="" className="h-32 w-full object-cover"/>
      <div className="space-y-2 p-4 text-sm"><b>{i.product.name}</b><p className="text-xs text-mut">Comprado em {i.order.createdAt.toLocaleDateString("pt-BR")} · <span className="text-emerald-400">Disponível</span></p>
        <div className="flex gap-2 text-xs">
          <Link href={`/produtos/${i.productId}`} className="text-vio2">Ver produto</Link>
          {i.order.deliveryUrl && <><span className="text-muted">•</span><Link href={i.order.deliveryUrl} className="text-vio2">Acessar entrega</Link></>}
        </div>
        {i.order.deliveryCode && <p className="break-all rounded-lg bg-surf p-2 text-[10px] text-vio2">Código de entrega: {i.order.deliveryCode}</p>}
      </div></div>)}</div></>;
}
