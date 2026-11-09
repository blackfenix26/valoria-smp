import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireEventTeam } from "@/lib/auth";
import { COMMUNITY_IMAGE_TYPES, isValidImageFile } from "@/lib/image-validation";

export async function POST(request: Request) {
  try {
    await requireEventTeam();
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "O armazenamento de imagens não está configurado. Defina BLOB_READ_WRITE_TOKEN na Vercel." }, { status: 503 });
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 5_300_000) return NextResponse.json({ error: "O arquivo excede o limite de 5 MB." }, { status: 413 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Formulário inválido." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Arquivo ausente." }, { status: 400 });
  if (file.size === 0 || file.size > 5_000_000) return NextResponse.json({ error: "Envie uma imagem de até 5 MB." }, { status: 400 });

  const type = COMMUNITY_IMAGE_TYPES[file.type];
  if (!type) return NextResponse.json({ error: "Formato não permitido. Use PNG, JPG, WEBP ou GIF." }, { status: 400 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!isValidImageFile(file.type, bytes)) return NextResponse.json({ error: "O conteúdo do arquivo não corresponde a uma imagem válida." }, { status: 400 });

  try {
    const blob = await put(`site-uploads/${randomUUID()}.${type.extension}`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
      cacheControlMaxAge: 31_536_000,
    });
    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar a imagem no Vercel Blob. Verifique a configuração do armazenamento." }, { status: 503 });
  }
}
