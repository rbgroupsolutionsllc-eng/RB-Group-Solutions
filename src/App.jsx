import React, { useEffect, useMemo, useRef, useState } from "react";
import "./index.css";

/* =========================================================
   COMPONENTES INLINE (sin librerías externas)
   ========================================================= */

/** Fondo animado tipo constelaciones (canvas) */
function TechBG() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    let w, h, dpr, rafId;
    const DPR = () => (window.devicePixelRatio || 1);

    const rand = (a, b) => a + Math.random() * (b - a);
    const particles = [];
    const MAX = 80;

    function resize() {
      dpr = DPR();
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const mouse = { x: -9999, y: -9999 };

    function init() {
      particles.length = 0;
      for (let i = 0; i < MAX; i++) {
        particles.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-0.5, 0.5),
          vy: rand(-0.5, 0.5),
        });
      }
    }

    function hue(t) {
      return 210 + 60 * Math.sin(t * 0.0003); // azules → púrpuras
    }

    function step(t) {
      ctx.clearRect(0, 0, w, h);

      // puntos
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 140) {
          p.x += dx * 0.003;
          p.y += dy * 0.003;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue(t)}, 90%, 60%, .9)`;
        ctx.fill();
      }

      // líneas
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = dx * dx + dy * dy;
          if (d < 120 * 120) {
            const alpha = 1 - d / (120 * 120);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `hsla(${hue(t)}, 100%, 70%, ${alpha * 0.3})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(step);
    }

    function onMouse(e) {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    }

    function onResize() { resize(); init(); }

    resize(); init(); rafId = requestAnimationFrame(step);
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouse, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 -z-10 h-screen w-screen pointer-events-none"
      aria-hidden
    />
  );
}

/** Efecto tilt 3D + spotlight en tarjetas */
function Tilt({ children, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    let frame;
    const max = 10; // grados

    function onMove(e) {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - 0.5) * -2 * max;
      const ry = (px - 0.5) * 2 * max;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
        el.style.setProperty("--mx", `${px * 100}%`);
        el.style.setProperty("--my", `${py * 100}%`);
      });
    }
    function reset() {
      el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    }
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", reset);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`relative transition-transform duration-200 will-change-transform ${className}`}
      style={{
        background:
          "radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,.08), transparent 40%)",
        borderRadius: "1rem",
      }}
    >
      {children}
    </div>
  );
}

