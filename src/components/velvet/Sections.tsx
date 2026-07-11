import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import type { PointerEvent } from "react";
import { getHeroProgress, getHeroProgressFromScroll, smoothstep } from "./heroTimeline";
import { LiquidTextMaskSection } from "./LiquidTextMaskSection";

const projects = [
  {
    name: "VETTA",
    kind: "Software Company",
    line: "Elegant, floating interfaces for a modern software house.",
    tint: "from-[#4c1d95] via-[#1e1b4b] to-[#0a0616]",
  },
  {
    name: "NUMO",
    kind: "AI Operating System",
    line: "Executive dashboards and an AI cofounder for founders who scale.",
    tint: "from-[#312e81] via-[#1e1b4b] to-[#0a0616]",
  },
  {
    name: "NOK",
    kind: "AI Hiring SaaS",
    line: "Neural pipelines that read résumés like a senior recruiter.",
    tint: "from-[#4c1d95] via-[#2d1b69] to-[#0a0616]",
  },
  {
    name: "PERRERO",
    kind: "Enterprise Analytics",
    line: "Executive-grade data visualization with a luxury dark aesthetic.",
    tint: "from-[#1e1b4b] via-[#0f172a] to-[#0a0616]",
  },
  {
    name: "LAM3A",
    kind: "Luxury Mobile Car Care",
    line: "Reflections, foam, and the deepest black we've ever shipped.",
    tint: "from-[#0a0616] via-[#0b0b1a] to-[#000]",
  },
];

const services = [
  {
    title: "Brand Identity",
    copy: "Crafting memorable identities that capture your brand's true essence and build instant recognition.",
  },
  {
    title: "Creative Strategy",
    copy: "Sharp market positioning, launch systems, and campaign ideas built around one magnetic thesis.",
  },
  {
    title: "AI Products",
    copy: "Useful AI interfaces, workflows, and product concepts shaped for adoption instead of novelty.",
  },
  {
    title: "Web Experiences",
    copy: "High-impact sites with cinematic motion, crisp messaging, and paths that feel inevitable.",
  },
  {
    title: "Growth Marketing",
    copy: "Performance systems, content engines, and experiments that compound attention into demand.",
  },
  {
    title: "Automation Systems",
    copy: "Operational flows that remove friction, connect teams, and keep the business moving faster.",
  },
];

const process = [
  { n: "01", t: "Discover", d: "We audit the market, the audience and the ambition." },
  { n: "02", t: "Strategy", d: "A single sharp thesis your whole company can rally behind." },
  { n: "03", t: "Design", d: "Identity, product and story rendered at obsession-level fidelity." },
  { n: "04", t: "Launch", d: "We ship the site, the campaign and the systems on the same day." },
  { n: "05", t: "Scale", d: "Paid, AI and content compound the brand into a category." },
];

