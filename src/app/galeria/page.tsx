import Link from "next/link";
import { ArrowLeft, Camera, Images, Sparkles } from "lucide-react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import CommunityGalleryUpload from "@/components/CommunityGalleryUpload";

export const dynamic = "force-dynamic";

type SearchParams = { sort?: string; page?: string };

export default async function Galeria({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const sort = params.sort === "oldest" ? "asc" : "desc";
  const requestedPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const pageSize = 24;
  const [totalPhotos, session] = await Promise.all([
    db.communityPhoto.count({ where: { status: "APPROVED" } }),
    getSession(),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalPhotos / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const photos = await db.communityPhoto.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: sort },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: { user: { select: { name: true, username: true } } },
  });

  return <main className="page-shell max-w-7xl">
    <header className="community-hero">
      <div className="community-hero-mark"><Sparkles size={150} /></div>
      <div className="relative max-w-3xl">
        <Link href="/comunidade" className="community-text-link"><ArrowLeft size={15} /> Voltar à comunidade</Link>
        <span className="brand-tag mt-5"><Images size={14} /> Momentos dos jogadores</span>
        <h1 className="mt-4 text-3xl font-black sm:text-5xl">Galeria pública</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-mut sm:text-base">Compartilhe seus melhores momentos em Valoria. As fotos aprovadas pela equipe ficam disponíveis para toda a comunidade.</p>
      </div>
    </header>

    <section className="community-section" aria-labelledby="community-gallery">
      <div className="community-section-heading">
        <div><span className="section-kicker"><Camera size={13} /> Feita por vocês</span><h2 id="community-gallery">Fotos da comunidade</h2><p>Envios revisados e aprovados pela equipe.</p></div>
      </div>
      <CommunityGalleryUpload signedIn={Boolean(session)} />
      <div className="community-gallery-toolbar">
        <span>{totalPhotos} {totalPhotos === 1 ? "foto publicada" : "fotos publicadas"} · Página {page} de {totalPages}</span>
        <div className="community-sort-links" aria-label="Ordenar fotos">
          <Link href="/galeria?sort=newest" aria-current={sort === "desc" ? "page" : undefined}>Mais novas</Link>
          <Link href="/galeria?sort=oldest" aria-current={sort === "asc" ? "page" : undefined}>Mais antigas</Link>
        </div>
      </div>
      {photos.length ? <div className="community-gallery-grid">
        {photos.map(photo => <article key={photo.id} className="community-photo-card">
          <img src={photo.imageUrl} alt={photo.caption || `Foto enviada por ${photo.user.name}`} loading="lazy" />
          <div className="community-photo-caption">
            <p>{photo.caption || "Um momento da comunidade"}</p>
            <span>Por {photo.user.name} · {photo.createdAt.toLocaleDateString("pt-BR")}</span>
          </div>
        </article>)}
      </div> : <div className="community-empty"><Camera size={22} /><p>A galeria ainda está vazia. Envie a primeira foto!</p></div>}
      {totalPages > 1 && <nav aria-label="Paginação da galeria" className="community-pagination">
        {page > 1 ? <Link href={`/galeria?sort=${sort === "asc" ? "oldest" : "newest"}&page=${page - 1}`}>Anterior</Link> : <span aria-disabled="true">Anterior</span>}
        {page < totalPages ? <Link href={`/galeria?sort=${sort === "asc" ? "oldest" : "newest"}&page=${page + 1}`}>Próxima</Link> : <span aria-disabled="true">Próxima</span>}
      </nav>}
    </section>
  </main>;
}
