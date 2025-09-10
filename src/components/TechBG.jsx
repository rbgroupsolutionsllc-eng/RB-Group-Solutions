import { useEffect, useRef } from "react";

/** Fondo de partículas con líneas (constelaciones) */
export default function TechBG() {
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
      // gradiente azules → púrpuras
      return 210 + 60 * Math.sin(t * 0.0003);
    }

    function step(t) {
      ctx.clearRect(0, 0, w, h);

      // puntos
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // leve atracción al mouse
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

    resize(); init(); rafId = requestAnimationFrame(step);
    window.addEventListener("resize", () => { resize(); init(); });
    window.addEventListener("mousemove", onMouse, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouse);
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
