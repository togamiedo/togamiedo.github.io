import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, Environment, Lightformer, OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import type { OrbitControls as OrbitImpl } from "three-stdlib";
import * as THREE from "three";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sword } from "lucide-react";
import { Button } from "@/components/ui/button";
const SHEATHED_URL = "/models/katana-sheathed.glb";
const BLADE_URL = "/models/katana-blade.glb";
import { playMotionCue } from "@/lib/sfx";
import { scrollToId } from "@/lib/scroll";

type State = "intro" | "sheathed" | "drawn";

function useFadeable(url: string) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.material = (m.material as THREE.Material).clone();
        (m.material as THREE.Material).transparent = true;
      }
    });
    return c;
  }, [scene]);
  const scale = useMemo(() => {
    const size = new THREE.Box3().setFromObject(clone).getSize(new THREE.Vector3());
    return 4.2 / Math.max(size.x, size.y, size.z, 0.001);
  }, [clone]);
  // Locate the rose guard: the widest slice along the blade's long axis.
  const guard = useMemo(() => {
    clone.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const axis: "x" | "y" | "z" = size.x >= size.y && size.x >= size.z ? "x" : size.y >= size.z ? "y" : "z";
    const [o0, o1] = (["x", "y", "z"] as const).filter((a) => a !== axis) as ["x" | "y" | "z", "x" | "y" | "z"];
    const center = box.getCenter(new THREE.Vector3());
    const BINS = 80;
    const rad = new Array(BINS).fill(0);
    const v = new THREE.Vector3();
    clone.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const pos = m.geometry.getAttribute("position");
      if (!pos) return;
      const step = Math.max(1, Math.floor(pos.count / 20000));
      for (let i = 0; i < pos.count; i += step) {
        v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
        const b = Math.min(BINS - 1, Math.floor(((v[axis] - box.min[axis]) / size[axis]) * BINS));
        const r = Math.hypot(v[o0] - center[o0], v[o1] - center[o1]);
        if (r > rad[b]) rad[b] = r;
      }
    });
    let best = 0;
    rad.forEach((r, i) => r > rad[best] && (best = i));
    return { axis, at: box.min[axis] + ((best + 0.5) / BINS) * size[axis], win: size[axis] * 0.07 };
  }, [clone]);
  const isRose = (worldPoint: THREE.Vector3) => {
    const l = clone.worldToLocal(worldPoint.clone());
    return Math.abs(l[guard.axis] - guard.at) < guard.win;
  };
  const setOpacity = (v: number) =>
    clone.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        const mat = m.material as THREE.Material;
        const solid = v > 0.98;
        mat.opacity = solid ? 1 : v;
        if (mat.transparent === solid) {
          mat.transparent = !solid;
          mat.needsUpdate = true;
        }
        mat.depthWrite = solid;
        m.visible = v > 0.02;
      }
    });
  return { obj: clone, setOpacity, isRose, scale };
}

type Hover = (p: { x: number; y: number } | null) => void;

