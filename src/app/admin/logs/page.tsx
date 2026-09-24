import { db } from "@/lib/db"; export const dynamic = "force-dynamic";
export default async function Logs(){ const l = await db.adminLog.findMany({orderBy:{createdAt:"desc"},take:100,include:{admin:{select:{name:true}}}});
  return <><h1 className="mb-4 text-2xl font-bold">Logs</h1><div className="overflow-x-auto rounded-2xl border border-white/10"><table className="w-full text-left text-sm"><thead className="bg-surf text-xs text-mut"><tr><th className="p-3">Data</th><th>Admin</th><th>Ação</th><th>Alvo</th></tr></thead>
    <tbody>{l.map(x=><tr key={x.id} className="border-t border-white/5"><td className="p-3">{x.createdAt.toLocaleString("pt-BR")}</td><td>{x.admin.name}</td><td>{x.action}</td><td className="text-mut">{x.target}</td></tr>)}</tbody></table></div></> }
