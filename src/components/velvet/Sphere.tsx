import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { getHeroProgress, smoothstep } from "./heroTimeline";

function Planet({ scrollProgress }: { scrollProgress: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const { camera, viewport } = useThree();

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    const p = getHeroProgress(scrollProgress.current ?? 0);
    // Rotation speed accelerates as we scroll (scene "wakes up")
    group.current.rotation.y += delta * (0.05 + p * 0.6);
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      mouse.current.y * 0.25,
      0.04,
    );
    // Cinematic camera choreography — sphere starts huge & centered,
    // then lifts up and recedes as if the camera pulls back into space.
    const lift = Math.pow(p, 1.35) * 2.65;
    const miniHandoff = smoothstep(0.8, 0.96, p);
    const heroScale = 1.55 - smoothstep(0.05, 0.78, p) * 0.9;
    const currentViewport = viewport.getCurrentViewport(camera, [0, 0, 0]);
    const isCompact = currentViewport.width < 6;
    const miniScale = isCompact ? 0.14 : 0.165;
    const miniX = -currentViewport.width / 2 + (isCompact ? 0.62 : 0.88);
    const miniY = currentViewport.height / 2 - (isCompact ? 0.62 : 0.82);
    const scale = THREE.MathUtils.lerp(heroScale, miniScale, miniHandoff);
    group.current.position.x = THREE.MathUtils.lerp(0, miniX, miniHandoff);
    group.current.position.y = THREE.MathUtils.lerp(lift, miniY, miniHandoff);
    group.current.scale.setScalar(Math.max(0.05, scale));
    // Light color pulse
    if (inner.current) {
      const t = state.clock.elapsedTime;
      (inner.current.material as THREE.MeshBasicMaterial).opacity =
        0.2 + p * 0.3 + Math.sin(t * 0.8) * 0.05;
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
        {/* Core sphere — physical, glossy */}
        <mesh>
          <sphereGeometry args={[1.6, 64, 64]} />
          <meshPhysicalMaterial
            color="#7c3aed"
            metalness={0.35}
            roughness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.15}
            sheen={1}
            sheenColor="#c4b5fd"
            emissive="#4c1d95"
            emissiveIntensity={0.25}
          />
        </mesh>
        {/* Inner glow halo */}
        <mesh ref={inner} scale={1.08}>
          <sphereGeometry args={[1.6, 32, 32]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.15} side={THREE.BackSide} />
        </mesh>
        {/* Orbiting particles */}
        <Orbits />
      </Float>
    </group>
  );
}

function Orbits() {
  const ref = useRef<THREE.Points>(null);
  const count = 140;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.2 + Math.random() * 1.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.05;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#c4b5fd"
        size={0.025}
        sizeAttenuation
        transparent
        opacity={0.85}
      />
    </points>
  );
}

function Scene({ scrollProgress }: { scrollProgress: React.RefObject<number> }) {
  const dir = useRef<THREE.DirectionalLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const three = useThree();
  const cLight = useMemo(() => new THREE.Color("#ece4f7"), []);
  const cMid = useMemo(() => new THREE.Color("#7c3aed"), []);
  const cDeep = useMemo(() => new THREE.Color("#0a0616"), []);
  const bgColor = useMemo(() => new THREE.Color("#ece4f7"), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const fog = useMemo(() => new THREE.Fog("#ece4f7", 6, 22), []);

  useEffect(() => {
    three.scene.background = bgColor;
    three.scene.fog = fog;
    three.gl.setClearColor(bgColor, 1);
  }, [three, bgColor, fog]);

  useFrame(() => {
    const p = getHeroProgress(scrollProgress.current ?? 0);
    // Go transparent at the same point the layer lifts above the content (p >= 0.96), so the
    // sphere hands off cleanly — only the mini sphere shows on top, never a full-screen cover.
    if (p < 0.96) {
      if (p < 0.5) tmp.copy(cLight).lerp(cMid, p / 0.5);
      else tmp.copy(cMid).lerp(cDeep, (p - 0.5) / 0.5);
      bgColor.lerp(tmp, 0.08);
      three.scene.background = bgColor;
      three.scene.fog = fog;
      fog.color.copy(bgColor);
      three.gl.setClearColor(bgColor, 1);
    } else if (three.scene.background !== null) {
      three.scene.background = null;
      three.scene.fog = null;
      three.gl.setClearColor(0x000000, 0);
    }
    three.camera.position.z = 5 + p * 2.5;
    if (amb.current) amb.current.intensity = 0.9 - p * 0.55;
    if (dir.current) dir.current.intensity = 0.9 + p * 1.1;
  });
  return (
    <>
      <ambientLight ref={amb} intensity={0.9} />
      <directionalLight ref={dir} position={[4, 6, 4]} intensity={0.9} color="#ffffff" />
      <pointLight position={[-4, -2, -2]} intensity={2} color="#7c3aed" />
      <Planet scrollProgress={scrollProgress} />
    </>
  );
}

function hasWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(
      c.getContext("webgl2") ||
      c.getContext("webgl") ||
      c.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

function Fallback({ scrollProgress }: { scrollProgress: React.RefObject<number> }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = getHeroProgress(scrollProgress.current ?? 0);
      if (ref.current) {
        const scale = 1 - Math.pow(p, 1.2) * 0.75;
        const y = -Math.pow(p, 1.4) * 40;
        ref.current.style.transform = `translateY(${y}vh) scale(${Math.max(0.05, scale)})`;
        // background tint
        const wrap = ref.current.parentElement as HTMLElement;
        if (wrap) {
          const bg =
            p < 0.5
              ? `oklch(${0.94 - p * 0.6} ${0.03 + p * 0.3} 300)`
              : `oklch(${0.64 - (p - 0.5) * 1.1} ${0.33 - (p - 0.5) * 0.6} 295)`;
          wrap.style.background = bg;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scrollProgress]);
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center transition-colors" style={{ background: "oklch(0.94 0.03 300)" }}>
      <div
        ref={ref}
        className="h-[70vmin] w-[70vmin] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 32% 28%, #ffffff 0%, #c4b5fd 30%, #7c3aed 60%, #2e1065 90%)",
          boxShadow:
            "0 40px 120px -20px rgba(124,58,237,0.5), inset -20px -30px 60px rgba(46,16,101,0.6), inset 10px 15px 30px rgba(255,255,255,0.35)",
          willChange: "transform",
        }}
      />
    </div>
  );
}

export function VelvetSphere({
  scrollProgress,
}: {
  scrollProgress: React.RefObject<number>;
}) {
  const layer = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    setMounted(true);
    setWebglOk(hasWebGL());
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = getHeroProgress(scrollProgress.current ?? 0);
      if (layer.current) {
        const overlay = p >= 0.96;
        layer.current.style.zIndex = overlay ? "40" : "0";
        layer.current.dataset.overlay = overlay ? "true" : "false";
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [scrollProgress]);

  return (
    <div
      ref={layer}
      data-velvet-sphere-layer
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 0, pointerEvents: "none" }}
    >
      {!mounted || !webglOk ? (
        <Fallback scrollProgress={scrollProgress} />
      ) : (
        <Canvas
          frameloop="always"
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 0, 5], fov: 42 }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
              setWebglOk(false);
            });
            gl.domElement.style.pointerEvents = "none";
          }}
          className="pointer-events-none !absolute !inset-0"
        >
          <Scene scrollProgress={scrollProgress} />
        </Canvas>
      )}
    </div>
  );
}
