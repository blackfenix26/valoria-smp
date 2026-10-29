# Valoria SMP — plataforma completa
Next.js 14 (App Router) · TypeScript · Tailwind · Prisma · Lucide

## Rodar localmente
1. Copie `.env.example` para `.env`
2. Ajuste `AUTH_SECRET` para uma string forte
3. Mantenha `DATABASE_URL="file:./dev.db"` para o banco SQLite local
4. Instale as dependências e inicie o ambiente:
   `npm install`
   `npm run dev`
5. O comando de desenvolvimento prepara automaticamente o banco SQLite local sem alterar o schema PostgreSQL usado em produção. Acesse: http://localhost:3000

Para inserir os dados demonstrativos uma única vez, rode `npm run seed` depois de iniciar o ambiente local.

Credenciais padrão do admin:
- e-mail: frosth@valoria.com
- senha: fh1626

## Mapa
- Público: `/`, `/produtos`, `/produtos/[id]`, `/carrinho`, `/atualizacoes`, `/wiki`, `/login`
- Cliente (`/cliente/*`): painel, pedidos, produtos, favoritos, suporte, configurações
- Admin (`/admin/*`, só ADMIN): dashboard, atualizações, produtos, categorias, pedidos, usuários, cupons, eventos, banners, suporte, configurações e logs

## Produção
Para publicar em produção real, o projeto já está preparado para um setup Next.js profissional, mas ainda precisa de um provedor externo de banco e host.

### Recomendado
- Host: Vercel / Render / VPS
- Banco: PostgreSQL (Neon, Supabase, Railway ou VPS)
- Storage: Cloudinary ou S3
- Domínio: HTTPS com DNS apontando para o host

### Ajustes mínimos
- troque `DATABASE_URL` para a URL do banco de produção
- configure `AUTH_SECRET` com valor forte e único
- configure `NEXT_PUBLIC_APP_URL` com a URL pública real
- se for deploy em Vercel, garanta que as variáveis de ambiente estejam setadas no painel do projeto

### Pagamento e pedidos
- a lógica de pedidos está pronta no backend
- para produção, conecte um gateway real de pagamento (Mercado Pago, Stripe, Pix provider ou outro)
- ao receber confirmação do pagamento, atualize o pedido para `APPROVED` via webhook/admin

### Resgate de produtos no Minecraft
- códigos `VLR-XXXXXX` são criados por unidade somente quando o pedido é aprovado
- configure `MINECRAFT_REDEEM_SECRET` como variável de ambiente forte no host e no plugin; não reutilize o exemplo do `.env.example`
- o plugin deve chamar `POST /api/redeem` com `Authorization: Bearer <segredo>` e JSON `{ "code": "VLR-ABC234", "playerName": "Jogador" }`
- sucesso retorna `product.id`, `product.name`, `product.deliveryType` e `product.deliveryInfo`; o plugin executa a entrega configurada para o produto
- um código usado retorna HTTP `409`; pedidos pendentes ou cancelados não podem ser resgatados
- a API usa claim atômico, portanto duas chamadas simultâneas não conseguem usar o mesmo código

### Deploy no Vercel
1. Conecte o repositório no Vercel
2. Defina as variáveis de ambiente do `.env.example`
3. Garanta que o banco de produção exista e a URL esteja correta
4. Faça o deploy
5. Teste login, painel admin e fluxo de compra em produção

> O código já está pronto para subir em produção, mas o host externo e as credenciais de banco/deploy precisam existir para a publicação pública final.
