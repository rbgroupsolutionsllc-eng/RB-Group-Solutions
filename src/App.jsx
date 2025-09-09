import React, { useEffect, useMemo, useRef, useState } from "react";
import "./index.css";

/** --- Utils SEO --- */
function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}
function setSEO({ title, description, url }: { title: string; description: string; url?: string }) {
  document.title = title;
  upsertMeta('meta[name="description"]', { name: "description", content: description });
  upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
  upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
  upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
  if (url) upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
}

/** --- JSON-LD (schema.org) --- */
function injectJSONLD(payload: object, id = "rb-jsonld") {
  let tag = document.getElementById(id) as HTMLScriptElement | null;
  if (!tag) {
    tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.id = id;
    document.head.appendChild(tag);
  }
  tag.textContent = JSON.stringify(payload);
}

/** --- Env email (Vite/Next) --- */
const CONTACT_EMAIL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_CONTACT_EMAIL) ||
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_CONTACT_EMAIL) ||
  "info@rbgroupsolutions.com";

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [language, setLanguage] = useState<"es" | "en">(
    (localStorage.getItem("rb_lang") as "es" | "en") || "es"
  );
  const headerRef = useRef<HTMLElement>(null);

  // Scroll state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Persist language + SEO + JSON-LD
  useEffect(() => {
    localStorage.setItem("rb_lang", language);
    const title = "RB Field Pro 360 | RB Group Solutions LLC";
    const desc =
      language === "en"
        ? "One platform. Three modules. Real-time operations for drivers, deliveries and field management."
        : "Una plataforma. Tres módulos. Operaciones en tiempo real para drivers, entregas y gestión de campo.";
    setSEO({ title, description: desc, url: window.location.href });

    injectJSONLD({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "RB Group Solutions LLC",
      url: window.location.origin,
      sameAs: ["mailto:" + CONTACT_EMAIL],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Norridge / Chicago",
        addressRegion: "IL",
        addressCountry: "US",
      },
    });
  }, [language]);

  // Smooth scroll con offset del header fijo
  useEffect(() => {
    const handler = (e: Event) => {
      const a = e.target as HTMLAnchorElement;
      if (a.tagName !== "A") return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      const el = document.querySelector(href) as HTMLElement | null;
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
          { title: "Drivers", body: "RB FuelTrack 360 — OCR receipts, no-receipt audit (odometer + pump + GPS), route overview." },
          { title: "Deliveries", body: "RB SnapLog 360 — enterprise-grade proof of delivery with photo, GPS and reverse geocoding." },
          { title: "Operations / Warehouse / Finance", body: "RB Field360 — records, analytics & payroll; fleet and warehouse control." },
        ],
      },
      systems: {
        title: "Modules",
        subtitle: "Mix and match what your team needs. Everything stays consistent under RB Field Pro 360.",
        snaplogTitle: "RB SnapLog 360",
        snaplogDesc:
          "Enterprise-grade Proof of Delivery (POD). Guided capture with photo and GPS, automatic address (reverse geocoding), fraud-prevention policies, and exportable reports. Integrates with Firebase/Google Sheets.",
        fuelTitle: "RB FuelTrack 360",
        fuelDesc:
          "Fuel and route control with automated audit. OCR for receipts, receiptless flow with odometer/pump/GPS validation, cost per unit tracking, and exception alerts. Designed for driver simplicity.",
        fieldTitle: "RB Field360",
        fieldDesc:
          "All-in-one operational dashboard: daily records, productivity and payroll; inventory of kits/uniforms; fleet and maintenance; role-based permissions and analytics.",
        view: "See details",
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
          { q: "Where is data stored?", a: "On a dedicated database exclusively for your company, with role-based security. Exports to Sheets, Excel and PDF are available." },
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
          "Prueba de Entrega (POD) de nivel empresarial. Captura guiada con foto y GPS, dirección automática (geocodificación inversa), políticas antifraude y reportes/exportaciones. Integración con Firebase/Google Sheets.",
        fuelTitle: "RB FuelTrack 360",
        fuelDesc:
          "Control de combustible y ruta con auditoría automática. OCR de recibos, flujo sin recibo con validación de odómetro/bomba/GPS, costo por unidad y alertas de excepción. Diseñado para simplicidad del driver.",
        fieldTitle: "RB Field360",
        fieldDesc:
          "Dashboard operativo integral: registros diarios, productividad y nómina; inventario de kits/uniformes; flota y mantenimiento; permisos por rol y analítica.",
        view: "Ver detalles",
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
          { q: "¿Dónde se guardan los datos?", a: "En una base de datos dedicada para tu empresa, con seguridad por roles. También ofrecemos exportaciones a Sheets, Excel y PDF." },
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
  } as const)[language], [language]);

  const NAV = [
    { id: "home", label: t.menu.home },
    { id: "services", label: t.menu.services },
    { id: "systems", label: t.menu.systems },
    { id: "pricing", label: t.menu.pricing },
    { id: "faq", label: t.menu.faq },
    { id: "contact", label: t.menu.contact },
  ];

  // URLs reales de las apps
  const urls = {
    snaplog: "https://sl360.rbgroupsolutions.com",
    fueltrack: "https://gas360.rbgroupsolutions.com",
    field360: "https://field360.rbgroupsolutions.com",
  } as const;

  const modules = [
    { id: "snaplog", icon: "📦", title: t.systems.snaplogTitle, desc: t.systems.snaplogDesc, color: "from-blue-500 to-cyan-500", url: urls.snaplog },
    { id: "fueltrack", icon: "⛽", title: t.systems.fuelTitle, desc: t.systems.fuelDesc, color: "from-amber-500 to-orange-500", url: urls.fueltrack },
    { id: "field360", icon: "📊", title: t.systems.fieldTitle, desc: t.systems.fieldDesc, color: "from-purple-500 to-pink-500", url: urls.field360 },
  ];

  const plans = (t.pricing.plans || []).map((p) => ({ ...p, cta: t.pricing.cta }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <style>{`html { scroll-behavior: smooth }`}</style>

      {/* Toggle idioma */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-lg">
          <button
            onClick={() => setLanguage("en")}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${language==="en"?"bg-blue-600 text-white":"text-gray-700 hover:text-blue-600"}`}
            aria-pressed={language === "en"}
          >EN</button>
          <button
            onClick={() => setLanguage("es")}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${language==="es"?"bg-blue-600 text-white":"text-gray-700 hover:text-blue-600"}`}
            aria-pressed={language === "es"}
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
                <div key={m.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 border overflow-hidden">
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
                </div>
              ))}
            </div>

            {/* Detalles rápidos con enlace a la app */}
            <div id="snaplog" className="mt-16 p-8 bg-white rounded-2xl border">
              <h3 className="text-2xl font-bold mb-2">RB SnapLog 360</h3>
              <p className="text-gray-600 mb-4">{t.systems.snaplogDesc}</p>
              <a href={urls.snaplog} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">
                {language === "en" ? "Open app" : "Abrir app"} → {urls.snaplog}
              </a>
            </div>
            <div id="fueltrack" className="mt-8 p-8 bg-white rounded-2xl border">
              <h3 className="text-2xl font-bold mb-2">RB FuelTrack 360</h3>
              <p className="text-gray-600 mb-4">{t.systems.fuelDesc}</p>
              <a href={urls.fueltrack} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">
                {language === "en" ? "Open app" : "Abrir app"} → {urls.fueltrack}
              </a>
            </div>
            <div id="field360" className="mt-8 p-8 bg-white rounded-2xl border">
              <h3 className="text-2xl font-bold mb-2">RB Field360</h3>
              <p className="text-gray-600 mb-4">{t.systems.fieldDesc}</p>
              <a href={urls.field360} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">
                {language === "en" ? "Open app" : "Abrir app"} → {urls.field360}
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
                    {p.items.map((it: string, i: number) => <li key={i}>• {it}</li>)}
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
                  {t.contact.options.map((opt: string) => <option key={opt} value={opt.toLowerCase()}>{opt}</option>)}
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
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-400 hover:text-blue-300">
                {CONTACT_EMAIL}
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
                <li>📧 {CONTACT_EMAIL}</li>
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
};

export default App;
