import { motion } from "framer-motion";
import { useMemo } from "react";

// Deterministic pseudo-random so the iris/stars are stable across renders + SSR.
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const CX = 310;
const CY = 410;

function Asterisk({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="-50 -50 100 100" className={className} style={style} aria-hidden>
      <g fill="currentColor">
        {[0, 60, 120].map((a) => (
          <rect key={a} x={-9} y={-48} width={18} height={96} rx={9} transform={`rotate(${a})`} />
        ))}
      </g>
    </svg>
  );
}

function ClockEye() {
  // Fibrous iris streaks radiating from the pupil to the rim.
  const streaks = useMemo(
    () =>
      Array.from({ length: 150 }, (_, i) => {
        const a = (i / 150) * Math.PI * 2 + (rand(i) - 0.5) * 0.06;
        const rOut = 150 + rand(i + 7) * 28;
        return {
          x1: CX + Math.cos(a) * 60,
          y1: CY + Math.sin(a) * 60,
          x2: CX + Math.cos(a) * rOut,
          y2: CY + Math.sin(a) * rOut,
          w: 0.8 + rand(i + 3) * 2.2,
          o: 0.35 + rand(i + 5) * 0.55,
          light: rand(i + 11) > 0.6,
        };
      }),
    [],
  );

  // Brighter violet clumps around the mid-iris.
  const clumps = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => {
        const a = (i / 11) * Math.PI * 2 + rand(i) * 0.4;
        const r = 92 + rand(i + 2) * 55;
        return {
          cx: CX + Math.cos(a) * r,
          cy: CY + Math.sin(a) * r,
          rx: 9 + rand(i + 4) * 16,
          ry: 24 + rand(i + 6) * 30,
          rot: (a * 180) / Math.PI + 90,
          o: 0.22 + rand(i + 8) * 0.28,
        };
      }),
    [],
  );

  return (
    <svg
      viewBox="0 0 620 730"
      className="h-full w-full"
      style={{ filter: "drop-shadow(0 0 34px rgba(124,58,237,0.35))" }}
      aria-hidden
    >
      <defs>
        <clipPath id="faceClip">
          <circle cx={CX} cy={CY} r={178} />
        </clipPath>
        <radialGradient id="face" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2a1550" />
          <stop offset="70%" stopColor="#180b30" />
          <stop offset="100%" stopColor="#100722" />
        </radialGradient>
        <radialGradient id="iris" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="60%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#5b21b6" />
        </radialGradient>
        <pattern id="halftone" width={8} height={8} patternUnits="userSpaceOnUse">
          <circle cx={2} cy={2} r={1.7} fill="#c9b8f5" />
        </pattern>
        <radialGradient id="htMask" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.85} />
          <stop offset="55%" stopColor="#fff" stopOpacity={0.28} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <mask id="htMaskUse">
          <rect x={CX - 178} y={CY - 178} width={356} height={356} fill="url(#htMask)" />
        </mask>
      </defs>

      {/* feet */}
      <g stroke="var(--ink-2)" strokeWidth={16} strokeLinecap="round">
        <line x1={250} y1={598} x2={230} y2={664} />
        <line x1={372} y1={598} x2={392} y2={664} />
      </g>

      {/* bells + handle + hammer */}
      <g stroke="var(--ink-2)" strokeWidth={15} strokeLinejoin="round" fill="none">
        <circle cx={196} cy={146} r={72} />
        <circle cx={424} cy={146} r={72} />
        <path d="M200 98 Q310 -8 420 98" strokeWidth={14} strokeLinecap="round" />
        <line x1={310} y1={70} x2={310} y2={150} strokeWidth={10} strokeLinecap="round" />
      </g>
      <circle cx={310} cy={64} r={12} fill="var(--ink-2)" />

      {/* rim + face */}
      <circle cx={CX} cy={CY} r={205} fill="url(#face)" stroke="var(--ink-2)" strokeWidth={18} />
      <circle cx={CX} cy={CY} r={183} fill="none" stroke="var(--ink-2)" strokeWidth={3.5} opacity={0.7} />

      {/* iris */}
      <g clipPath="url(#faceClip)">
        {clumps.map((c, i) => (
          <ellipse
            key={`c${i}`}
            cx={c.cx}
            cy={c.cy}
            rx={c.rx}
            ry={c.ry}
            fill="url(#iris)"
            opacity={c.o}
            transform={`rotate(${c.rot} ${c.cx} ${c.cy})`}
          />
        ))}
        {streaks.map((s, i) => (
          <line
            key={`s${i}`}
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            stroke={s.light ? "#e4d9fb" : "#a78bfa"}
            strokeWidth={s.w}
            opacity={s.o}
            strokeLinecap="round"
          />
        ))}
        {/* halftone shading concentrated toward the pupil */}
        <rect
          x={CX - 178}
          y={CY - 178}
          width={356}
          height={356}
          fill="url(#halftone)"
          mask="url(#htMaskUse)"
          opacity={0.5}
        />
      </g>

      {/* pupil */}
      <circle cx={CX} cy={CY} r={58} fill="var(--void)" stroke="#7c3aed" strokeWidth={2} opacity={1} />
      <circle cx={CX - 18} cy={CY - 20} r={11} fill="#e4d9fb" opacity={0.9} />

      {/* falling figure, drifting toward the pupil */}
      <g transform={`translate(${CX} ${CY - 82})`}>
        <g
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            animation: "grind-fall 3.6s ease-in-out infinite",
          }}
        >
          <g stroke="#efe9fb" strokeWidth={2.8} strokeLinecap="round" fill="none" transform="scale(1.55)">
            <circle cx={0} cy={-15} r={5} fill="#efe9fb" stroke="none" />
            <line x1={0} y1={-10} x2={1} y2={7} />
            <line x1={0} y1={-6} x2={-13} y2={-15} />
            <line x1={0} y1={-6} x2={14} y2={-16} />
            <line x1={1} y1={7} x2={-9} y2={20} />
            <line x1={1} y1={7} x2={11} y2={18} />
          </g>
        </g>
      </g>
    </svg>
  );
}

