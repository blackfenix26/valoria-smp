import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getSessionSecret } from "@/lib/session-secret";
const secret = getSessionSecret();
const key = new TextEncoder().encode(secret);
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const api = pathname.startsWith("/api/");
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
  if (api && isMutation) {
    const origin = req.headers.get("origin");
    const fetchSite = req.headers.get("sec-fetch-site");
    if (origin) {
      try {
        if (new URL(origin).origin !== req.nextUrl.origin) return NextResponse.json({ error: "cross-origin request denied" }, { status: 403 });
      } catch {
        return NextResponse.json({ error: "invalid request origin" }, { status: 403 });
      }
    } else if (fetchSite === "cross-site") {
      return NextResponse.json({ error: "cross-origin request denied" }, { status: 403 });
    }
  }

  let role: string | null = null;

  try {
    const token = req.cookies.get("session")?.value;
    if (token) role = (await jwtVerify(token, key)).payload.role as string;
  } catch {
    role = null;
  }

  const deny = () => api
    ? NextResponse.json({ error: "forbidden" }, { status: 403 })
    : NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, req.url));

  if ((pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) && role !== "ADMIN") return deny();
  if (pathname.startsWith("/cliente") && !role) return deny();

  const response = NextResponse.next();
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin") || pathname.startsWith("/cliente")) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
  }
  return response;
}
export const config = { matcher:["/admin/:path*","/cliente/:path*","/api/:path*"] };
