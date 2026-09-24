import { NextRequest, NextResponse } from "next/server"; import { jwtVerify } from "jose";
const key = new TextEncoder().encode(process.env.AUTH_SECRET!);
export async function middleware(req: NextRequest){
  const p = req.nextUrl.pathname, api = p.startsWith("/api/");
  let role: string|null = null;
  try{ const t = req.cookies.get("session")?.value; if(t) role = (await jwtVerify(t,key)).payload.role as string }catch{}
  const deny = () => api ? NextResponse.json({error:"forbidden"},{status:403}) : NextResponse.redirect(new URL("/login?next="+p, req.url));
  if((p.startsWith("/admin")||p.startsWith("/api/admin")) && role!=="ADMIN") return deny();
  if(p.startsWith("/cliente") && !role) return deny();
  return NextResponse.next();
}
export const config = { matcher:["/admin/:path*","/cliente/:path*","/api/admin/:path*"] };
