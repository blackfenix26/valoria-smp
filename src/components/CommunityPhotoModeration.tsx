"use client";

import { useState } from "react";
import { Check, LoaderCircle, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

type Photo = {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: string | Date;
  user: { name: string; username: string };
  status: string;
  reviewedAt: string | Date | null;
  reviewer: { name: string; username: string } | null;
};

const STATUS_LABELS: Record<string, string> = { PENDING: "Aguardando", APPROVED: "Publicada", REJECTED: "Recusada" };

export default function CommunityPhotoModeration({ photos, status }: { photos: Photo[]; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function moderate(photo: Photo, status: "APPROVED" | "REJECTED") {
    if (status === "REJECTED" && !window.confirm(
      photo.status === "APPROVED"
        ? "Remover esta foto da galeria pública? A imagem será apagada permanentemente do armazenamento."
        : "Recusar este envio? A imagem será apagada permanentemente do armazenamento.",
    )) return;
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
          {photo.status !== "REJECTED"
            ? <a href={photo.imageUrl} target="_blank" rel="noreferrer" aria-label="Abrir imagem em tamanho original"><img src={photo.imageUrl} alt={photo.caption || `Foto enviada por ${photo.user.name}`} className="community-pending-image" /></a>
            : <div className="community-pending-image community-admin-removed"><Trash2 size={24} /><span>Arquivo removido após recusa</span></div>}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="break-words text-sm font-semibold">{photo.caption || "Sem descrição"}</p>
              <span className={`community-admin-status community-admin-status-${photo.status.toLowerCase()}`}>{STATUS_LABELS[photo.status]}</span>
            </div>
            <p className="mt-2 text-xs text-mut">Enviada por {photo.user.name} (@{photo.user.username}) · {new Date(photo.createdAt).toLocaleString("pt-BR")}</p>
            {photo.reviewedAt && <p className="mt-2 text-xs text-mut">Analisada por {photo.reviewer?.name ?? "Equipe"} · {new Date(photo.reviewedAt).toLocaleString("pt-BR")}</p>}
            {photo.status === "PENDING" && <div className="mt-4 flex gap-2">
                <button type="button" className="btn-p inline-flex min-h-10 flex-1 items-center justify-center gap-2" disabled={busy !== null} onClick={() => void moderate(photo, "APPROVED")}>
                  {busy === `${photo.id}:APPROVED` ? <LoaderCircle size={15} className="animate-spin" /> : <Check size={15} />} Aprovar
                </button>
                <button type="button" className="btn-o inline-flex min-h-10 flex-1 items-center justify-center gap-2 !text-red-600" disabled={busy !== null} onClick={() => void moderate(photo, "REJECTED")}>
                  {busy === `${photo.id}:REJECTED` ? <LoaderCircle size={15} className="animate-spin" /> : <X size={15} />} Recusar
                </button>
              </div>}
            {photo.status === "APPROVED" && <button type="button" className="btn-o mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 !text-red-600" disabled={busy !== null} onClick={() => void moderate(photo, "REJECTED")}>
              {busy === `${photo.id}:REJECTED` ? <LoaderCircle size={15} className="animate-spin" /> : <Trash2 size={15} />} Remover da galeria pública
            </button>}
          </div>
        </article>)}
      </div> : <div className="community-empty"><Check size={22} /><p>{status === "PENDING" ? "Nenhuma foto aguardando aprovação." : status === "APPROVED" ? "Nenhuma foto publicada corresponde a este filtro." : "Nenhuma foto recusada corresponde a este filtro."}</p></div>}
    </div>
  );
}