function Katanas({ state, flash, onRose, onHover, reduced }: { state: State; flash: React.MutableRefObject<number>; onRose: () => void; onHover: Hover; reduced: boolean }) {
  const sheathed = useFadeable(SHEATHED_URL);
  const blade = useFadeable(BLADE_URL);
  const gS = useRef<THREE.Group>(null);
  const gB = useRef<THREE.Group>(null);
  const t = useRef({ sx: 0, sOp: 1, bx: -2.5, bOp: 0 });
  const light = useRef<THREE.PointLight>(null);
  const elapsed = useRef(2);
  const amountRef = useRef(0);
  const startAmount = useRef(0);
  useEffect(() => {
    startAmount.current = amountRef.current;
    elapsed.current = 0;
  }, [state]);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    const v = t.current;
    const drawn = state === "drawn";
    elapsed.current += dt;
    const progress = THREE.MathUtils.clamp((elapsed.current - (reduced ? 0 : 0.12)) / (reduced ? 0.15 : 1.35), 0, 1);
    const eased = progress * progress * progress * (progress * (progress * 6 - 15) + 10);
    const amount = THREE.MathUtils.lerp(startAmount.current, drawn ? 1 : 0, eased);
    amountRef.current = amount;
    v.sx = amount * 3.6;
    v.sOp = 1 - THREE.MathUtils.smoothstep(amount, 0.1, 0.85);
    v.bx = -2.5 * (1 - amount);
    v.bOp = THREE.MathUtils.smoothstep(amount, 0.15, 0.9);
    if (gS.current) {
      gS.current.position.x = v.sx;
      gS.current.position.y = -amount * 0.18;
      gS.current.rotation.z = amount * -0.12;
    }
    if (gB.current) {
      gB.current.position.x = v.bx;
      gB.current.position.y = reduced ? 0 : Math.sin(progress * Math.PI) ** 2 * 0.06;
      gB.current.rotation.z = reduced ? 0 : Math.sin(progress * Math.PI) ** 2 * -0.04;
    }
    sheathed.setOpacity(v.sOp);
    blade.setOpacity(v.bOp);
    flash.current = Math.max(0, flash.current - dt * 2.2);
    if (light.current) light.current.intensity = 2 + (reduced ? 0 : Math.sin(progress * Math.PI) ** 2 * 3);
  });

  type Ev = { stopPropagation: () => void; point: THREE.Vector3; nativeEvent: PointerEvent | MouseEvent };
  const pick = (which: typeof sheathed) => {
    const hit = (e: Ev) => which.isRose(e.point);
    const out = () => {
      document.body.style.cursor = "";
      onHover(null);
    };
    return {
      onPointerMove: (e: Ev) => {
        if (hit(e)) {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          onHover({ x: e.nativeEvent.clientX, y: e.nativeEvent.clientY });
        } else out();
      },
      onPointerOut: out,
      onClick: (e: Ev) => {
        if (!hit(e)) return;
        e.stopPropagation();
        out();
        onRose();
      },
    };
  };

  return (
    <>
      <pointLight ref={light} position={[0, 0.6, 1.6]} color="#ff3b30" distance={8} />
      <group ref={gS} {...pick(sheathed)}>
        <Center>
          <primitive object={sheathed.obj} scale={sheathed.scale} />
        </Center>
      </group>
      <group ref={gB} {...pick(blade)}>
        <Center>
          <primitive object={blade.obj} scale={blade.scale} rotation={[0, Math.PI, 0]} />
        </Center>
      </group>
    </>
  );
}

/** Pause rotation during blade movement without snapping the user's chosen view. */
function CamRig({ settle, reduced }: { settle: React.MutableRefObject<number>; reduced: boolean }) {
  const controls = useThree((st) => st.controls) as unknown as OrbitImpl | null;
  const camera = useThree((st) => st.camera);
  const width = useThree((st) => st.size.width);
  const height = useThree((st) => st.size.height);
  useEffect(() => {
    const distance = Math.max(6.4, 5.2 / (2 * Math.tan(THREE.MathUtils.degToRad(20)) * width / height));
    camera.position.setLength(distance);
    controls?.update();
  }, [camera, controls, width, height]);
  useFrame((_, raw) => {
    if (!controls) return;
    const dt = Math.min(raw, 0.05);
    const active = settle.current > 0;
    controls.autoRotate = !active && !reduced;
    if (!active) return;
    settle.current -= dt;
  });
  return null;
}

function Loader() {
  const { progress, active } = useProgress();
  if (!active) return null;
  return (
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="font-brush animate-pulse text-5xl text-primary">刀</p>
        <p className="mt-2 font-display text-xs tracking-[0.4em] text-gold">{Math.round(progress)}%</p>
      </div>
  );
}

