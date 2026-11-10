import Link from "next/link";
import { ArrowLeft, Camera, Images, Search, Sparkles } from "lucide-react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import CommunityGalleryUpload from "@/components/CommunityGalleryUpload";

export const dynamic = "force-dynamic";

type SearchParams = { sort?: string; page?: string; q?: string };

export default async function Galeria({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const sort = params.sort === "oldest" ? "asc" : "desc";
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const requestedPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const pageSize = 24;
  const where = {
    status: "APPROVED",
    ...(query ? {
      OR: [
        { caption: { contains: query } },
        { user: { is: { name: { contains: query } } } },
        { user: { is: { username: { contains: query } } } },
      ],
    } : {}),
  };
  const [totalPhotos, session] = await Promise.all([
    db.communityPhoto.count({ where }),
    getSession(),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalPhotos / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const photos = await db.communityPhoto.findMany({
    where,
    orderBy: { createdAt: sort },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: { user: { select: { name: true, username: true } } },
  });
  const pageHref = (nextSort: string, nextPage: number) => {
    const search = new URLSearchParams({ sort: nextSort, page: String(nextPage) });
    if (query) search.set("q", query);
    return `/galeria?${search.toString()}`;
  };

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
      <form action="/galeria" method="get" role="search" className="community-search">
        <Search size={17} aria-hidden="true" />
        <label className="sr-only" htmlFor="gallery-search">Buscar por descrição ou membro</label>
        <input id="gallery-search" name="q" type="search" defaultValue={query} maxLength={80} placeholder="Buscar por descrição ou membro..." />
        {sort === "asc" && <input type="hidden" name="sort" value="oldest" />}
        <button type="submit">Buscar</button>
        {query && <Link href="/galeria" className="community-search-clear">Limpar</Link>}
      </form>
      <div className="community-gallery-toolbar">
        <span>{totalPhotos} {totalPhotos === 1 ? "foto publicada" : "fotos publicadas"} · Página {page} de {totalPages}</span>
        <div className="community-sort-links" aria-label="Ordenar fotos">
          <Link href={pageHref("newest", 1)} aria-current={sort === "desc" ? "page" : undefined}>Mais novas</Link>
          <Link href={pageHref("oldest", 1)} aria-current={sort === "asc" ? "page" : undefined}>Mais antigas</Link>
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
      </div> : <div className="community-empty"><Camera size={22} /><p>{query ? "Nenhuma foto encontrada. Tente outro nome ou descrição." : "A galeria ainda está vazia. Envie a primeira foto!"}</p></div>}
      {totalPages > 1 && <nav aria-label="Paginação da galeria" className="community-pagination">
        {page > 1 ? <Link href={pageHref(sort === "asc" ? "oldest" : "newest", page - 1)}>Anterior</Link> : <span aria-disabled="true">Anterior</span>}
        {page < totalPages ? <Link href={pageHref(sort === "asc" ? "oldest" : "newest", page + 1)}>Próxima</Link> : <span aria-disabled="true">Próxima</span>}
      </nav>}
    </section>
  </main>;
}
