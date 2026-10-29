import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Crown, ImageIcon, PlayCircle, ShieldCheck, Sparkles } from "lucide-react";
import { getSession } from "@/lib/auth";
import { db, getSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Reino({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [realm, settings, session] = await Promise.all([
    db.realm.findFirst({ where: { id, active: true } }),
    getSettings(),
    getSession(),
  ]);

  if (!realm) notFound();

  let gallery: string[] = [];
  let specialties: string[] = [];
  let alliances: string[] = [];

  try {
    gallery = JSON.parse(realm.gallery || "[]");
  } catch {
    gallery = (realm.gallery || "").split(/\r?\n/).filter(Boolean);
  }

  specialties = (realm.specialties || "").split(/\r?\n/).filter(Boolean);
  alliances = (realm.alliances || "").split(/\r?\n/).filter(Boolean);

  const premiumProduct = realm.premium ? null : await db.product.findFirst({
    where: { id: settings.realm_feature_product_id, active: true },
    select: { id: true },
  });

  const account = session ? await db.user.findUnique({
    where: { id: session.id },
    select: { email: true },
  }) : null;

  const isLeader = !!(account?.email && realm.leaderEmail && account.email.toLowerCase() === realm.leaderEmail.toLowerCase());

  return <main className="page-shell max-w-7xl">
    <Link href="/reinos" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-200 transition hover:text-white"><ArrowLeft size={16}/> Voltar aos reinos</Link>
    <header className="realm-detail-hero relative mb-8 overflow-hidden rounded-[30px] border border-white/10">
      {realm.banner && <img src={realm.banner} alt={`Banner do reino ${realm.name}`} className="h-[260px] w-full object-cover sm:h-[360px]"/>}
      <div className="relative flex flex-col gap-5 p-5 sm:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: realm.color }} />
          <h1 className="text-3xl font-black sm:text-5xl">{realm.name}</h1>
          {realm.featured && <span className="rounded-full border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[.15em]">Reino em destaque</span>}
        </div>
        <p className="text-lg text-mut">Liderado por {realm.leader}</p>
        <p className="max-w-3xl whitespace-pre-line text-base leading-8 text-mut">{realm.description}</p>
      </div>
    </header>

    <section className="grid gap-5 md:grid-cols-2">
      {realm.premium && realm.story && <article className="glass rounded-[24px] p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2"><Sparkles size={17} className="text-violet-300"/><h2 className="text-xl font-bold">História e cultura</h2></div>
        <p className="whitespace-pre-line text-sm leading-7 text-mut">{realm.story}</p>
      </article>}

      {specialties.length > 0 && <article className="glass rounded-[24px] p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2"><ShieldCheck size={17} className="text-emerald-300"/><h2 className="text-xl font-bold">Especialidades</h2></div>
        <ul className="space-y-2 text-sm text-mut">
          {specialties.map((item) => <li key={item} className="rounded-xl border border-white/10 bg-surf/50 px-3 py-2">{item}</li>)}
        </ul>
      </article>}

      {realm.premium && realm.commerce && <article className="glass rounded-[24px] p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2"><Crown size={17} className="text-amber-300"/><h2 className="text-xl font-bold">Produtos e comércio</h2></div>
        <p className="whitespace-pre-line text-sm leading-7 text-mut">{realm.commerce}</p>
      </article>}

      {realm.premium && realm.news && <article className="glass rounded-[24px] p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2"><Sparkles size={17} className="text-blue-300"/><h2 className="text-xl font-bold">Últimas novidades</h2></div>
        <p className="whitespace-pre-line text-sm leading-7 text-mut">{realm.news}</p>
      </article>}

      {realm.premium && alliances.length > 0 && <article className="glass rounded-[24px] p-5 sm:p-6 md:col-span-2">
        <div className="mb-3 flex items-center gap-2"><ShieldCheck size={17} className="text-violet-300"/><h2 className="text-xl font-bold">Alianças</h2></div>
        <ul className="grid gap-2 md:grid-cols-2 text-sm text-mut">
          {alliances.map((item) => <li key={item} className="rounded-xl border border-white/10 bg-surf/50 px-3 py-2">{item}</li>)}
        </ul>
      </article>}
    </section>

    {realm.premium && gallery.length > 0 && <section className="mt-8">
      <div className="mb-4 flex items-center gap-2"><ImageIcon size={18} className="text-blue-300"/><h2 className="text-xl font-bold">Galeria</h2></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((src, index) => <img key={`${src}-${index}`} src={src} alt={`${realm.name}, imagem ${index + 1}`} className="aspect-video w-full rounded-[20px] object-cover border border-white/10" />)}
      </div>
    </section>}

    {realm.premium && realm.videoUrl && <section className="mt-8 rounded-[24px] border border-white/10 bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2"><PlayCircle size={18} className="text-violet-300"/><h2 className="text-xl font-bold">Vídeo do reino</h2></div>
      <a href={realm.videoUrl} target="_blank" rel="noreferrer" className="btn-o inline-flex items-center gap-2">Assistir apresentação</a>
    </section>}

    {premiumProduct && !isLeader && <p className="mt-8 text-sm text-mut">O destaque está disponível apenas para o líder do reino. A compra precisa ser feita com a conta associada ao e-mail cadastrado para o líder.</p>}
    {premiumProduct && isLeader && <Link href={`/produtos/${premiumProduct.id}?realmId=${realm.id}`} className="btn-o mt-6 inline-flex">Destacar meu reino</Link>}
    {realm.premium && <p className="mt-8 text-xs text-mut">O destaque é apenas uma vitrine no site e não concede vantagens competitivas dentro do jogo.</p>}
  </main>;
}
