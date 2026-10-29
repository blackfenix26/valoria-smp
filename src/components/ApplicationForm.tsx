"use client";

import { useRef, useState } from "react";
import { LoaderCircle, Send } from "lucide-react";

export default function ApplicationForm({ opportunityId }: { opportunityId: string }) {
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInFlight = useRef(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionInFlight.current) return;

    setResult("");
    submissionInFlight.current = true;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, contact, message }),
      });
      const data = await response.json() as { error?: string };

      if (!response.ok) {
        setResult(data.error || "Não foi possível enviar sua candidatura. Tente novamente.");
        return;
      }

      setResult("Candidatura enviada para análise.");
      setContact("");
      setMessage("");
    } catch {
      setResult("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
    } finally {
      submissionInFlight.current = false;
      setIsSubmitting(false);
    }
  }

  return <form onSubmit={submit} className="application-form mt-4 space-y-3">
    <div>
      <label htmlFor={`application-contact-${opportunityId}`} className="mb-1.5 block text-xs font-semibold">Seu contato</label>
      <input
        id={`application-contact-${opportunityId}`}
        required
        maxLength={120}
        value={contact}
        onChange={event => setContact(event.target.value)}
        placeholder="Discord ou outro contato"
        className="inp"
      />
    </div>
    <div>
      <label htmlFor={`application-message-${opportunityId}`} className="mb-1.5 block text-xs font-semibold">Apresentação</label>
      <textarea
        id={`application-message-${opportunityId}`}
        required
        minLength={30}
        maxLength={1500}
        value={message}
        onChange={event => setMessage(event.target.value)}
        placeholder="Conte sobre sua experiência e interesse"
        className="inp min-h-28"
        aria-describedby={`application-message-count-${opportunityId}`}
      />
      <p id={`application-message-count-${opportunityId}`} className="mt-1 text-right text-[11px] text-mut">{message.length}/1500 caracteres · mínimo 30</p>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <button className="btn-p inline-flex min-h-10 items-center gap-2" disabled={isSubmitting}>
        {isSubmitting ? <><LoaderCircle size={15} className="animate-spin"/> Enviando...</> : <><Send size={14}/> Enviar candidatura</>}
      </button>
      <p role={result === "Candidatura enviada para análise." ? "status" : "alert"} aria-live="polite" className={`text-sm ${result === "Candidatura enviada para análise." ? "text-emerald-300" : "text-mut"}`}>{result}</p>
    </div>
  </form>;
}
