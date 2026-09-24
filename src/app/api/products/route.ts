import { NextResponse } from "next/server"; import { db } from "@/lib/db";
export async function GET(req: Request){
  const ids = (new URL(req.url).searchParams.get("ids")||"").split(",").filter(Boolean);
  return NextResponse.json(await db.product.findMany({where:{id:{in:ids},active:true},include:{category:true}}));
}
