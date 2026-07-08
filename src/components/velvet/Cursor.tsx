import { useEffect, useRef } from "react";

export function Cursor() {
  const orb = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    document.documentElement.style.cursor = "none";

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx;
    let y = ty;
    let px = tx;
    let py = ty;
    let hovering = false;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      hovering = !!t.closest("a, button, [data-magnetic]");
    };

    const particles: HTMLDivElement[] = [];
    const pool = 14;
    if (trailRef.current) {
      for (let i = 0; i < pool; i++) {
        const p = document.createElement("div");
        p.className =
          "pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-[color:var(--lavender)] opacity-0";
        p.style.boxShadow = "0 0 12px rgba(167,139,250,0.9)";
        trailRef.current.appendChild(p);
        particles.push(p);
      }
    }
    let pi = 0;
    let last = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt = Math.min(50, now - last);
      last = now;
      px = x;
      py = y;
      x += (tx - x) * 0.28;
      y += (ty - y) * 0.28;
      const vx = x - px;
      const vy = y - py;
      const speed = Math.min(80, Math.hypot(vx, vy) * (16 / Math.max(1, dt)));
      const angle = (Math.atan2(vy, vx) * 180) / Math.PI;
      const stretch = 1 + speed / 40;
      const squish = 1 / Math.sqrt(stretch);
      const scale = hovering ? 2.6 : 1;

      if (orb.current) {
        orb.current.style.transform = `translate3d(${x - 9}px, ${y - 9}px, 0) rotate(${angle}deg) scale(${stretch * scale}, ${squish * scale})`;
      }
      if (halo.current) {
        halo.current.style.transform = `translate3d(${x - 26}px, ${y - 26}px, 0) scale(${hovering ? 1.4 : 1})`;
        halo.current.style.opacity = hovering ? "0.9" : "0.35";
      }
      // shed particles when moving fast
      if (speed > 6 && particles[pi]) {
        const el = particles[pi];
        el.style.transform = `translate3d(${x - 3}px, ${y - 3}px, 0)`;
        el.style.opacity = "1";
        el.style.transition = "opacity 700ms ease-out, transform 700ms ease-out";
        requestAnimationFrame(() => {
          el.style.opacity = "0";
          el.style.transform = `translate3d(${x - 3 + (Math.random() - 0.5) * 24}px, ${y - 3 + (Math.random() - 0.5) * 24}px, 0)`;
        });
        pi = (pi + 1) % pool;
      }
      requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.documentElement.style.cursor = "";
      particles.forEach((p) => p.remove());
    };
  }, []);

  return (
    <>
      <div ref={trailRef} className="pointer-events-none fixed inset-0 z-[9998] hidden md:block" />
      <div
        ref={halo}
        className="pointer-events-none fixed left-0 top-0 z-[9998] hidden h-[52px] w-[52px] rounded-full md:block"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(196,181,253,0.35), rgba(124,58,237,0) 65%)",
          transition: "opacity 300ms ease",
          willChange: "transform, opacity",
        }}
      />
      <div
        ref={orb}
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-[18px] w-[18px] rounded-full md:block"
        style={{
          background: "radial-gradient(circle at 30% 25%, #f4ecff 0%, #a78bfa 40%, #4c1d95 80%)",
          boxShadow:
            "0 0 22px rgba(167,139,250,0.7), inset -2px -3px 6px rgba(76,29,149,0.6), inset 2px 2px 3px rgba(255,255,255,0.6)",
          willChange: "transform",
        }}
      />
    </>
  );
}
