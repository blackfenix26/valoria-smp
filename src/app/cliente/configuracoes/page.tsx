import { db } from "@/lib/db"; import { getSession } from "@/lib/auth"; export const dynamic = "force-dynamic";
export default async function Config(){
  const u = await db.user.findUnique({where:{id:(await getSession())!.id}});
  return <><h1 className="mb-4 text-2xl font-bold">Configurações</h1><div className="space-y-2 rounded-2xl border border-white/10 bg-card p-5 text-sm">
    {[["Nome",u?.name],["Usuário",u?.username],["E-mail",u?.email],["Membro desde",u?.createdAt.toLocaleDateString("pt-BR")]].map(([k,v])=><p key={k}><span className="text-mut">{k}:</span> {v}</p>)}</div></>;
}
