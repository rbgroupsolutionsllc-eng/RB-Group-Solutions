import { useEffect, useMemo, useState } from "react";

/** Paleta de comandos (⌘K / Ctrl+K) para abrir módulos */
export default function CommandK({ links }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = (q || "").toLowerCase();
    return links.filter(l => l.label.toLowerCase().includes(t));
  }, [links, q]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(v => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar… (apps, módulos)"
            className="w-full outline-none text-slate-800 placeholder-slate-400"
          />
        </div>
        <ul className="max-h-72 overflow-auto">
          {list.map((l, i) => (
            <li key={i} className="border-b last:border-0 border-slate-100">
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                <span className="text-xl">{l.icon}</span>
                <div>
                  <div className="font-semibold text-slate-900">{l.label}</div>
                  <div className="text-xs text-slate-500">{l.desc}</div>
                </div>
              </a>
            </li>
          ))}
          {!list.length && (
            <li className="px-4 py-6 text-center text-slate-400 text-sm">Sin resultados</li>
          )}
        </ul>
      </div>
    </div>
  );
}
