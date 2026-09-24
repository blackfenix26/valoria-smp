import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const admin = await db.user.upsert({
    where: { email: "frosth@valoria" },
    update: {
      role: "ADMIN",
      active: true,
      name: "Frosth",
      username: "frosth",
    },
    create: {
      name: "Frosth",
      username: "frosth",
      email: "frosth@valoria",
      passwordHash: await bcrypt.hash("fh1626", 10),
      role: "ADMIN",
    },
  });

  const cat = async (name: string) => db.category.upsert({ where: { name }, update: {}, create: { name } });
  const [ranks, kits, moedas, cosm] = await Promise.all(["Ranks", "Kits", "Moedas", "Cosméticos"].map(cat));

  const products = [
    ["Aliança Real", "Vantagens exclusivas para membros da realeza.", "/assets/alianca-real.png", 35, ranks.id, true],
    ["Tesouro Imperial", "Baú repleto de itens raros do império.", "/assets/tesouro-imperial.png", 23, kits.id, true],
    ["Fortuna Real", "Moedas e recursos para sua jornada.", "/assets/fortuna-real.png", 17, moedas.id, true],
    ["Bolsa do Mercador", "Itens úteis para negociar em Valoria.", "/assets/bolsa-do-mercador.png", 12, kits.id, true],
    ["Caixa Mística", "Abra e descubra itens incríveis.", "/assets/cubo-roxo.png", 14.9, cosm.id, false],
  ] as const;

  for (const [name, description, image, price, categoryId, featured] of products) {
    if (!(await db.product.findFirst({ where: { name } }))) {
      await db.product.create({ data: { name, description, image, price, categoryId, featured } });
    }
  }

  const demo = await db.user.upsert({
    where: { email: "jogador@valoria.gg" },
    update: {},
    create: {
      name: "ZyzzBR",
      username: "zyzzbr",
      email: "jogador@valoria.gg",
      passwordHash: await bcrypt.hash("jogador123", 10),
    },
  });

  const first = await db.product.findFirst();
  if (first && !(await db.review.count())) {
    await db.review.create({
      data: {
        userId: demo.id,
        productId: first.id,
        stars: 5,
        comment: "Comprei meu primeiro rank e fiquei impressionado com a qualidade!",
      },
    });
  }

  for (const [key, value] of [["footer_text", "Uma experiência Minecraft criada para aventureiros."], ["link_discord", "#"]]) {
    await db.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  const now = Date.now();
  if (!(await db.event.count())) {
    await db.event.create({
      data: {
        name: "Temporada Valoria: Ascensão",
        image: "/assets/cubo-roxo.png",
        description: "Participe do evento e desbloqueie recompensas exclusivas.",
        startsAt: new Date(now),
        endsAt: new Date(now + 30 * 864e5),
      },
    });
  }

  if (!(await db.update.findFirst({ where: { title: "Nova Temporada: Ascensão" } }))) {
    await db.update.create({
      data: {
        title: "Nova Temporada: Ascensão",
        summary: "Participe e desbloqueie recompensas exclusivas.",
        content: "Detalhes da temporada...",
        category: "EVENTO",
        status: "PUBLISHED",
        authorId: admin.id,
      },
    });
  }
}

main().finally(() => db.$disconnect());
