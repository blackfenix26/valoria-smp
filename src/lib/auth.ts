import { SignJWT, jwtVerify } from "jose"; import { cookies } from "next/headers";
const key = new TextEncoder().encode(process.env.AUTH_SECRET!);
export type Session = { id: string; role: "USER" | "ADMIN" };
export async function createSession(s: Session){
  const t = await new SignJWT({...s}).setProtectedHeader({alg:"HS256"}).setExpirationTime("7d").sign(key);
  cookies().set("session", t, {httpOnly:true, sameSite:"lax", secure:process.env.NODE_ENV==="production", path:"/", maxAge:604800});
}
export async function getSession(): Promise<Session|null>{
  const t = cookies().get("session")?.value; if(!t) return null;
  try{ return (await jwtVerify(t,key)).payload as unknown as Session }catch{ return null }
}
export async function requireAdmin(){ const s = await getSession(); if(!s || s.role!=="ADMIN") throw new Error("forbidden"); return s }
