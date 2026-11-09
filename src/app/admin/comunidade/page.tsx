import { ImagePlus } from "lucide-react";
import { db } from "@/lib/db";
import CommunityPhotoModeration from "@/components/CommunityPhotoModeration";

export const dynamic = "force-dynamic";

export default async function AdminCommunity() {
  const photos = await db.communityPhoto.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true, username: true } } },
  });

  return <div className="space-y-5">
    <header className="admin-page-heading">
      <p className="admin-eyebrow">Moderação</p>
      <h1 className="mt-1 flex items-center gap-2 text-2xl font-black"><ImagePlus size={22} className="text-blue-400" /> Galeria da comunidade</h1>
      <p className="mt-2 text-sm text-mut">Revise os envios antes de torná-los públicos. Ao recusar, a imagem também é removida do armazenamento.</p>
    </header>
    <CommunityPhotoModeration photos={photos} />
  </div>;
}
