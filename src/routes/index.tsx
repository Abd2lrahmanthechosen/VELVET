import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
  QuoteSection,
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
    <main className="velvet-site-bg relative min-h-screen text-white">
      {mounted && <Loader />}
      <Nav />
      {mounted && <HeroProgressBridge progressRef={scrollProgress} />}

      <VelvetSphere scrollProgress={scrollProgress} />

      <div className="relative z-10">
        <Hero />
        <div className="dark-story-flow relative">
          <QuoteSection />
          <Services />
        </div>
        <Philosophy />
        <Projects />
        <Process />
        <Results />
        <Testimonials />
        <FinalCTA />
      </div>
    </main>
  );
}
