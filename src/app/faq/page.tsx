import Link from "next/link";
import { db } from "@/lib/db";
import KnowledgeSearch from "@/components/KnowledgeSearch";

const FAQ = [
  {
    q: "Como funciona a compra na loja?",
    a: "Você escolhe o produto, adiciona ao carrinho, conclui o checkout e aguarda a confirmação do pagamento ou da aprovação do pedido.",
  },
  {
    q: "Quando o produto fica disponível?",
    a: "Após a aprovação do pedido, o item ou acesso fica liberado na área do cliente para que você possa utilizar ou receber o benefício correspondente.",
  },
  {
    q: "Posso acompanhar meus pedidos?",
    a: "Sim. A área do cliente possui o painel de pedidos com status, informações de pagamento e acesso ao produto liberado.",
  },
  {
    q: "E se eu tiver problema com a compra?",
    a: "Use o suporte da loja ou o setor de atendimento para abrir um ticket e receber ajuda na resolução do caso.",
  },
];

export const dynamic = "force-dynamic";
export default async function FaqPage() {
  const items = await db.fAQItem.findMany({where:{active:true},orderBy:[{category:"asc"},{sortOrder:"asc"}]});
  const entries = items.length ? items.map(item=>({category:item.category,title:item.question,content:item.answer})) : FAQ.map((item,index)=>({category:["Compras","Entrega","Pedidos","Suporte"][index],title:item.q,content:item.a}));
  return (
    <main className="page-shell">
      <div className="mb-8">
        <span className="brand-tag">Perguntas frequentes</span>
        <h1 className="section-title mt-3">FAQ da Valoria SMP</h1>
      </div>

      <p className="mb-6 max-w-2xl text-sm text-mut">Encontre respostas rápidas por pergunta ou categoria. Para explicações completas, consulte a Wiki.</p>
      <KnowledgeSearch entries={entries} faq/>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/wiki" className="btn-o">Voltar para a Wiki</Link>
        <Link href="/cliente/suporte" className="btn-p">Abrir suporte</Link>
      </div>
    </main>
  );
}
