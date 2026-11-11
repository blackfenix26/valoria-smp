import Link from "next/link";
import { ImagePlus } from "lucide-react";
import { db } from "@/lib/db";
import CommunityPhotoModeration from "@/components/CommunityPhotoModeration";

export const dynamic = "force-dynamic";

type SearchParams = { status?: string; q?: string; page?: string };
const PAGE_SIZE = 24;
const STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

export default async function AdminCommunity({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const status = STATUSES.includes(params.status as (typeof STATUSES)[number])
    ? params.status as (typeof STATUSES)[number]
    : "PENDING";
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const requestedPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const where = {
    status,
    ...(query ? {
      OR: [
        { caption: { contains: query, mode: "insensitive" as const } },
        { user: { is: { name: { contains: query, mode: "insensitive" as const } } } },
        { user: { is: { username: { contains: query, mode: "insensitive" as const } } } },
      ],
    } : {}),
  };
  const [counts, total] = await Promise.all([
    Promise.all(STATUSES.map(value => db.communityPhoto.count({ where: { status: value } }))),
    db.communityPhoto.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, pages);
  const photos = await db.communityPhoto.findMany({
    where,
    orderBy: { createdAt: status === "PENDING" ? "asc" : "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      user: { select: { name: true, username: true } },
      reviewer: { select: { name: true, username: true } },
    },
  });
  const href = (nextStatus: string, nextPage = 1) => {
    const search = new URLSearchParams({ status: nextStatus, page: String(nextPage) });
    if (query) search.set("q", query);
    return `/admin/comunidade?${search.toString()}`;
  };

  return <div className="space-y-5">
    <header className="admin-page-heading">
      <p className="admin-eyebrow">Moderação</p>
      <h1 className="mt-1 flex items-center gap-2 text-2xl font-black"><ImagePlus size={22} className="text-blue-400" /> Galeria da comunidade</h1>
      <p className="mt-2 text-sm text-mut">Revise envios, acompanhe o histórico e encontre fotos por descrição ou membro.</p>
    </header>
    <div className="community-admin-stats">
      {STATUSES.map((value, index) => {
        const label = ["Aguardando", "Publicadas", "Recusadas"][index];
        return <Link key={value} href={href(value)} aria-current={status === value ? "true" : undefined} className={`community-admin-stat${status === value ? " is-active" : ""}`}>
          <span>{label}</span><strong>{counts[index]}</strong>
        </Link>;
      })}
    </div>
    <form action="/admin/comunidade" method="get" role="search" className="community-search">
      <label className="sr-only" htmlFor="community-admin-search">Buscar por descrição ou membro</label>
      <input id="community-admin-search" name="q" type="search" defaultValue={query} maxLength={80} placeholder="Buscar por descrição ou membro..." />
      <input type="hidden" name="status" value={status} />
      <button type="submit">Buscar</button>
      {query && <Link href={href(status)} className="community-search-clear">Limpar</Link>}
    </form>
    <div className="community-admin-results">{total} {total === 1 ? "foto" : "fotos"} · Página {page} de {pages}</div>
    <CommunityPhotoModeration photos={photos} status={status} />
    {pages > 1 && <nav aria-label="Paginação da moderação" className="community-pagination">
      {page > 1 ? <Link href={href(status, page - 1)}>Anterior</Link> : <span aria-disabled="true">Anterior</span>}
      {page < pages ? <Link href={href(status, page + 1)}>Próxima</Link> : <span aria-disabled="true">Próxima</span>}
    </nav>}
  </div>;
}
