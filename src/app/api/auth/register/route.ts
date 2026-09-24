import { NextResponse } from "next/server"; import bcrypt from "bcryptjs"; import { db } from "@/lib/db"; import { createSession } from "@/lib/auth";
export async function POST(req: Request){
  const { name, username, email, password } = await req.json();
  if(!name||!username||!email||String(password).length<8) return NextResponse.json({error:"Preencha tudo; senha com 8+ caracteres."},{status:400});
  try{
    // O papel é sempre USER aqui; ADMIN só é definido direto no banco.
    const u = await db.user.create({data:{name,username,email:String(email).toLowerCase(),passwordHash:await bcrypt.hash(password,10)}});
    await createSession({id:u.id, role:"USER"}); return NextResponse.json({ok:true});
  }catch{ return NextResponse.json({error:"Usuário ou e-mail já cadastrado."},{status:409}) }
}
