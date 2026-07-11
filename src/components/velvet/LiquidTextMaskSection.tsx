import { useEffect, useId, useMemo, useRef } from "react";

type LiquidTextMaskSectionProps = {
  lines: readonly string[];
  blobColor: string;
};

type TextSlot = {
  y: number;
  length: number;
};

const VIEW_BOX = { width: 1731, height: 1280 } as const;
// Where the ink rests / idles when the pointer is away — upper-left of the type block.
const REST = { x: 560, y: 509 };
const NODE_COUNT = 28;
const HEADLINE_FONT_SIZE = 166;

const FOUR_LINE_SLOTS: TextSlot[] = [
  { y: 549, length: 1538 },
  { y: 697, length: 1228 },
  { y: 841, length: 1495 },
  { y: 985, length: 756 },
];

const THREE_LINE_SLOTS: TextSlot[] = [
  { y: 569, length: 1568 },
  { y: 724, length: 1338 },
  { y: 879, length: 1372 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(color: string) {
  const clean = color.trim().replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((v) => v + v)
          .join("")
      : clean;
  if (!/^[0-9a-f]{6}$/i.test(full)) return { r: 91, g: 33, b: 182 };
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return `#${[r, g, b]
    .map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mix(a: string, b: string, amount: number) {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex({
    r: x.r + (y.r - x.r) * amount,
    g: x.g + (y.g - x.g) * amount,
    b: x.b + (y.b - x.b) * amount,
  });
}

function createPalette(blobColor: string) {
  return {
    light: mix(blobColor, "#ffffff", 0.55),
    mid: blobColor,
    deep: mix(blobColor, "#0b0018", 0.4),
    glow: mix(blobColor, "#f4ecff", 0.4),
  };
}

// Radii: a big bulbous head tapering smoothly to a fine tail point — a liquid drop with a
// long flowing tail (like the reference), not a uniform blob.
function radiusAt(i: number) {
  const t = i / (NODE_COUNT - 1);
  return 92 * Math.pow(1 - t, 0.72) + 5;
}

function createTextSlots(lineCount: number): TextSlot[] {
  if (lineCount === 3) return THREE_LINE_SLOTS;
  if (lineCount === 4) return FOUR_LINE_SLOTS;
  const top = 513;
  const bottom = 989;
  const step = lineCount <= 1 ? 0 : (bottom - top) / (lineCount - 1);
  return Array.from({ length: lineCount }, (_, i) => ({
    y: top + step * i,
    length: i === lineCount - 1 ? 980 : 1480,
  }));
}

function HeadlineText({
  fill,
  lines,
  slots,
}: {
  fill: string;
  lines: readonly string[];
  slots: TextSlot[];
}) {
  return (
    <text
      fill={fill}
      fontFamily={`"Arial Black", "Helvetica Neue", Arial, sans-serif`}
      fontSize={HEADLINE_FONT_SIZE}
      fontWeight="900"
      textAnchor="middle"
      style={{ textRendering: "geometricPrecision", textTransform: "uppercase" }}
    >
      {lines.map((line, i) => {
        const slot = slots[i] ?? slots[slots.length - 1];
        return (
          <tspan
            key={`${line}-${i}`}
            x={VIEW_BOX.width / 2}
            y={slot.y}
            lengthAdjust="spacingAndGlyphs"
            textLength={slot.length}
          >
            {line}
          </tspan>
        );
      })}
    </text>
  );
}

export function LiquidTextMaskSection({ lines, blobColor }: LiquidTextMaskSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ids = useMemo(
    () => ({
      goo: `liquid-goo-${rawId}`,
      ink: `liquid-ink-${rawId}`,
      gloss: `liquid-gloss-${rawId}`,
      clip: `liquid-clip-${rawId}`,
    }),
    [rawId],
  );
  const palette = useMemo(() => createPalette(blobColor), [blobColor]);
  const slots = useMemo(() => createTextSlots(lines.length), [lines.length]);
  // Integer radii: keeps the SSR and client attribute strings identical (no hydration mismatch).
  const radii = useMemo(
    () => Array.from({ length: NODE_COUNT }, (_, i) => Math.round(radiusAt(i))),
    [],
  );

  useEffect(() => {
    const section = sectionRef.current;
    const svg = svgRef.current;
    if (!section || !svg) return;

    const nodes = svg.querySelectorAll<SVGCircleElement>("[data-node]");
    if (nodes.length === 0) return;

    // The chain of node positions (index 0 = head). One source of truth; every
    // circle with the same data-node index mirrors it (visible ink + mask).
    const chain = Array.from({ length: NODE_COUNT }, (_, i) => ({
      x: REST.x - i * 4,
      y: REST.y,
    }));
    const target = { x: REST.x, y: REST.y };
    const trail = Array.from({ length: 80 }, (_, i) => ({
      x: REST.x - i * 4,
      y: REST.y,
    }));
    let pointerInside = false;
    let filteredSpeed = 0;
    let trailLength = 138;
    let rect = svg.getBoundingClientRect();
    // Radius-weighted offsets keep every circle overlapping even when the stroke is fully stretched.
    let spineSum = 0;
    const trailOffsets = radii.map((_, i) => {
      if (i > 0) spineSum += radii[i - 1] + radii[i];
      return spineSum;
    });
    for (let i = 0; i < trailOffsets.length; i += 1) {
      trailOffsets[i] /= spineSum;
    }

    const paint = () => {
      nodes.forEach((circle) => {
        const i = Number(circle.dataset.node);
        const n = chain[i];
        if (!n) return;
        circle.setAttribute("cx", n.x.toFixed(1));
        circle.setAttribute("cy", n.y.toFixed(1));
      });
    };

    // Reduced motion / SSR-guard: draw a calm resting blob and stop.
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      paint();
      return;
    }

    const toSvg = (clientX: number, clientY: number) => ({
      x: clamp(((clientX - rect.left) / rect.width) * VIEW_BOX.width, 40, VIEW_BOX.width - 40),
      y: clamp(((clientY - rect.top) / rect.height) * VIEW_BOX.height, 40, VIEW_BOX.height - 40),
    });

    const sampleTrail = (distance: number) => {
      let covered = 0;
      for (let i = 1; i < trail.length; i += 1) {
        const newer = trail[i - 1];
        const older = trail[i];
        const segment = Math.hypot(older.x - newer.x, older.y - newer.y);
        if (covered + segment >= distance) {
          const amount = segment > 0 ? (distance - covered) / segment : 0;
          return {
            x: newer.x + (older.x - newer.x) * amount,
            y: newer.y + (older.y - newer.y) * amount,
          };
        }
        covered += segment;
      }
      return trail[trail.length - 1];
    };

    let raf = 0;
    let running = false;
    let last = performance.now();
    let t = 0;

    const frame = (now: number) => {
      const dt = clamp((now - last) / 1000, 0.008, 0.05);
      last = now;
      t += dt;

      // Idle drift: a slow, small wander so the resting drop stays compact (low speed → short).
      if (!pointerInside) {
        target.x = REST.x + Math.sin(t * 0.28) * 120 + Math.sin(t * 0.15) * 45;
        target.y = REST.y + Math.sin(t * 0.24 + 1.3) * 70 + Math.cos(t * 0.4) * 22;
      }

      // The head follows tightly, while the body is sampled from its real curved travel path.
      const prevHx = chain[0].x;
      const prevHy = chain[0].y;
      const hf = 1 - Math.exp(-dt * (pointerInside ? 18 : 6));
      chain[0].x += (target.x - chain[0].x) * hf;
      chain[0].y += (target.y - chain[0].y) * hf;

      const headStep = Math.hypot(chain[0].x - prevHx, chain[0].y - prevHy);
      const rawSpeed = headStep / Math.max(dt, 0.001);
      filteredSpeed +=
        (rawSpeed - filteredSpeed) * (1 - Math.exp(-dt * (rawSpeed > filteredSpeed ? 12 : 5)));

      // Record enough intermediate points that a fast flick still draws a smooth, curved stroke.
      if (headStep > 0.6) {
        const steps = Math.min(8, Math.ceil(headStep / 7));
        for (let step = 1; step <= steps; step += 1) {
          const amount = step / steps;
          trail.unshift({
            x: prevHx + (chain[0].x - prevHx) * amount,
            y: prevHy + (chain[0].y - prevHy) * amount,
          });
        }
      } else {
        trail[0] = { x: chain[0].x, y: chain[0].y };
      }

      let recordedLength = 0;
      let keep = trail.length;
      for (let i = 1; i < trail.length; i += 1) {
        recordedLength += Math.hypot(trail[i].x - trail[i - 1].x, trail[i].y - trail[i - 1].y);
        if (recordedLength > 980 || i > 260) {
          keep = i + 1;
          break;
        }
      }
      trail.length = keep;

      // Speed stretches the liquid; stopping lets it reform gradually instead of snapping back.
      const speedIntent = pointerInside ? clamp((filteredSpeed - 45) / 1050, 0, 1) : 0;
      const stretched = 1 - Math.pow(1 - speedIntent, 2.4);
      const targetLength = 138 + stretched * 690;
      const lengthEase = targetLength > trailLength ? 10 : 3.2;
      trailLength += (targetLength - trailLength) * (1 - Math.exp(-dt * lengthEase));

      // Sample the actual pointer path, then add only a restrained normal ripple. The SVG goo
      // filter fuses these tapered nodes into the single brush-like body seen in the reference.
      for (let i = 1; i < NODE_COUNT; i += 1) {
        const node = chain[i];
        const distance = trailLength * trailOffsets[i];
        const point = sampleTrail(distance);
        const ahead = sampleTrail(Math.max(0, distance - 12));
        const tx = point.x - ahead.x;
        const ty = point.y - ahead.y;
        const tangentLength = Math.hypot(tx, ty) || 1;
        const rippleStrength = Math.min(1, filteredSpeed / 620);
        const ripple =
          Math.sin(t * 2 + i * 0.68) * (1.5 + (i / (NODE_COUNT - 1)) * 5.5) * rippleStrength;
        const targetX = point.x + (-ty / tangentLength) * ripple;
        const targetY = point.y + (tx / tangentLength) * ripple;
        const f = 1 - Math.exp(-dt * Math.max(9, 18 - i * 0.22));
        node.x += (targetX - node.x) * f;
        node.y += (targetY - node.y) * f;
      }

      paint();
      raf = requestAnimationFrame(frame);
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onEnter = (event: PointerEvent) => {
      rect = svg.getBoundingClientRect();
      pointerInside = true;
      const point = toSvg(event.clientX, event.clientY);
      target.x = point.x;
      target.y = point.y;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      pointerInside = true;
      const p = toSvg(e.clientX, e.clientY);
      target.x = p.x;
      target.y = p.y;
    };
    const onLeave = () => {
      pointerInside = false;
    };
    const onResize = () => {
      rect = svg.getBoundingClientRect();
    };

    // Only animate while the section is on-screen (perf: costs nothing elsewhere).
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? startLoop() : stopLoop()),
      { threshold: 0 },
    );
    io.observe(section);

    section.addEventListener("pointerenter", onEnter);
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, { passive: true });
    paint();
    // Start now (in case the section is already in view on mount); the observer
    // pauses it as soon as it reports the section is off-screen.
    startLoop();

    return () => {
      stopLoop();
      io.disconnect();
      section.removeEventListener("pointerenter", onEnter);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize);
    };
  }, [radii]);

  const initial = radii.map((_, i) => ({ x: REST.x - i * 4, y: REST.y, r: radii[i] }));

  return (
    <section
      ref={sectionRef}
      id="philosophy"
      data-hide-custom-cursor="true"
      className="liquid-text-section relative z-10 overflow-hidden py-[14vh]"
    >
      <h2 className="sr-only">{lines.join(" ")}</h2>
      <div className="liquid-text-stage relative w-full overflow-hidden">
        <svg
          ref={svgRef}
          aria-hidden="true"
          className="liquid-text-canvas block h-auto w-full"
          viewBox={`0 0 ${VIEW_BOX.width} ${VIEW_BOX.height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* The goo: blur then threshold the alpha so overlapping circles melt into
                one smooth, continuous liquid shape — no hand-built (spiky) outline. */}
            <filter
              id={ids.goo}
              filterUnits="userSpaceOnUse"
              x={-200}
              y={-200}
              width={VIEW_BOX.width + 400}
              height={VIEW_BOX.height + 400}
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="13" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
              />
            </filter>

            <linearGradient
              id={ids.ink}
              x1="240"
              y1="60"
              x2="1360"
              y2="800"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={palette.light} />
              <stop offset="40%" stopColor={palette.mid} />
              <stop offset="100%" stopColor={palette.deep} />
            </linearGradient>

            <radialGradient id={ids.gloss} cx="0.34" cy="0.3" r="0.75">
              <stop offset="0%" stopColor={palette.glow} stopOpacity="0.5" />
              <stop offset="45%" stopColor={palette.glow} stopOpacity="0.08" />
              <stop offset="100%" stopColor={palette.glow} stopOpacity="0" />
            </radialGradient>

            {/* A live clip is more stable than a filtered SVG mask during fast pointer movement. */}
            <clipPath id={ids.clip} clipPathUnits="userSpaceOnUse">
              {initial.map((n, i) => (
                <circle key={i} data-node={i} cx={n.x} cy={n.y} r={n.r} />
              ))}
            </clipPath>
          </defs>

          {/* Dark headline underneath */}
          <HeadlineText fill="#140618" lines={lines} slots={slots} />

          {/* The liquid violet ink, fused smooth by the goo filter — with a soft drop shadow
              beneath so the drop reads as floating/wet liquid. */}
          <g style={{ filter: "drop-shadow(6px 16px 14px rgba(12,2,26,0.34))" }}>
            <g filter={`url(#${ids.goo})`}>
              {initial.map((n, i) => (
                <circle key={i} data-node={i} cx={n.x} cy={n.y} r={n.r} fill={`url(#${ids.ink})`} />
              ))}
            </g>
          </g>
          {/* Soft glossy highlight, clipped to the ink shape via the reveal mask */}
          <rect
            width={VIEW_BOX.width}
            height={VIEW_BOX.height}
            fill={`url(#${ids.gloss})`}
            clipPath={`url(#${ids.clip})`}
          />

          {/* White letters, revealed only through the ink */}
          <g clipPath={`url(#${ids.clip})`}>
            <HeadlineText fill="#ffffff" lines={lines} slots={slots} />
          </g>
        </svg>
      </div>
    </section>
  );
}