function GalaxyClip({ style }: { style?: React.CSSProperties }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({ x: rand(i) * 200, y: rand(i + 40) * 150, r: 0.4 + rand(i + 9) * 0.9 })),
    [],
  );
  return (
    <div style={style}>
      <div style={{ border: "1.5px solid var(--ink-2)", background: "#0d0322", overflow: "hidden" }}>
        <svg viewBox="0 0 200 150" className="block w-full" aria-hidden>
          <defs>
            <radialGradient id="core" cx="42%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#f6f0fc" />
              <stop offset="35%" stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#4c1d95" stopOpacity={0} />
            </radialGradient>
          </defs>
          <rect width={200} height={150} fill="#0d0322" />
          {stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#d9cdf5" opacity={0.8} />
          ))}
          <g transform="translate(100 76) rotate(-24)">
            <ellipse rx={78} ry={27} fill="none" stroke="#8b5cf6" strokeWidth={1} opacity={0.5} />
            <ellipse rx={58} ry={19} fill="none" stroke="#a78bfa" strokeWidth={1} opacity={0.55} />
            <ellipse cx={0} cy={0} rx={54} ry={40} fill="url(#core)" />
            <circle r={9} fill="#f6f0fc" />
          </g>
        </svg>
      </div>
      <p
        className="grind-meta"
        style={{ marginTop: "0.7rem", fontSize: "clamp(0.5rem, 0.72vw, 0.72rem)", lineHeight: 1.4, letterSpacing: 0, textTransform: "none", opacity: 0.62 }}
      >
        Messier 81 — a spiral in Ursa Major. Everything falls toward the center.
      </p>
    </div>
  );
}

export function GravityGrind() {
  return (
    <section className="grind-stage relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-12%" }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] as const }}
        className="absolute inset-0"
      >
        {/* kicker + chapter tag (top-right, clear of the corner sphere) */}
        <div style={{ position: "absolute", top: "8%", right: "clamp(1.5rem,4vw,5rem)", textAlign: "right" }}>
          <div className="grind-meta" style={{ fontSize: "clamp(0.9rem,1.5vw,1.6rem)" }}>
            <span style={{ color: "var(--accent)" }}>✱</span> Rise and
          </div>
          <div className="font-label" style={{ marginTop: "0.5rem", color: "var(--ink-2)", opacity: 0.6 }}>
            — chapter v · gravity
          </div>
        </div>

        {/* hero */}
        <h2
          className="grind-display"
          style={{
            position: "absolute",
            top: "11%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "clamp(5rem, 17vw, 20rem)",
            color: "var(--ink)",
            whiteSpace: "nowrap",
          }}
        >
          Grind
        </h2>

        {/* centerpiece */}
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: "27%", height: "62vh", zIndex: 2 }}>
          <ClockEye />
        </div>

        {/* galaxy clip, to the upper-right of the clock */}
        <GalaxyClip style={{ position: "absolute", top: "30%", left: "62%", width: "clamp(150px, 15vw, 260px)", zIndex: 3 }} />

        {/* rotating asterisk to the lower-left of the clock */}
        <Asterisk
          style={{
            position: "absolute",
            top: "52%",
            left: "clamp(18%, 24vw, 30%)",
            width: "clamp(70px, 8vw, 130px)",
            color: "var(--accent)",
            zIndex: 2,
            transformBox: "fill-box",
            transformOrigin: "center",
            animation: "grind-spin 44s linear infinite",
            filter: "drop-shadow(0 0 18px rgba(124,58,237,0.4))",
          }}
        />
        {/* accent bar */}
        <div
          style={{
            position: "absolute",
            top: "60%",
            left: "30%",
            width: "clamp(80px,9vw,150px)",
            height: "clamp(14px,1.6vw,26px)",
            background: "linear-gradient(90deg, var(--accent), #c4b5fd)",
            transform: "rotate(-18deg)",
            zIndex: 1,
            borderRadius: 2,
          }}
        />

        {/* manifesto blocks in the corners */}
        <div
          className="grind-block"
          style={{ position: "absolute", top: "40%", left: "clamp(1.5rem,4vw,5rem)", width: "clamp(150px,15vw,260px)", fontSize: "clamp(0.8rem,1.1vw,1.15rem)", zIndex: 3 }}
        >
          Don't stop when you're tired. Stop when you're done.
        </div>
        <div
          className="grind-block"
          style={{ position: "absolute", bottom: "9%", left: "clamp(1.5rem,4vw,5rem)", width: "clamp(160px,17vw,300px)", fontSize: "clamp(0.8rem,1.1vw,1.15rem)", zIndex: 3 }}
        >
          Consistently putting in the hard work.
        </div>
        <div
          className="grind-block"
          style={{ position: "absolute", bottom: "9%", right: "clamp(1.5rem,4vw,5rem)", width: "clamp(160px,17vw,300px)", fontSize: "clamp(0.8rem,1.1vw,1.15rem)", textAlign: "right", zIndex: 3 }}
        >
          Winning is the only option.
        </div>
      </motion.div>
    </section>
  );
}
