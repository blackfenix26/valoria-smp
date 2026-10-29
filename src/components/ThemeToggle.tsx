"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const saved = window.localStorage.getItem("valoria-theme");
    const next = saved === "light";
    setLight(next);
    document.documentElement.dataset.theme = next ? "light" : "dark";
  }, []);
  function toggle() {
    const next = !light;
    setLight(next);
    document.documentElement.dataset.theme = next ? "light" : "dark";
    window.localStorage.setItem("valoria-theme", next ? "light" : "dark");
  }
  return <button type="button" onClick={toggle} aria-label={light ? "Ativar modo escuro" : "Ativar modo claro"} title={light ? "Modo escuro" : "Modo claro"} className="grid h-11 w-11 place-items-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white"><span className="sr-only">{light ? "Ativar modo escuro" : "Ativar modo claro"}</span>{light ? <Moon size={18}/> : <Sun size={18}/>}</button>;
}
