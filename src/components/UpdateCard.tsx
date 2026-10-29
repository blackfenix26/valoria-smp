import { CalendarDays, Megaphone } from "lucide-react";

const COR: Record<string,string> = {EVENTO:"bg-vio",NOVIDADE:"bg-blu",MANUTENCAO:"bg-gold text-black",LOJA:"bg-ok text-black",IMPORTANTE:"bg-red-500"};
export default function UpdateCard({u}:{u:{title:string;summary:string;category:string;publishAt:Date;image:string|null;author?:{name:string}}}){
  return <article className="update-card overflow-hidden rounded-2xl border border-white/10 bg-card">
    <div className="update-card-media relative overflow-hidden">
      {u.image ? <img src={u.image} alt="" className="h-full w-full object-cover transition duration-500"/> : <div className="update-card-placeholder grid h-full place-items-center"><Megaphone size={30} aria-hidden="true"/></div>}
      <span className={`update-card-label absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] ${COR[u.category]??"bg-vio"}`}>{u.category}</span>
    </div>
    <div className="space-y-3 p-5">
      <h3 className="line-clamp-2 text-lg font-bold leading-snug">{u.title}</h3>
      <p className="line-clamp-3 text-sm leading-6 text-mut">{u.summary}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-[11px] text-mut">
        <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} aria-hidden="true"/>{u.publishAt.toLocaleDateString("pt-BR")}</span>
        {u.author && <span className="truncate">Por {u.author.name}</span>}
      </div>
    </div>
  </article>;
}
