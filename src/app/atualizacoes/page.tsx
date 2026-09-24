import { publishedUpdates } from "@/lib/db"; import UpdateCard from "@/components/UpdateCard";
export const dynamic = "force-dynamic";
export default async function Updates(){
  const list = await publishedUpdates();
  return <main className="mx-auto max-w-6xl px-4 py-10"><h1 className="mb-6 text-3xl font-bold">Atualizações</h1>
    {list.length ? <div className="grid gap-4 md:grid-cols-3">{list.map(u=><UpdateCard key={u.id} u={u}/>)}</div> : <p className="text-mut">Nenhuma atualização publicada ainda.</p>}</main>;
}
