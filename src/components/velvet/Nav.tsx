import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import { getHeroScrollLength } from "./heroTimeline";

const links = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

export function Nav() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const previousY = useRef(0);
  const visibleRef = useRef(false);

  const setNavVisible = (next: boolean) => {
    if (visibleRef.current === next) return;
    visibleRef.current = next;
    setVisible(next);
  };

  useMotionValueEvent(scrollY, "change", (y) => {
    // Only appear after the hero cinematic (roughly 3 screens of scroll)
    const heroEnd = getHeroScrollLength();
    if (y < heroEnd - 100) {
      setNavVisible(false);
    } else if (y < previousY.current) {
      setNavVisible(true);
    } else if (y > previousY.current + 30) {
      setNavVisible(false);
    }
    previousY.current = y;
  });

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: visible ? 0 : -80, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
      className="fixed left-1/2 top-6 z-50 -translate-x-1/2"
    >
      <div className="glass flex items-center gap-2 rounded-full px-3 py-2 pl-3">
        <a href="#top" className="flex h-10 items-center pr-4" aria-label="Velvet home">
          <img
            src="/velvet-navbar-logo.png"
            alt="Velvet Marketing Agency"
            className="h-10 w-auto max-w-[9rem] object-contain brightness-125 contrast-125 drop-shadow-[0_0_10px_rgba(139,92,246,0.35)]"
          />
        </a>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-magnetic
              className="relative overflow-hidden rounded-full px-4 py-1.5 text-sm text-white/80 transition hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="#contact"
          data-magnetic
          className="ml-2 rounded-full bg-[color:var(--violet)] px-4 py-2 text-xs font-medium tracking-wider text-white shadow-[0_0_30px_rgba(124,58,237,0.5)] transition hover:shadow-[0_0_50px_rgba(124,58,237,0.8)]"
        >
          START A PROJECT
        </a>
      </div>
    </motion.nav>
  );
}
