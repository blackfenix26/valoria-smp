import Link from "next/link";

export default function Wiki() {
  return (
    <main className="page-shell">
      <div className="mb-8">
        <span className="brand-tag">Documentação</span>
        <h1 className="section-title mt-3">Wiki da Valoria SMP</h1>
        <p className="mt-3 max-w-2xl text-white/70">Tudo o que você precisa para entender regras, módulos, acessos e rotina da comunidade.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          ["Regras da comunidade", "Conheça as normas, condutas e políticas para manter a experiência justa e segura."],
          ["Como comprar e ativar um produto", "Entenda o processo de checkout, aprovação e liberação do item ou benefício adquirido."],
          ["Acesso ao painel do cliente", "Saiba onde verificar pedidos, suporte, produtos liberados e informações da sua conta."],
          ["Eventos e temporadas", "Veja como funcionam as promoções, recompensas e campanhas especiais do servidor."],
          ["Suporte técnico", "Acesse o centro de ajuda para tirar dúvidas sobre compras, permissões e acesso."],
          ["Perguntas frequentes", "Resposta rápida para dúvidas comuns sobre planos, produtos e comunidade."],
        ].map(([title, text]) => (
          <div key={title} className="glass p-5">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">{text}</p>
          </div>
        ))}
      </div>

      <div className="glass mt-8 p-5">
        <h2 className="text-xl font-black">Guia rápido</h2>
        <ul className="mt-4 space-y-3 text-sm text-white/75">
          <li>1. Faça seu cadastro e acesse a área do cliente.</li>
          <li>2. Escolha um produto ou plano na loja e conclua o checkout.</li>
          <li>3. Aguarde a confirmação do pagamento ou aprovação do pedido.</li>
          <li>4. Acesse seus itens liberados no painel do cliente.</li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/produtos" className="btn-p">Ver produtos</Link>
          <Link href="/faq" className="btn-o">Ir para FAQ</Link>
        </div>
      </div>
    </main>
  );
}

