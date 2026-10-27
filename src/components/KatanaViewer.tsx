import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, Environment, Lightformer, OrbitControls, useGLTF, useProgress, Html } from "@react-three/drei";
import type { OrbitControls as OrbitImpl } from "three-stdlib";
import * as THREE from "three";
import sheathedAsset from "@/assets/katana-sheathed.glb.asset.json";
import bladeAsset from "@/assets/katana-blade-v2.glb.asset.json";
import { playSlash } from "@/lib/sfx";
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
  // Locate the rose guard: the widest slice along the blade's long axis.
  const guard = useMemo(() => {
    clone.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const axis = size.x >= size.y && size.x >= size.z ? "x" : size.y >= size.z ? "y" : "z";
    const others = (["x", "y", "z"] as const).filter((a) => a !== axis);
    const center = box.getCenter(new THREE.Vector3());
    const BINS = 80;
    const rad = new Array(BINS).fill(0);
    const v = new THREE.Vector3();
    clone.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const pos = m.geometry.attributes.position;
      if (!pos) return;
      const step = Math.max(1, Math.floor(pos.count / 20000));
      for (let i = 0; i < pos.count; i += step) {
        v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
        const b = Math.min(BINS - 1, Math.floor(((v[axis] - box.min[axis]) / size[axis]) * BINS));
        const r = Math.hypot(v[others[0]] - center[others[0]], v[others[1]] - center[others[1]]);
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
  return { obj: clone, setOpacity, isRose };
}

type Hover = (p: { x: number; y: number } | null) => void;

function Katanas({ state, flash, onRose, onHover }: { state: State; flash: React.MutableRefObject<number>; onRose: () => void; onHover: Hover }) {
  const sheathed = useFadeable(sheathedAsset.url);
  const blade = useFadeable(bladeAsset.url);
  const gS = useRef<THREE.Group>(null);
  const gB = useRef<THREE.Group>(null);
  const t = useRef({ sx: 0, sOp: 1, bx: -2.5, bOp: 0 });
  const light = useRef<THREE.PointLight>(null);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    const k = (s: number) => 1 - Math.exp(-s * dt);
    const v = t.current;
    const drawn = state === "drawn";
    v.sx += ((drawn ? 3.6 : 0) - v.sx) * k(drawn ? 3 : 4);
    v.sOp += ((drawn ? 0 : 1) - v.sOp) * k(3);
    v.bx += ((drawn ? 0 : -2.5) - v.bx) * k(drawn ? 5 : 3);
    v.bOp += ((drawn ? 1 : 0) - v.bOp) * k(drawn ? 4 : 6);
    if (gS.current) {
      gS.current.position.x = v.sx;
      gS.current.rotation.z = v.sx * 0.05;
    }
    if (gB.current) gB.current.position.x = v.bx;
    sheathed.setOpacity(v.sOp);
    blade.setOpacity(v.bOp);
    flash.current = Math.max(0, flash.current - dt * 2.2);
    if (light.current) light.current.intensity = 2 + flash.current * 60;
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
          <primitive object={sheathed.obj} scale={1.6} />
        </Center>
      </group>
      <group ref={gB} {...pick(blade)}>
        <Center>
          <primitive object={blade.obj} scale={1.6} />
        </Center>
      </group>
    </>
  );
}

/** While drawing/sheathing, swing the camera to the front so the motion always reads left to right. */
function CamRig({ settle }: { settle: React.MutableRefObject<number> }) {
  const controls = useThree((st) => st.controls) as unknown as OrbitImpl | null;
  const camera = useThree((st) => st.camera);
  useFrame((_, raw) => {
    if (!controls) return;
    const dt = Math.min(raw, 0.05);
    const active = settle.current > 0;
    controls.autoRotate = !active;
    if (!active) return;
    settle.current -= dt;
    const az = controls.getAzimuthalAngle();
    const polar = controls.getPolarAngle();
    const next = az + (0 - az) * (1 - Math.exp(-6 * dt));
    const r = camera.position.distanceTo(controls.target);
    const sph = new THREE.Spherical(r, polar + (Math.PI / 2 - 0.1 - polar) * (1 - Math.exp(-4 * dt)), next);
    camera.position.setFromSpherical(sph).add(controls.target);
    controls.update();
  });
  return null;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-center">
        <p className="font-brush animate-pulse text-5xl text-primary">刀</p>
        <p className="mt-2 font-display text-xs tracking-[0.4em] text-gold">{Math.round(progress)}%</p>
      </div>
    </Html>
  );
}

export default function KatanaViewer() {
  const [state, setState] = useState<State>("intro");
  const flash = useRef(0);
  const settle = useRef(0);
  const box = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const onHover: Hover = (p) => {
    if (!p || !box.current) return setTip(null);
    const r = box.current.getBoundingClientRect();
    setTip({ x: p.x - r.left, y: p.y - r.top });
  };

  useEffect(() => {
    const a = setTimeout(() => setState("sheathed"), 300);
    return () => clearTimeout(a);
  }, []);

  const toggle = () => {
    flash.current = 1;
    settle.current = 2.2;
    playSlash(0.5);
    setState((s) => (s === "drawn" ? "sheathed" : "drawn"));
  };

  return (
    <div ref={box} className="relative h-full w-full">
      <Canvas camera={{ position: [0, 0.4, 3.6], fov: 40 }} dpr={[1, 2]}>
        <fog attach="fog" args={["#120b0a", 4, 10]} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[3, 4, 2]} intensity={1.6} color="#ffe2c0" />
        <directionalLight position={[-4, -1, -2]} intensity={1.2} color="#b3261e" />
        <Environment resolution={256}>
          <Lightformer intensity={2} position={[0, 4, 2]} scale={[8, 2, 1]} />
          <Lightformer intensity={1.5} color="#c0392b" position={[-4, 0, 0]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
          <Lightformer intensity={0.8} color="#e8d5b0" position={[4, 0, -2]} rotation-y={-Math.PI / 2} scale={[10, 1, 1]} />
        </Environment>
        <Suspense fallback={<Loader />}>
          <Katanas state={state} flash={flash} onHover={onHover} onRose={() => scrollToId("rose-origin", true)} />
          <CamRig settle={settle} />
        </Suspense>
        <OrbitControls makeDefault enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} minPolarAngle={Math.PI / 3} maxPolarAngle={(2 * Math.PI) / 3} />
      </Canvas>

      <div className="absolute inset-x-0 bottom-14 flex flex-col items-center gap-3">
        <button
          onClick={toggle}
          className="border border-gold/60 bg-lacquer/70 px-8 py-3 font-display text-sm uppercase tracking-[0.4em] text-paper backdrop-blur transition hover:bg-primary"
        >
          {state === "drawn" ? "Sheathe · 納刀" : "Unsheathe · 抜刀"}
        </button>
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

useGLTF.preload(sheathedAsset.url);
useGLTF.preload(bladeAsset.url);
