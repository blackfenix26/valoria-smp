import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

const IMAGE_TYPES: Record<string, { extension: string; signature: (bytes: Uint8Array) => boolean }> = {
  "image/png": { extension: "png", signature: bytes => bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte) },
  "image/jpeg": { extension: "jpg", signature: bytes => bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  "image/webp": { extension: "webp", signature: bytes => bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP" },
  "image/gif": { extension: "gif", signature: bytes => bytes.length >= 6 && ["GIF87a", "GIF89a"].includes(String.fromCharCode(...bytes.slice(0, 6))) },
};

export async function POST(request: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "forbidden" }, { status: 403 }); }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 5_300_000) return NextResponse.json({ error: "O arquivo excede o limite de 5 MB." }, { status: 413 });

  let form: FormData;
  try { form = await request.formData(); } catch { return NextResponse.json({ error: "Formulário inválido." }, { status: 400 }); }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Arquivo ausente." }, { status: 400 });
  if (file.size === 0 || file.size > 5_000_000) return NextResponse.json({ error: "Envie uma imagem de até 5 MB." }, { status: 400 });

  const type = IMAGE_TYPES[file.type];
  if (!type) return NextResponse.json({ error: "Formato não permitido. Use PNG, JPG, WEBP ou GIF." }, { status: 400 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!type.signature(bytes)) return NextResponse.json({ error: "O conteúdo do arquivo não corresponde a uma imagem válida." }, { status: 400 });

  const directory = path.join(process.cwd(), "public", "uploads");
  const name = `${randomUUID()}.${type.extension}`;
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name), bytes, { flag: "wx" });
  return NextResponse.json({ url: `/uploads/${name}` }, { status: 201 });
}
