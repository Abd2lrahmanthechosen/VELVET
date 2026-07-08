import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";

const links = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

export function Nav() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const [prev, setPrev] = useState(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    // Only appear after the hero cinematic (roughly 3 screens of scroll)
    const heroEnd = typeof window !== "undefined" ? window.innerHeight * 3 : 2000;
    if (y < heroEnd - 100) {
      setVisible(false);
    } else if (y < prev) {
      setVisible(true);
    } else if (y > prev + 30) {
      setVisible(false);
    }
    setPrev(y);
  });

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: visible ? 0 : -80, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
      className="fixed left-1/2 top-6 z-50 -translate-x-1/2"
    >
      <div className="glass flex items-center gap-2 rounded-full px-3 py-2 pl-3">
        <a href="#top" className="flex items-center gap-2 pr-4">
          <span className="block h-7 w-7 rounded-full bg-[radial-gradient(circle_at_30%_30%,#c4b5fd,#4c1d95_60%,#0a0616_90%)] shadow-[0_0_16px_rgba(124,58,237,0.7)]" />
          <span className="font-display text-sm tracking-wider">VELVET</span>
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