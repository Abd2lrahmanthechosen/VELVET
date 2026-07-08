import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function Loader() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          style={{ background: "oklch(0.94 0.03 300)" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] as const }}
        >
          <motion.div
            className="font-display text-[color:var(--midnight)]"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)", letterSpacing: "-0.04em" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] as const }}
          >
            velvet<span className="font-serif-italic">.</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}