const testimonials = [
  {
    q: "Velvet didn't rebrand us. They rewired how we think about the company.",
    a: "CEO, Vetta",
  },
  {
    q: "Every investor meeting since the launch starts with a compliment about the brand.",
    a: "Founder, Numo",
  },
  {
    q: "The most obsessed studio we've worked with. Nothing shipped is average.",
    a: "Head of Product, Nok",
  },
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let active = false;
    const applyScene = (node: HTMLDivElement | null, opacity: number, yVh = 0) => {
      if (!node) return;
      node.style.opacity = opacity.toFixed(3);
      node.style.transform = `translate3d(0, ${yVh.toFixed(3)}vh, 0)`;
    };
    const tick = () => {
      if (!active) return;
      const p = getHeroProgress();
      const intro = 1 - smoothstep(0.2, 0.36, p);
      const introY = -6 * smoothstep(0, 0.36, p);
      const mid = smoothstep(0.28, 0.4, p) * (1 - smoothstep(0.5, 0.62, p));
      const outro = 0.85 * smoothstep(0.56, 0.66, p) * (1 - smoothstep(0.72, 0.82, p));
      const outroY = 4 * (1 - smoothstep(0.56, 0.72, p));

      applyScene(introRef.current, intro, introY);
      applyScene(midRef.current, mid);
      applyScene(outroRef.current, outro, outroY);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (active) return;
      active = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      active = false;
      cancelAnimationFrame(raf);
    };
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "20% 0px" },
    );
    if (ref.current) observer.observe(ref.current);
    start();

    return () => {
      stop();
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={ref} id="top" className="relative h-[300vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Scene 1 — Silence. A single word. */}
        <motion.div
          ref={introRef}
          style={{
            opacity: 1,
            transform: "translate3d(0, 0vh, 0)",
            willChange: "opacity, transform",
          }}
          className="pointer-events-none absolute inset-x-0 top-[12vh] flex flex-col items-center gap-6 text-center"
        >
          <div className="font-label text-[color:var(--midnight)]/60">
            Velvet — Creative Studio · Est. 2019
          </div>
          <div
            className="font-display text-[color:var(--midnight)]"
            style={{
              fontSize: "clamp(3rem, 8vw, 8rem)",
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
            }}
          >
            an <span className="font-serif-italic">object</span>
            <br />
            in motion.
          </div>
        </motion.div>

        {/* Scene 2 — Camera enters violet space */}
        <motion.div
          ref={midRef}
          style={{ opacity: 0, transform: "translate3d(0, 0vh, 0)", willChange: "opacity" }}
          className="pointer-events-none absolute inset-x-0 bottom-[18vh] flex justify-center"
        >
          <div
            className="font-serif-italic text-center text-white/90"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.6rem)" }}
          >
            a brand is not a logo.
            <br />
            it is a{" "}
            <span className="font-display not-italic uppercase tracking-[0.02em]">gravity.</span>
          </div>
        </motion.div>

        {/* Scene 3 — Arrival */}
        <motion.div
          ref={outroRef}
          style={{
            opacity: 0,
            transform: "translate3d(0, 4vh, 0)",
            willChange: "opacity, transform",
          }}
          className="pointer-events-none absolute inset-x-0 bottom-[10vh] flex flex-col items-center gap-8"
        >
          <div className="font-label text-white/60">welcome to the universe of</div>
          <div
            className="font-display text-white"
            style={{
              fontSize: "clamp(3rem, 10vw, 10rem)",
              lineHeight: 0.9,
              letterSpacing: "-0.05em",
            }}
          >
            VELVET
          </div>
          <div className="font-label text-white/50 animate-pulse">scroll to enter</div>
        </motion.div>
      </div>
    </section>
  );
}

export function Philosophy() {
  return (
    <LiquidTextMaskSection
      lines={["WE CRAFT BRANDS", "THAT CAPTURE", "ATTENTION & DRIVE", "GROWTH"]}
      blobColor="#5b21b6"
    />
  );
}

