import { NextResponse } from "next/server"; import bcrypt from "bcryptjs"; import { db } from "@/lib/db"; import { createSession } from "@/lib/auth";
export async function POST(req: Request){
  const { email, password } = await req.json();
  const u = await db.user.findUnique({where:{email:String(email).toLowerCase()}});
  if(!u || !u.active || !(await bcrypt.compare(String(password), u.passwordHash))) return NextResponse.json({error:"E-mail ou senha inválidos."},{status:401});
  await createSession({id:u.id, role:u.role as "USER"|"ADMIN"});
  return NextResponse.json({ok:true, role:u.role});
}
