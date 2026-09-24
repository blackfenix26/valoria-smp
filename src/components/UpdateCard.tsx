const COR: Record<string,string> = {EVENTO:"bg-vio",NOVIDADE:"bg-blu",MANUTENCAO:"bg-gold text-black",LOJA:"bg-ok text-black",IMPORTANTE:"bg-red-500"};
export default function UpdateCard({u}:{u:{title:string;summary:string;category:string;publishAt:Date;image:string|null;author?:{name:string}}}){
  return <article className="overflow-hidden rounded-2xl border border-white/10 bg-card">
    {u.image && <img src={u.image} alt="" className="h-36 w-full object-cover"/>}
    <div className="space-y-1.5 p-4"><span className={`rounded px-2 py-0.5 text-[10px] font-bold ${COR[u.category]??"bg-vio"}`}>{u.category}</span>
      <h3 className="font-semibold">{u.title}</h3><p className="text-sm text-mut">{u.summary}</p>
      <p className="text-xs text-mut">{u.publishAt.toLocaleDateString("pt-BR")}{u.author && ` · ${u.author.name}`}</p></div></article>;
}
