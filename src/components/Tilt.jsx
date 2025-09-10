import { useEffect, useRef } from "react";

/** Contenedor con efecto 3D tilt + spotlight */
export default function Tilt({ children, className = "" }) {
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
