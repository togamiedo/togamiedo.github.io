import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Environment, Lightformer, OrbitControls, useGLTF, useProgress, Html } from "@react-three/drei";
import * as THREE from "three";
import sheathedAsset from "@/assets/katana-sheathed.glb.asset.json";
import bladeAsset from "@/assets/katana-blade-v2.glb.asset.json";

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
  const setOpacity = (v: number) =>
    clone.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        const mat = m.material as THREE.Material;
        mat.opacity = v;
        mat.depthWrite = v > 0.95;
        m.visible = v > 0.01;
      }
    });
  return { obj: clone, setOpacity };
}

function Katanas({ state, flash }: { state: State; flash: React.MutableRefObject<number> }) {
  const sheathed = useFadeable(sheathedAsset.url);
  const blade = useFadeable(bladeAsset.url);
  const gS = useRef<THREE.Group>(null);
  const gB = useRef<THREE.Group>(null);
  const t = useRef({ sx: 6, sOp: 1, bx: 2.5, bOp: 0, shake: 0 });
  const light = useRef<THREE.PointLight>(null);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    const k = (s: number) => 1 - Math.exp(-s * dt);
    const v = t.current;
    const drawn = state === "drawn";
    v.sx += ((drawn ? 3.6 : 0) - v.sx) * k(drawn ? 3 : 4);
    v.sOp += ((drawn ? 0 : 1) - v.sOp) * k(3);
    v.bx += ((drawn ? 0 : 2.5) - v.bx) * k(drawn ? 5 : 3);
    v.bOp += ((drawn ? 1 : 0) - v.bOp) * k(drawn ? 4 : 6);
    v.shake = Math.max(0, v.shake - dt);
    const jitter = state === "sheathed" && Math.abs(v.sx) < 0.05 ? Math.sin(performance.now() / 30) * 0.004 : 0;
    if (gS.current) {
      gS.current.position.x = v.sx + jitter;
      gS.current.rotation.z = (v.sx - 0) * 0.05;
    }
    if (gB.current) gB.current.position.x = v.bx;
    sheathed.setOpacity(v.sOp);
    blade.setOpacity(v.bOp);
    flash.current = Math.max(0, flash.current - dt * 2.2);
    if (light.current) light.current.intensity = 2 + flash.current * 60;
  });

  return (
    <>
      <pointLight ref={light} position={[0, 0.6, 1.6]} color="#ff3b30" distance={8} />
      <group ref={gS}>
        <Center>
          <primitive object={sheathed.obj} scale={1.6} />
        </Center>
      </group>
      <group ref={gB}>
        <Center>
          <primitive object={blade.obj} scale={1.6} />
        </Center>
      </group>
    </>
  );
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

  useEffect(() => {
    const a = setTimeout(() => setState("sheathed"), 300);
    return () => clearTimeout(a);
  }, []);

  const toggle = () => {
    flash.current = 1;
    setState((s) => (s === "drawn" ? "sheathed" : "drawn"));
  };

  return (
    <div className="relative h-full w-full">
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
          <Katanas state={state} flash={flash} />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} minPolarAngle={Math.PI / 3} maxPolarAngle={(2 * Math.PI) / 3} />
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
    </div>
  );
}

useGLTF.preload(sheathedAsset.url);
useGLTF.preload(bladeAsset.url);
