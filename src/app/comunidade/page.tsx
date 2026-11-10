import Link from "next/link";
import { ArrowRight, CalendarDays, Images, Newspaper, Sparkles } from "lucide-react";
import { db, publishedUpdates } from "@/lib/db";
import UpdateCard from "@/components/UpdateCard";

export const dynamic = "force-dynamic";
function safeExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export default async function Comunidade() {
  const now = new Date();
  const [updates, event] = await Promise.all([
    publishedUpdates(3),
    db.event.findFirst({ where: { active: true, endsAt: { gte: now } }, orderBy: [{ startsAt: "asc" }] }),
  ]);
  const eventLink = event?.link ? safeExternalUrl(event.link) : null;

  return <main className="page-shell max-w-7xl">
    <header className="community-hero">
      <div className="community-hero-mark"><Sparkles size={150} /></div>
      <div className="relative max-w-3xl">
        <span className="brand-tag"><Images size={14} /> Espaço da comunidade</span>
        <h1 className="mt-4 text-3xl font-black sm:text-5xl">Comunidade Valoria</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-mut sm:text-base">Novidades, eventos e momentos compartilhados pelos jogadores — tudo em um só lugar.</p>
      </div>
    </header>

    <section className="community-section" aria-labelledby="community-updates">
      <div className="community-section-heading">
        <div><span className="section-kicker"><Newspaper size={13} /> Fique por dentro</span><h2 id="community-updates">Atualizações</h2><p>Comunicados e novidades publicados pela equipe.</p></div>
        <Link href="/atualizacoes" className="community-text-link">Ver todas <ArrowRight size={15} /></Link>
      </div>
      {updates.length ? <div className="grid gap-4 md:grid-cols-3">{updates.map(update => <UpdateCard key={update.id} u={update} />)}</div> : <div className="community-empty">Nenhuma atualização publicada no momento.</div>}
    </section>

    <section className="community-event-panel" aria-labelledby="community-event">
      {event?.image ? <img src={event.image} alt="" className="community-event-image" /> : <div className="community-event-image community-event-placeholder"><Sparkles size={42} /></div>}
      <div className="community-event-copy">
        <span className="community-event-label"><CalendarDays size={13} /> {event && event.startsAt > now ? "Próximo evento de Valoria" : "Evento atual de Valoria"}</span>
        <h2 id="community-event">{event?.name ?? "Próximo evento em breve"}</h2>
        <p>{event?.description ?? "A equipe está preparando novas experiências para a comunidade. Fique de olho nas atualizações."}</p>
        {event?.startsAt && <p className="community-event-date">{new Date(event.startsAt).toLocaleDateString("pt-BR")} – {new Date(event.endsAt).toLocaleDateString("pt-BR")}</p>}
        {eventLink && <a href={eventLink} target="_blank" rel="noreferrer" className="btn-p mt-4 inline-flex min-h-10 items-center gap-2">Saiba mais <ArrowRight size={15} /></a>}
      </div>
    </section>
  </main>;
}
