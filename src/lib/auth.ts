import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getSessionSecret } from "@/lib/session-secret";
const secret = getSessionSecret();
const key = new TextEncoder().encode(secret);
export type Session = { id: string; role: "USER" | "ADMIN" };
export async function createSession(s: Session){
  const t = await new SignJWT({...s}).setProtectedHeader({alg:"HS256"}).setExpirationTime("7d").sign(key);
  cookies().set("session", t, {httpOnly:true, sameSite:"lax", secure:process.env.NODE_ENV==="production", path:"/", maxAge:604800});
}
export async function getSession(): Promise<Session|null>{
  const t = cookies().get("session")?.value; if(!t) return null;
  let payload;
  try{
    payload = (await jwtVerify(t,key)).payload;
  }catch{ return null }
  if(typeof payload.sub !== "string" && typeof payload.id !== "string") return null;
  const userId = typeof payload.id === "string" ? payload.id : payload.sub as string;
  const user = await db.user.findUnique({where:{id:userId},select:{id:true,role:true,active:true}});
  if(!user?.active || (user.role !== "ADMIN" && user.role !== "USER")) return null;
  return {id:user.id,role:user.role};
}
export async function requireAdmin(){
  const s = await getSession();
  if(!s || s.role!=="ADMIN") throw new Error("forbidden");
  return s;
}
