import { randomUUID } from "node:crypto";
import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { COMMUNITY_IMAGE_TYPES, isValidImageFile } from "@/lib/image-validation";
import { canManageGallery } from "@/lib/team-permissions";
import { readJsonBody } from "@/lib/request-body";

export const runtime = "nodejs";

const noStore = { "Cache-Control": "private, no-store, max-age=0" };

export async function GET(request: Request) {
  const sort = new URL(request.url).searchParams.get("sort") === "oldest" ? "asc" : "desc";
  const photos = await db.communityPhoto.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: sort },
    take: 80,
    include: { user: { select: { name: true, username: true } } },
  });
  return NextResponse.json(photos, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Entre na sua conta para enviar uma foto." }, { status: 401, headers: noStore });
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 4_300_000) return NextResponse.json({ error: "A foto excede o limite de 4 MB." }, { status: 413, headers: noStore });
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "O armazenamento da galeria não está configurado. Defina BLOB_READ_WRITE_TOKEN na Vercel." }, { status: 503, headers: noStore });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Formulário inválido." }, { status: 400, headers: noStore });
  }
  const file = form.get("file");
  const captionValue = form.get("caption");
  const caption = typeof captionValue === "string" ? captionValue.trim() : "";
  if (!(file instanceof File)) return NextResponse.json({ error: "Selecione uma foto." }, { status: 400, headers: noStore });
  if (file.size === 0 || file.size > 4_000_000) return NextResponse.json({ error: "Envie uma foto de até 4 MB." }, { status: 400, headers: noStore });
  if (caption.length > 240) return NextResponse.json({ error: "A descrição pode ter no máximo 240 caracteres." }, { status: 400, headers: noStore });
  const type = COMMUNITY_IMAGE_TYPES[file.type];
  if (!type) return NextResponse.json({ error: "Formato não permitido. Use PNG, JPG, WEBP ou GIF." }, { status: 400, headers: noStore });
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!isValidImageFile(file.type, bytes)) return NextResponse.json({ error: "O arquivo não corresponde a uma imagem válida." }, { status: 400, headers: noStore });

  const pendingCount = await db.communityPhoto.count({ where: { userId: session.id, status: "PENDING" } });
  if (pendingCount >= 5) return NextResponse.json({ error: "Você já tem 5 fotos aguardando aprovação. Tente novamente depois da análise." }, { status: 429, headers: noStore });

  const pathname = `community-gallery/${randomUUID()}.${type.extension}`;
  let blob: Awaited<ReturnType<typeof put>>;
  try {
    blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
      cacheControlMaxAge: 31_536_000,
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível enviar a foto ao Vercel Blob. Tente novamente mais tarde." }, { status: 503, headers: noStore });
  }

  try {
    const photo = await db.communityPhoto.create({
      data: { userId: session.id, imageUrl: blob.url, blobPathname: blob.pathname, caption },
      select: { id: true, status: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, photo }, { status: 201, headers: noStore });
  } catch {
    try {
      await del(blob.pathname);
    } catch {
      return NextResponse.json({ error: "A foto foi enviada, mas não foi possível registrar o envio. Contate o suporte para remover o arquivo órfão." }, { status: 500, headers: noStore });
    }
    return NextResponse.json({ error: "Não foi possível registrar o envio da foto." }, { status: 500, headers: noStore });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || !canManageGallery(session.role)) return NextResponse.json({ error: "Apenas a equipe pode moderar fotos." }, { status: session ? 403 : 401, headers: noStore });

  const parsed = await readJsonBody<{ id?: unknown; status?: unknown }>(request, 2_048);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error === "too_large" ? "Requisição muito grande." : "JSON inválido." }, { status: parsed.error === "too_large" ? 413 : 400, headers: noStore });
  const id = typeof parsed.data.id === "string" ? parsed.data.id.trim() : "";
  const status = parsed.data.status;
  if (!id || id.length > 128 || (status !== "APPROVED" && status !== "REJECTED")) {
    return NextResponse.json({ error: "Informe a foto e escolha aprovar ou recusar." }, { status: 400, headers: noStore });
  }

  const photo = await db.communityPhoto.findUnique({ where: { id }, select: { id: true, blobPathname: true, status: true } });
  if (!photo) return NextResponse.json({ error: "Foto não encontrada." }, { status: 404, headers: noStore });
  if (photo.status !== "PENDING") return NextResponse.json({ error: "Esta foto já foi analisada." }, { status: 409, headers: noStore });

  const updated = await db.communityPhoto.updateMany({
    where: { id, status: "PENDING" },
    data: { status, reviewedAt: new Date(), reviewerId: session.id },
  });
  if (updated.count !== 1) return NextResponse.json({ error: "Esta foto já foi analisada por outro membro da equipe." }, { status: 409, headers: noStore });

  if (status === "REJECTED") {
    try {
      await del(photo.blobPathname);
    } catch {
      await db.communityPhoto.updateMany({
        where: { id, status: "REJECTED", reviewerId: session.id },
        data: { status: "PENDING", reviewedAt: null, reviewerId: null },
      });
      return NextResponse.json({ error: "Não foi possível remover a imagem do armazenamento. A foto voltou para a fila de análise." }, { status: 503, headers: noStore });
    }
  }

  return NextResponse.json({ ok: true }, { headers: noStore });
}
