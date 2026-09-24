import { NextResponse } from "next/server"; import { writeFile } from "fs/promises"; import path from "path"; import { requireAdmin } from "@/lib/auth";
// Grava em public/uploads (ok em VPS/local). Em hospedagem serverless troque por S3/Cloudinary.
export async function POST(req: Request){
  try{ await requireAdmin() }catch{ return NextResponse.json({error:"forbidden"},{status:403}) }
  const f = (await req.formData()).get("file"); if(!(f instanceof File)) return NextResponse.json({error:"Arquivo ausente."},{status:400});
  const ext = ({"image/png":"png","image/jpeg":"jpg","image/webp":"webp","image/gif":"gif"} as Record<string,string>)[f.type];
  if(!ext || f.size>5_000_000) return NextResponse.json({error:"Envie PNG, JPG, WEBP ou GIF de até 5 MB."},{status:400});
  const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
  await writeFile(path.join(process.cwd(),"public","uploads",name), Buffer.from(await f.arrayBuffer()));
  return NextResponse.json({url:`/uploads/${name}`});
}