export function QuoteSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.16, 0.76, 1], [0, 1, 1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.2, 0.74, 1], ["8vh", "0vh", "0vh", "-7vh"]);
  const ambientOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 0.82, 0.82, 0]);
  const orbitY = useTransform(scrollYProgress, [0, 1], ["7vh", "-9vh"]);

  return (
    <section ref={ref} className="brand-quote-section relative z-10 overflow-hidden">
      <motion.div
        style={{ opacity: ambientOpacity }}
        className="brand-quote-stars pointer-events-none absolute inset-0"
      />
      <motion.div
        style={{ opacity: ambientOpacity, y: orbitY }}
        className="brand-quote-orbit pointer-events-none absolute h-[58vmin] w-[58vmin]"
      />
      <div className="relative mx-auto flex min-h-screen max-w-[1800px] flex-col justify-center px-6 py-[18vh] md:px-16">
        <motion.div style={{ opacity: contentOpacity, y: contentY }}>
          <blockquote className="brand-quote">
            <span>BEING</span>
            <span>UNFORGETTABLE</span>
            <span>IS NOT LUCK.</span>
          </blockquote>
          <p className="mt-10 max-w-2xl font-serif-italic text-2xl leading-tight text-white/72 md:ml-auto md:text-4xl">
            It is designed into every frame until memory has nowhere else to go.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

type DisciplinePointerEvent = PointerEvent<HTMLLIElement>;

function setDisciplineSplit(event: DisciplinePointerEvent) {
  const rect = event.currentTarget.getBoundingClientRect();
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  const split = Math.min(76, Math.max(24, y));
  event.currentTarget.style.setProperty("--split", `${split.toFixed(2)}%`);
  event.currentTarget.dataset.hovered = "true";
}

function resetDisciplineSplit(event: DisciplinePointerEvent) {
  event.currentTarget.style.setProperty("--split", "52%");
  event.currentTarget.dataset.hovered = "false";
}

export function Services() {
  return (
    <section
      id="services"
      className="disciplines-stage relative z-10 overflow-hidden py-[9vh] md:py-[12vh]"
    >
      <div className="disciplines-ambient pointer-events-none absolute inset-0" />
      <div className="disciplines-starfield pointer-events-none absolute inset-0 opacity-90" />
      <div className="disciplines-planet pointer-events-none absolute right-[8vw] top-1/2 hidden h-[74vmin] w-[74vmin] -translate-y-[43%] md:block" />

      <div className="relative mx-auto flex max-w-[1920px] items-center justify-end px-6 pb-12 md:px-16">
        <div className="font-label text-[#8d55ff]">— chapter ii • our disciplines</div>
        <div className="font-label hidden text-[#a875ff] md:block">velvet marketing</div>
      </div>

      <div className="relative">
        <ul className="disciplines-list border-y border-[#7c31ff]/55">
          {services.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.9, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
              className="discipline-row group relative overflow-hidden border-b border-[#7c31ff]/45 last:border-b-0"
              onPointerEnter={setDisciplineSplit}
              onPointerMove={setDisciplineSplit}
              onPointerLeave={resetDisciplineSplit}
            >
              <div className="discipline-fill discipline-fill-top" />
              <div className="discipline-fill discipline-fill-bottom" />
              <div className="discipline-axis" />
              <div className="discipline-content relative grid min-h-[128px] items-center gap-5 px-6 py-6 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.42fr)_72px] md:px-16 lg:min-h-[160px]">
                <h2 className="discipline-title">{s.title}</h2>
                <p className="discipline-copy max-w-[41ch] text-sm font-medium leading-tight md:text-lg">
                  {s.copy}
                </p>
                <a
                  data-magnetic
                  href="#contact"
                  aria-label={`Start ${s.title}`}
                  className="discipline-arrow justify-self-start md:justify-self-end"
                >
                  <span>→</span>
                </a>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
export function Projects() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });
  const introOpacity = useTransform(scrollYProgress, [0, 0.25, 1], [0, 0.55, 1]);
  const introY = useTransform(scrollYProgress, [0, 1], ["10vh", "0vh"]);

  return (
    <section ref={ref} id="work" className="projects-stage relative z-10">
      <div className="projects-intro relative flex min-h-screen items-center overflow-hidden">
        <motion.div
          style={{ opacity: introOpacity, y: introY }}
          className="mx-auto w-full max-w-[1800px] px-6 py-[18vh] md:px-16"
        >
          <div className="projects-kicker font-label mb-[8vh] flex items-center justify-between text-white/55">
            <span>selected worlds</span>
            <span>01 — 05</span>
          </div>
          <h2 className="projects-intro-title" aria-label="Five worlds we have built">
            <span className="projects-intro-solid">FIVE</span>
            <span className="projects-intro-outline">WORLDS</span>
          </h2>
          <p className="projects-intro-script font-serif-italic">we have built.</p>
          <div className="projects-world-index font-label mt-[8vh] grid grid-cols-2 gap-y-4 text-white/45 md:grid-cols-5">
            {projects.map((project, index) => (
              <span key={project.name}>
                {String(index + 1).padStart(2, "0")} / {project.name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
      <div>
        {projects.map((p, i) => (
          <ProjectRow key={p.name} p={p} i={i} />
        ))}
      </div>
    </section>
  );
}

function ProjectRow({ p, i }: { p: (typeof projects)[number]; i: number }) {
  return (
    <div className="project-row relative flex min-h-screen items-center overflow-hidden">
      <div
        className={`project-row-tone pointer-events-none absolute inset-0 bg-gradient-to-br ${p.tint}`}
      />
      <div className="project-row-index pointer-events-none absolute right-[4vw] top-[8vh] font-display text-white/[0.045]">
        {String(i + 1).padStart(2, "0")}
      </div>
      <div className="relative z-10 mx-auto grid w-full max-w-[1800px] items-end gap-y-16 px-6 py-[18vh] md:grid-cols-12 md:px-16">
        <div className="md:col-span-7">
          <div className="font-label mb-8 text-white/40">
            {String(i + 1).padStart(2, "0")} · {p.kind}
          </div>
          <h3
            className="font-display text-white"
            style={{
              fontSize: "clamp(4rem, 14vw, 16rem)",
              lineHeight: 0.85,
              letterSpacing: "-0.05em",
            }}
          >
            {p.name}
          </h3>
        </div>
        <div className="md:col-span-4 md:col-start-9">
          <p className="font-serif-italic mb-10 max-w-md text-2xl leading-snug text-white/80 md:text-3xl">
            {p.line}
          </p>
          <a
            data-magnetic
            href="#"
            className="font-label group inline-flex w-fit items-center gap-3 border-b border-white/30 pb-1 text-white/80 transition hover:border-[color:var(--lavender)] hover:text-white"
          >
            open the case
            <span className="transition group-hover:translate-x-2">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"]);
  return (
    <section id="process" ref={ref} className="relative z-10 h-[400vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-20 w-full max-w-[1600px] px-6 md:px-16">
          <div className="font-label mb-6 text-white/40">— chapter iv · the sequence</div>
          <h2
            className="font-serif-italic text-white"
            style={{
              fontSize: "clamp(2rem, 5vw, 4.5rem)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            five moves
            <br />
            in one motion.
          </h2>
        </div>
        <motion.div style={{ x }} className="flex items-end gap-[10vw] pl-6 md:pl-16">
          {process.map((step) => (
            <div key={step.n} className="flex w-[80vw] shrink-0 flex-col gap-8 md:w-[45vw]">
              <div className="font-label text-white/40">{step.n}</div>
              <div
                className="font-display text-white"
                style={{
                  fontSize: "clamp(4rem, 10vw, 10rem)",
                  lineHeight: 0.9,
                  letterSpacing: "-0.05em",
                }}
              >
                {step.t}
              </div>
              <p className="max-w-md font-serif-italic text-xl text-white/70 md:text-2xl">
                {step.d}
              </p>
            </div>
          ))}
          <div className="w-[20vw] shrink-0" />
        </motion.div>
      </div>
    </section>
  );
}

export function Results() {
  const items = [
    { n: "4.8×", t: "Median revenue lift within 12 months" },
    { n: "62%", t: "Faster time-to-market on rebuilt product lines" },
    { n: "9/10", t: "Founders return for a second engagement" },
    { n: "0", t: "Templates. Ever." },
  ];
  return (
    <section className="relative z-10 py-[22vh]">
      <div className="mx-auto max-w-[1600px] px-6 md:px-16">
        <div className="font-label mb-16 text-white/40">— chapter v · gravity</div>
        <div className="grid gap-[6vh] md:grid-cols-2">
          {items.map((it, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.08 }}
              className="flex items-baseline gap-8 border-b border-white/10 pb-10"
            >
              <div
                className="font-display text-gradient"
                style={{
                  fontSize: "clamp(4rem, 10vw, 9rem)",
                  lineHeight: 0.9,
                  letterSpacing: "-0.04em",
                }}
              >
                {it.n}
              </div>
              <div className="max-w-[22ch] font-serif-italic text-lg text-white/60 md:text-xl">
                {it.t}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="relative z-10 py-[24vh]">
      <div className="mx-auto max-w-[1600px] px-6 md:px-16">
        <div className="font-label mb-24 text-white/40">— chapter vi · in their words</div>
        <div className="flex flex-col gap-[18vh]">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] as const }}
              className={i % 2 === 0 ? "max-w-3xl" : "ml-auto max-w-3xl text-right"}
            >
              <div
                className="font-serif-italic text-white/90"
                style={{
                  fontSize: "clamp(1.75rem, 3.5vw, 3rem)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                }}
              >
                “{t.q}”
              </div>
              <div className="font-label mt-8 text-white/40">— {t.a}</div>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section
      id="contact"
      className="relative z-10 flex min-h-screen items-center justify-center overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-200px" }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] as const }}
        className="absolute left-1/2 top-1/2 h-[100vmin] w-[100vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#a78bfa,#4c1d95_45%,transparent_78%)] opacity-60 blur-xl"
      />
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-32 text-center md:px-16">
        <div className="font-label mb-10 text-white/60">— last frame</div>
        <h2
          className="font-display mx-auto max-w-[14ch] text-white"
          style={{
            fontSize: "clamp(3rem, 10vw, 10rem)",
            lineHeight: 0.9,
            letterSpacing: "-0.05em",
          }}
        >
          become{" "}
          <span className="font-serif-italic text-[color:var(--lavender)]">unforgettable.</span>
        </h2>
        <p className="mx-auto mt-10 max-w-xl font-serif-italic text-xl text-white/70">
          Three seats this quarter. Send the brief you've been sitting on — we reply within 24
          hours.
        </p>
        <a
          href="mailto:hello@velvet.studio"
          data-magnetic
          className="font-label mt-16 inline-flex items-center gap-3 rounded-full border border-white/30 px-8 py-4 text-white transition hover:border-white hover:bg-white hover:text-black"
        >
          hello@velvet.studio
          <span>→</span>
        </a>
        <div className="font-label mt-24 flex flex-wrap items-center justify-center gap-6 text-white/30">
          <span>Dubai · London · Remote</span>
          <span>·</span>
          <span>© Velvet 2026</span>
        </div>
      </div>
    </section>
  );
}

export function HeroProgressBridge({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>;
}) {
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    if (typeof window === "undefined") return;
    progressRef.current = getHeroProgressFromScroll(y);
  });
  return null;
}