export default function KatanaViewer() {
  const [state, setState] = useState<State>("intro");
  const flash = useRef(0);
  const settle = useRef(0);
  const box = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const reduced = !!useReducedMotion();
  const { active: loading } = useProgress();
  const [drawing, setDrawing] = useState(false);
  const [take, setTake] = useState(0);
  const busy = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sounds = useRef<(() => void)[]>([]);
  const onHover: Hover = (p) => {
    if (!p || !box.current) return setTip(null);
    const r = box.current.getBoundingClientRect();
    setTip({ x: p.x - r.left, y: p.y - r.top });
  };

  useEffect(() => {
    const a = setTimeout(() => setState("sheathed"), 300);
    return () => {
      clearTimeout(a);
      timers.current.forEach(clearTimeout);
      sounds.current.forEach((stop) => stop());
      document.body.style.cursor = "";
    };
  }, []);

  const toggle = () => {
    if (busy.current || loading) return;
    busy.current = true;
    setTip(null);
    setDrawing(true);
    setTake((n) => n + 1);
    flash.current = 1;
    settle.current = reduced ? 0.3 : 1.8;
    sounds.current.forEach((stop) => stop());
    sounds.current = [playMotionCue("lock")];
    timers.current.push(setTimeout(() => sounds.current.push(playMotionCue("draw")), reduced ? 0 : 120));
    timers.current.push(setTimeout(() => {
      sounds.current.push(playMotionCue("lock"));
      setDrawing(false);
      busy.current = false;
    }, reduced ? 350 : 1800));
    setState((s) => (s === "drawn" ? "sheathed" : "drawn"));
  };

  return (
    <div ref={box} className="relative h-full w-full" data-blade-state={state} data-blade-moving={drawing}>
      <Canvas camera={{ position: [0, 0.4, 3.6], fov: 40 }} dpr={[1, 2]}>
        <ambientLight intensity={0.45} />
        <directionalLight position={[3, 4, 2]} intensity={1.6} color="#ffe2c0" />
        <directionalLight position={[-4, -1, -2]} intensity={1.2} color="#b3261e" />
        <Environment resolution={256}>
          <Lightformer intensity={2} position={[0, 4, 2]} scale={[8, 2, 1]} />
          <Lightformer intensity={1.5} color="#c0392b" position={[-4, 0, 0]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
          <Lightformer intensity={0.8} color="#e8d5b0" position={[4, 0, -2]} rotation-y={-Math.PI / 2} scale={[10, 1, 1]} />
        </Environment>
        <Suspense fallback={null}>
          <Katanas state={state} flash={flash} reduced={reduced} onHover={onHover} onRose={() => { if (!busy.current) scrollToId("rose-origin", true); }} />
          <CamRig settle={settle} reduced={reduced} />
        </Suspense>
        <OrbitControls makeDefault enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} minPolarAngle={Math.PI / 3} maxPolarAngle={(2 * Math.PI) / 3} />
      </Canvas>
      <Loader />

      <AnimatePresence>
        {drawing && !reduced && (
          <motion.div key={take} className="pointer-events-none absolute inset-0 overflow-hidden" exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 border-y border-gold/30 bg-lacquer/20"
              initial={{ clipPath: "inset(50% 0)" }} animate={{ clipPath: ["inset(50% 0)", "inset(9% 0)", "inset(0% 0)"], opacity: [0, 0.7, 0] }}
              transition={{ duration: 1.7, times: [0, 0.28, 1] }} />
            <p className="blade-calligraphy absolute right-6 top-1/3 font-brush text-7xl text-primary/60 md:right-12 md:text-9xl">{state === "drawn" ? "抜刀" : "納刀"}</p>
            <div className="blade-draw-flash absolute left-0 top-1/2 h-px w-full origin-left bg-paper transition-blade" />
            {Array.from({ length: 16 }, (_, i) => (
              <motion.span key={i} className={`absolute left-1/3 top-1/2 ${i % 4 === 0 ? "bg-gold" : "bg-primary"}`}
                style={{ width: 6 + i % 4 * 3, height: 5 + i % 3 * 2, borderRadius: "85% 0 85% 0" }}
                initial={{ x: 0, y: 0, opacity: 0.9, rotate: 0 }}
                animate={{ x: 80 + i * 24, y: Math.sin(i * 2.2) * (40 + i * 9), opacity: 0, rotate: 80 + i * 34 }}
                transition={{ delay: 0.6 + i % 3 * 0.025, duration: 1.05, ease: "easeOut" }} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-14 flex flex-col items-center gap-3">
        <Button variant="outline" size="lg" disabled={drawing || loading || state === "intro"}
          onClick={toggle}
          className="h-12 min-w-56 rounded-sm border-gold/60 bg-lacquer/70 font-display text-sm uppercase text-paper backdrop-blur hover:bg-primary hover:text-paper"
        >
          <Sword />{state === "drawn" ? "Sheathe · 納刀" : "Unsheathe · 抜刀"}
        </Button>
        <p className="font-display text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Drag to turn the blade</p>
      </div>
      {tip && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[130%] whitespace-nowrap border border-primary/70 bg-lacquer/90 px-3 py-1.5 font-display text-xs tracking-[0.2em] text-paper shadow-lg backdrop-blur"
          style={{ left: tip.x, top: tip.y }}
        >
          🌹 Where did this rose come from? · 薔薇の由来
        </div>
      )}
      <p className="pointer-events-none absolute bottom-4 right-5 font-body text-sm italic text-paper/50">
        Model by @rosepath on Roblox
      </p>
    </div>
  );
}

useGLTF.preload(SHEATHED_URL);
useGLTF.preload(BLADE_URL);
