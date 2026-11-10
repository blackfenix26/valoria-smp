"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, LoaderCircle, Send } from "lucide-react";

export default function CommunityGalleryUpload({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!signedIn) {
      window.location.assign("/login?next=/galeria");
      return;
    }
    if (!file || busy) {
      setError("Selecione uma foto antes de enviar.");
      return;
    }
    setError("");
    setMessage("");
    setBusy(true);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("caption", caption);
      const response = await fetch("/api/community/gallery", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível enviar a foto.");
      setFile(null);
      setCaption("");
      if (fileInput.current) fileInput.current.value = "";
      setMessage("Foto enviada! Ela aparecerá na galeria depois da aprovação da equipe.");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível enviar a foto.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="community-upload-card">
      <div className="community-upload-heading">
        <span className="community-icon"><ImagePlus size={19} /></span>
        <div><h3>Compartilhe um momento</h3><p>Fotos de até 4 MB. A equipe analisa cada envio antes de publicar.</p></div>
      </div>
      {signedIn ? (
        <div className="community-upload-fields">
          <label className="community-file-input"> <span>{file?.name || "Escolher foto (PNG, JPG, WEBP ou GIF)"}</span><input ref={fileInput} name="photo" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={event => setFile(event.target.files?.[0] ?? null)} required /></label>
          <label className="sr-only" htmlFor="community-photo-caption">Descrição da foto</label>
          <input id="community-photo-caption" value={caption} onChange={event => setCaption(event.target.value)} maxLength={240} placeholder="Uma descrição curta (opcional)" className="inp" />
          <button type="submit" className="btn-p inline-flex min-h-11 items-center justify-center gap-2" disabled={busy}>
            {busy ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={15} />}
            {busy ? "Enviando..." : "Enviar para aprovação"}
          </button>
        </div>
      ) : <p className="community-signin-note">Entre na sua conta para enviar fotos. <a href="/login?next=/galeria">Fazer login</a></p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-500">{error}</p>}
      {message && <p role="status" className="mt-3 text-sm text-emerald-600">{message}</p>}
    </form>
  );
}
