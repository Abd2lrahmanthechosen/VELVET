import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Cursor } from "@/components/velvet/Cursor";
import { Loader } from "@/components/velvet/Loader";
import { Nav } from "@/components/velvet/Nav";
import { useLenis } from "@/components/velvet/useLenis";
import { VelvetSphere } from "@/components/velvet/Sphere";
import {
  FinalCTA,
  Hero,
  HeroProgressBridge,
  Philosophy,
  Process,
  Projects,
  Results,
  Services,
  Testimonials,
} from "@/components/velvet/Sections";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useLenis();
  const scrollProgress = useRef(0);

  return (
    <main className="relative min-h-screen text-white" style={{ background: "#0a0616" }}>
      {mounted && <Loader />}
      {mounted && <Cursor />}
      <Nav />
      {mounted && <HeroProgressBridge progressRef={scrollProgress} />}

      {/* Fixed sphere layer — behind hero */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <VelvetSphere scrollProgress={scrollProgress} />
      </div>

      <div className="relative z-10">
        <Hero />
        <Philosophy />
        <Services />
        <Projects />
        <Process />
        <Results />
        <Testimonials />
        <FinalCTA />
      </div>
    </main>
  );
}
