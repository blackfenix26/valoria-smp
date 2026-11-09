"use client";

import { useState } from "react";
import { Check, LoaderCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

type Photo = {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: string | Date;
  user: { name: string; username: string };
};

export default function CommunityPhotoModeration({ photos }: { photos: Photo[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function moderate(photo: Photo, status: "APPROVED" | "REJECTED") {
    setBusy(`${photo.id}:${status}`);
    setError("");
    try {
      const response = await fetch("/api/community/gallery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: photo.id, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível atualizar a foto.");
      router.refresh();
    } catch (moderationError) {
      setError(moderationError instanceof Error ? moderationError.message : "Não foi possível atualizar a foto.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      {error && <p role="alert" className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500">{error}</p>}
      {photos.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {photos.map(photo => <article key={photo.id} className="community-pending-card">
          <img src={photo.imageUrl} alt={photo.caption || `Foto enviada por ${photo.user.name}`} className="community-pending-image" />
          <div className="p-4">
            <p className="text-sm font-semibold">{photo.caption || "Sem descrição"}</p>
            <p className="mt-2 text-xs text-mut">Enviada por {photo.user.name} (@{photo.user.username}) · {new Date(photo.createdAt).toLocaleString("pt-BR")}</p>
            <div className="mt-4 flex gap-2">
              <button type="button" className="btn-p inline-flex min-h-10 flex-1 items-center justify-center gap-2" disabled={busy !== null} onClick={() => void moderate(photo, "APPROVED")}>
                {busy === `${photo.id}:APPROVED` ? <LoaderCircle size={15} className="animate-spin" /> : <Check size={15} />} Aprovar
              </button>
              <button type="button" className="btn-o inline-flex min-h-10 flex-1 items-center justify-center gap-2 !text-red-600" disabled={busy !== null} onClick={() => void moderate(photo, "REJECTED")}>
                {busy === `${photo.id}:REJECTED` ? <LoaderCircle size={15} className="animate-spin" /> : <X size={15} />} Recusar
              </button>
            </div>
          </div>
        </article>)}
      </div> : <div className="community-empty"><Check size={22} /><p>Nenhuma foto aguardando aprovação.</p></div>}
    </div>
  );
}