/** KPIs animados */
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
function StatsBar() {
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

/** Paleta de comandos (⌘K / Ctrl+K) para abrir módulos */
function CommandK({ links }) {
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

/* =========================================================
   APP
   ========================================================= */

/** SEO simple */
function setMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [language, setLanguage] = useState(
    (typeof window !== "undefined" && localStorage.getItem("rb_lang")) || "es"
  );
  const headerRef = useRef(null);

  // Header shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Persist idioma + meta description
  useEffect(() => {
    try { localStorage.setItem("rb_lang", language); } catch {}
    const title = "RB Field Pro 360 | RB Group Solutions LLC";
    const desc =
      language === "en"
        ? "One platform. Three modules. Real-time operations for drivers, deliveries and field management."
        : "Una plataforma. Tres módulos. Operaciones en tiempo real para drivers, entregas y gestión de campo.";
    document.title = title;
    setMeta("description", desc);
  }, [language]);

  // Scroll suave con offset del header
  useEffect(() => {
    const handler = (e) => {
      const a = e.target;
      if (!a || a.tagName !== "A") return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      const headerH = headerRef.current?.offsetHeight ?? 0;
      const top = Math.max(el.getBoundingClientRect().top + window.scrollY - (headerH + 12), 0);
      window.scrollTo({ top, behavior: "smooth" });
      setIsMenuOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const t = useMemo(() => ({
    en: {
      brand: "RB Group Solutions LLC",
      suite: "RB Field Pro 360",
      menu: { home: "Home", services: "Services", systems: "Systems", pricing: "Pricing", faq: "FAQ", contact: "Contact" },
      hero: {
        title: "Run field ops like a high-performance team.",
        subtitle: "One platform. Three focused modules. Real-time data for drivers, deliveries, and operations.",
        cta1: "Explore Modules",
        cta2: "Request Demo",
      },
      services: {
        title: "The Suite",
        subtitle: "A unified platform with role-based modules designed to reduce errors, automate workflows, and scale.",
        roles: [
          { title: "Drivers", body: "RB FuelTrack 360 — OCR receipts, receiptless audit (odometer + pump + GPS) and route overview." },
          { title: "Deliveries", body: "RB SnapLog 360 — enterprise-grade proof of delivery with photo, GPS and reverse geocoding." },
          { title: "Operations / Warehouse / Finance", body: "RB Field360 — records, analytics & payroll; fleet and warehouse control." },
        ],
      },
      systems: {
        title: "Modules",
        subtitle: "Mix and match what your team needs. Everything stays consistent under RB Field Pro 360.",
        snaplogTitle: "RB SnapLog 360",
        snaplogDesc:
          "Enterprise-grade Proof of Delivery optimized for mobile. Guided capture with photo, GPS and timestamp, automatic address from coordinates (reverse geocoding), ultra-low user interaction and automatic background sync. Offline-first, built to work without coverage.",
        fuelTitle: "RB FuelTrack 360",
        fuelDesc:
          "Fuel and route control with automated audit. Receipt OCR, receiptless flow with odometer/pump/GPS validation, cost-per-unit tracking, and exception alerts. Built for driver simplicity.",
        fieldTitle: "RB Field360",
        fieldDesc:
          "Flagship operations hub: orchestrates real-time workflows; daily records, productivity and payroll; kits/uniforms inventory; fleet & maintenance; role-based permissions, executive dashboards and advanced analytics.",
        view: "Open app",
      },
      pricing: {
        title: "Pricing",
        subtitle: "Start small, scale up anytime.",
        plans: [
          { name: "Starter", price: "Contact", items: ["SnapLog 360 or FuelTrack 360", "Up to 10 users", "Email support"] },
          { name: "Fleet", price: "Contact", items: ["FuelTrack 360 + Field360 (light)", "Up to 25 users", "OCR & audit features"] },
          { name: "Full Suite", price: "Contact", items: ["Field360 + SnapLog 360 + FuelTrack 360", "Advanced exports & roles", "Priority support"] },
        ],
        cta: "Request quote",
      },
      faq: {
        title: "FAQ",
        items: [
          { q: "Can I start with one module and add more later?", a: "Yes, all modules share branding and data model." },
          { q: "Do drivers need separate logins?", a: "Keep light apps per role now; move to SSO later if you want." },
          { q: "Where is data stored?", a: "On a dedicated database exclusively for your company, with role-based security." },
          { q: "Custom features?", a: "Yes. We tailor workflows, reports and permissions." },
        ],
      },
      contact: {
        title: "Ready to transform your operation?",
        subtitle: "Schedule a personalized demo and discover how RB Field Pro 360 can optimize your business.",
        form: { name: "Full name", email: "Email address", system: "Select a module of interest", message: "Tell us about your needs...", submit: "Request Demo" },
        options: ["RB SnapLog 360", "RB FuelTrack 360", "RB Field360", "Full Suite"],
        direct: "Prefer to talk directly?",
      },
      citiesLine: "Norridge / Chicago, Illinois, USA",
    },
    es: {
      brand: "RB Group Solutions LLC",
      suite: "RB Field Pro 360",
      menu: { home: "Inicio", services: "Servicios", systems: "Sistemas", pricing: "Precios", faq: "FAQ", contact: "Contacto" },
      hero: {
        title: "Opera como una empresa de alto rendimiento.",
        subtitle: "Una plataforma. Tres módulos. Datos en tiempo real para drivers, entregas y operaciones.",
        cta1: "Explorar Módulos",
        cta2: "Solicitar Demo",
      },
      services: {
        title: "La Suite",
        subtitle: "Plataforma unificada con módulos por rol para reducir errores, automatizar flujos y escalar.",
        roles: [
          { title: "Drivers", body: "RB FuelTrack 360 — OCR de recibos, auditoría sin recibo (odómetro + bomba + GPS) y vista de ruta." },
          { title: "Deliveries", body: "RB SnapLog 360 — POD de nivel empresarial con foto, GPS y geocodificación inversa." },
          { title: "Operaciones / Almacén / Finanzas", body: "RB Field360 — registros, analítica y nómina; control de flota y almacén." },
        ],
      },
      systems: {
        title: "Módulos",
        subtitle: "Combina lo que necesitas. Todo consistente bajo RB Field Pro 360.",
        snaplogTitle: "RB SnapLog 360",
        snaplogDesc:
          "Prueba de Entrega (POD) de nivel empresarial, optimizada para móviles. Captura guiada con foto, GPS y sello de tiempo; dirección automática desde coordenadas (geocodificación inversa), interacción mínima y sincronización automática. Enfoque offline-first para operar sin cobertura.",
        fuelTitle: "RB FuelTrack 360",
        fuelDesc:
          "Control de combustible y ruta con auditoría automática. OCR de recibos, flujo sin recibo con validación de odómetro/bomba/GPS, cálculo de costo por unidad y alertas de excepción. Diseñado para la simplicidad del conductor.",
        fieldTitle: "RB Field360",
        fieldDesc:
          "La joya de la corona: el hub operativo que orquesta flujos en tiempo real; registros diarios, productividad y nómina; inventario de kits/uniformes; gestión de flota y mantenimiento; permisos por rol, tableros ejecutivos y analítica avanzada.",
        view: "Abrir app",
      },
      pricing: {
        title: "Precios",
        subtitle: "Empieza pequeño y escala cuando quieras.",
        plans: [
          { name: "Starter", price: "Contacto", items: ["SnapLog 360 o FuelTrack 360", "Hasta 10 usuarios", "Soporte por email"] },
          { name: "Fleet", price: "Contacto", items: ["FuelTrack 360 + Field360 (ligero)", "Hasta 25 usuarios", "OCR y auditoría"] },
          { name: "Full Suite", price: "Contacto", items: ["Field360 + SnapLog 360 + FuelTrack 360", "Exportaciones avanzadas y roles", "Soporte prioritario"] },
        ],
        cta: "Solicitar cotización",
      },
      faq: {
        title: "Preguntas frecuentes",
        items: [
          { q: "¿Puedo empezar con un módulo y agregar más?", a: "Sí. Comparten branding y modelo de datos." },
          { q: "¿Necesitan varios logins los drivers?", a: "Puedes mantener apps por rol ahora y pasar a SSO luego." },
          { q: "¿Dónde se guardan los datos?", a: "En una base de datos dedicada para tu empresa, con seguridad por roles." },
          { q: "¿Hacen personalizaciones?", a: "Sí. Ajustamos flujos, reportes y permisos a tu operación." },
        ],
      },
      contact: {
        title: "¿Listo para transformar tu operación?",
        subtitle: "Agenda una demo personalizada y descubre cómo RB Field Pro 360 puede optimizar tu negocio.",
        form: { name: "Nombre completo", email: "Correo electrónico", system: "Selecciona un módulo de interés", message: "Cuéntanos tus necesidades...", submit: "Solicitar Demo" },
        options: ["RB SnapLog 360", "RB FuelTrack 360", "RB Field360", "Full Suite"],
        direct: "¿Prefieres hablar directamente?",
      },
      citiesLine: "Norridge / Chicago, Illinois, USA",
    },
  })[language], [language]);

  const NAV = [
    { id: "home", label: t.menu.home },
    { id: "services", label: t.menu.services },
    { id: "systems", label: t.menu.systems },
    { id: "pricing", label: t.menu.pricing },
    { id: "faq", label: t.menu.faq },
    { id: "contact", label: t.menu.contact },
  ];

  // URLs de las apps
  const urls = {
    snaplog: "https://sl360.rbgroupsolutions.com",
    fueltrack: "https://gas360.rbgroupsolutions.com",
    field360: "https://field360.rbgroupsolutions.com",
  };

  const modules = [
    { id: "snaplog", icon: "📦", title: t.systems.snaplogTitle, desc: t.systems.snaplogDesc, color: "from-blue-500 to-cyan-500", url: urls.snaplog },
    { id: "fueltrack", icon: "⛽", title: t.systems.fuelTitle, desc: t.systems.fuelDesc, color: "from-amber-500 to-orange-500", url: urls.fueltrack },
    { id: "field360", icon: "📊", title: t.systems.fieldTitle, desc: t.systems.fieldDesc, color: "from-purple-500 to-pink-500", url: urls.field360 },
  ];

  const plans = (t.pricing.plans || []).map((p) => ({ ...p, cta: t.pricing.cta }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <style>{`html { scroll-behavior: smooth }`}</style>

      {/* Innovación */}
      <TechBG />
      <CommandK
        links={[
          { label: "RB SnapLog 360", href: urls.snaplog, icon: "📦", desc: language==="en"?"One-tap POD with photo+GPS":"POD en un toque con foto+GPS" },
          { label: "RB FuelTrack 360", href: urls.fueltrack, icon: "⛽", desc: language==="en"?"Fuel audit & route control":"Auditoría de combustible y rutas" },
          { label: "RB Field360", href: urls.field360, icon: "📊", desc: language==="en"?"Operations hub (flagship)":"Hub operativo (joya de la corona)" },
        ]}
      />

      {/* Toggle idioma */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-lg">
          <button
            onClick={() => setLanguage("en")}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${language==="en"?"bg-blue-600 text-white":"text-gray-700 hover:text-blue-600"}`}
          >EN</button>
          <button
            onClick={() => setLanguage("es")}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${language==="es"?"bg-blue-600 text-white":"text-gray-700 hover:text-blue-600"}`}
          >ES</button>
        </div>
      </div>

      {/* Header */}
      <header
        ref={headerRef}
        className={`fixed w-full z-40 transition-all ${scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="RB Group Solutions LLC" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold text-gray-800">RB Group Solutions LLC</span>
            </div>

            <nav className="hidden md:flex items-center gap-6" aria-label="Primary">
              {NAV.map(({ id, label }) => (
                <a key={id} href={`#${id}`} className="text-gray-700 hover:text-blue-600 font-medium">{label}</a>
              ))}
              <a href="#contact" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg">
                {language==="en" ? "Request demo" : "Solicitar demo"}
              </a>
            </nav>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>

          {isMenuOpen && (
            <div id="mobile-menu" className="md:hidden bg-white/95 backdrop-blur-md rounded-b-xl shadow-lg">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {NAV.map(({ id, label }) => (
                  <a key={id} href={`#${id}`} className="block px-3 py-2 text-gray-700 hover:text-blue-600 font-medium">
                    {label}
                  </a>
                ))}
                <a href="#contact" className="block px-3 py-2 text-white bg-blue-600 rounded-lg font-medium">
                  {language==="en" ? "Request demo" : "Solicitar demo"}
                </a>
              </div>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* Hero */}
        <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">{t.hero.title}</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">{t.hero.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#systems" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg">
                {t.hero.cta1}
              </a>
              <a href="#contact" className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600">
                {t.hero.cta2}
              </a>
            </div>

            {/* KPIs + pista de Command Palette */}
            <StatsBar />
            <p className="mt-3 text-xs text-slate-400">
              {language==="en" ? "Tip: open quick switcher with " : "Consejo: abre el conmutador rápido con "}
              <kbd className="px-1 py-0.5 rounded bg-slate-200">⌘K</kbd> / <kbd className="px-1 py-0.5 rounded bg-slate-200">Ctrl+K</kbd>.
            </p>
          </div>
        </section>

        {/* Suite por rol */}
        <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">{t.services.title}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t.services.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {t.services.roles.map((r, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{r.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Módulos */}
        <section id="systems" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">{t.systems.title}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t.systems.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {modules.map(m => (
                <Tilt key={m.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition border overflow-hidden">
                  <div className={`bg-gradient-to-r ${m.color} p-6 text-white`}>
                    <div className="text-4xl mb-4">{m.icon}</div>
                    <h3 className="text-2xl font-bold">{m.title}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-6 leading-relaxed">{m.desc}</p>
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`w-full bg-gradient-to-r ${m.color} text-white py-3 px-6 rounded-lg font-semibold text-center block`}
                    >
                      {t.systems.view}
                    </a>
                  </div>
                </Tilt>
              ))}
            </div>

            {/* Detalles + botón */}
            <div id="snaplog" className="mt-16 p-8 bg-white rounded-2xl border">
              <h3 className="text-2xl font-bold mb-2">RB SnapLog 360</h3>
              <p className="text-gray-600 mb-4">{t.systems.snaplogDesc}</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-6">
                {(language === "en"
                  ? [
                      "One-tap proof: photo + GPS + timestamp.",
                      "Automatic address from coordinates (reverse geocoding).",
                      "Offline-first with background sync; records are never lost.",
                      "Minimal input: operator’s name only.",
                      "Bilingual interface (EN/ES).",
                    ]
                  : [
                      "POD en un toque: foto + GPS + sello de tiempo.",
                      "Dirección automática desde coordenadas (geocodificación inversa).",
                      "Offline-first con sincronización en segundo plano; los registros no se pierden.",
                      "Interacción mínima: solo nombre del operario.",
                      "Interfaz bilingüe (ES/EN).",
                    ]).map((txt, i) => <li key={i}>{txt}</li>)}
              </ul>
              <a
                href={urls.snaplog}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:shadow-lg"
              >
                {language === "en" ? "Open app" : "Abrir app"}
              </a>
            </div>

            <div id="fueltrack" className="mt-8 p-8 bg-white rounded-2xl border">
              <h3 className="text-2xl font-bold mb-2">RB FuelTrack 360</h3>
              <p className="text-gray-600 mb-4">{t.systems.fuelDesc}</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-6">
                {(language === "en"
                  ? [
                      "Receipt OCR and receiptless validation (odometer / pump / GPS).",
                      "Cost-per-unit tracking and route overview.",
                      "Exception alerts and audit trail.",
                      "Driver-first UX for fast capture on the go.",
                    ]
                  : [
                      "OCR de recibos y validación sin recibo (odómetro / bomba / GPS).",
                      "Cálculo de costo por unidad y vista de ruta.",
                      "Alertas de excepción y traza de auditoría.",
                      "UX pensada para el conductor: captura rápida en movimiento.",
                    ]).map((txt, i) => <li key={i}>{txt}</li>)}
              </ul>
              <a
                href={urls.fueltrack}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-amber-600 text-white font-semibold hover:shadow-lg"
              >
                {language === "en" ? "Open app" : "Abrir app"}
              </a>
            </div>

            <div id="field360" className="mt-8 p-8 bg-white rounded-2xl border">
              <h3 className="text-2xl font-bold mb-2">RB Field360 — {language === "en" ? "Flagship" : "Joya de la corona"}</h3>
              <p className="text-gray-600 mb-4">{t.systems.fieldDesc}</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-6">
                {(language === "en"
                  ? [
                      "Daily records, productivity metrics and payroll.",
                      "Kits/uniforms inventory and consumables control.",
                      "Fleet management and preventive maintenance.",
                      "Role-based permissions and auditable actions.",
                      "Executive dashboards and advanced analytics.",
                    ]
                  : [
                      "Registros diarios, métricas de productividad y nómina.",
                      "Inventario de kits/uniformes y control de consumibles.",
                      "Gestión de flota y mantenimiento preventivo.",
                      "Permisos por rol y acciones auditables.",
                      "Tableros ejecutivos y analítica avanzada.",
                    ]).map((txt, i) => <li key={i}>{txt}</li>)}
              </ul>
              <a
                href={urls.field360}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-purple-700 text-white font-semibold hover:shadow-lg"
              >
                {language === "en" ? "Open app" : "Abrir app"}
              </a>
            </div>
          </div>
        </section>

        {/* Precios */}
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">{t.pricing.title}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t.pricing.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map(p => (
                <div key={p.name} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h3 className="text-2xl font-bold mb-2">{p.name}</h3>
                  <div className="text-3xl font-extrabold text-blue-600 mb-4">{p.price}</div>
                  <ul className="space-y-2 text-gray-600 mb-6">
                    {p.items.map((it, i) => <li key={i}>• {it}</li>)}
                  </ul>
                  <a href="#contact" className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-center block">
                    {p.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">{t.faq.title}</h2>
            </div>
            <div className="space-y-6">
              {t.faq.items.map((f, i) => (
                <details key={i} className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
                  <summary className="font-semibold text-gray-800 cursor-pointer flex justify-between items-center">
                    <span>{f.q}</span>
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-3 text-gray-600">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Contacto */}
        <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">{t.contact.title}</h2>
            <p className="text-xl mb-8 text-gray-300">{t.contact.subtitle}</p>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert(language === "en" ? "Thanks! We’ll get back to you shortly." : "¡Gracias! Te contactaremos muy pronto.");
                }}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <input type="text" placeholder={t.contact.form.name}
                         className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  <input type="email" placeholder={t.contact.form.email}
                         className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <select className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="">
                  <option value="">{t.contact.form.system}</option>
                  {t.contact.options.map((opt) => <option key={opt} value={opt.toLowerCase()}>{opt}</option>)}
                </select>
                <textarea rows={4} placeholder={t.contact.form.message}
                          className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:shadow-lg">
                  {t.contact.form.submit}
                </button>
              </form>
            </div>

            <p className="text-gray-400">
              {t.contact.direct}{" "}
              <a href="mailto:info@rbgroupsolutions.com" className="text-blue-400 hover:text-blue-300">
                info@rbgroupsolutions.com
              </a>
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img src="/logo.png" alt="RB Group Solutions LLC" className="w-10 h-10 object-contain" />
                <span className="text-xl font-bold">RB Group Solutions LLC</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                {language==="en"
                  ? "Technology solutions to transform your company's operational efficiency."
                  : "Soluciones tecnológicas para transformar la eficiencia operativa de tu empresa."}
              </p>
              <div className="text-gray-400">{t.citiesLine}</div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">{language==="en"?"Links":"Enlaces"}</h4>
              <ul className="space-y-2 text-gray-400">
                {NAV.map(({id,label}) => (
                  <li key={id}><a href={`#${id}`} className="hover:text-white transition-colors">{label}</a></li>
                ))}
                <li><a href="#privacy" className="hover:text-white transition-colors">{language==="en"?"Privacy Policy":"Política de Privacidad"}</a></li>
                <li><a href="#terms" className="hover:text-white transition-colors">{language==="en"?"Terms of Service":"Términos del Servicio"}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">{language==="en"?"Contact":"Contacto"}</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📧 info@rbgroupsolutions.com</li>
                <li>📞 +1 (773) 263-7256</li>
                <li>📍 Norridge / Chicago, IL</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} RB Group Solutions LLC. {language==="en"?"All rights reserved.":"Todos los derechos reservados."}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
