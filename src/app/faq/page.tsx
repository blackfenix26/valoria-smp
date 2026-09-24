import Link from "next/link";

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

export default function FaqPage() {
  return (
    <main className="page-shell">
      <div className="mb-8">
        <span className="brand-tag">Perguntas frequentes</span>
        <h1 className="section-title mt-3">FAQ da Valoria BLCKX</h1>
      </div>

      <div className="space-y-4">
        {FAQ.map((item) => (
          <div key={item.q} className="glass p-5">
            <h2 className="text-lg font-bold text-white">{item.q}</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">{item.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/wiki" className="btn-o">Voltar para a Wiki</Link>
        <Link href="/cliente/suporte" className="btn-p">Abrir suporte</Link>
      </div>
    </main>
  );
}
