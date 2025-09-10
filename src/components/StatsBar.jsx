import { useEffect, useState } from "react";

function useCount(to = 0, ms = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let start, raf;
    function step(t) {
      if (!start) start = t;
      const p = Math.min((t - start) / ms, 1);
      setN(Math.floor(to * (0.5 - Math.cos(Math.PI * p) / 2))); // easeInOut
      if (p < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return n;
}

export default function StatsBar() {
  const deliveries = useCount(120000);
  const uptime = useCount(99);
  const countries = useCount(6);

  return (
    <div className="mt-10 grid grid-cols-3 gap-6 max-w-3xl mx-auto">
      <div className="rounded-xl bg-white/70 backdrop-blur p-4 border border-slate-200 text-center">
        <div className="text-3xl font-extrabold text-slate-900">{deliveries.toLocaleString()}+</div>
        <div className="text-xs uppercase tracking-wider text-slate-500">Registros capturados</div>
      </div>
      <div className="rounded-xl bg-white/70 backdrop-blur p-4 border border-slate-200 text-center">
        <div className="text-3xl font-extrabold text-slate-900">{uptime}.9%</div>
        <div className="text-xs uppercase tracking-wider text-slate-500">Disponibilidad plataforma</div>
      </div>
      <div className="rounded-xl bg-white/70 backdrop-blur p-4 border border-slate-200 text-center">
        <div className="text-3xl font-extrabold text-slate-900">{countries}</div>
        <div className="text-xs uppercase tracking-wider text-slate-500">Países operando</div>
      </div>
    </div>
  );
}
