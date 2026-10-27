import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { WeaponFlow } from "@/components/WeaponFlow";
import { weaponStory } from "@/lib/story";

const KatanaViewer = lazy(() => import("@/components/KatanaViewer"));

export const Route = createFileRoute("/weapon")({
  head: () => ({
    meta: [
      { title: "The Rose Blade · Togami's Katana · 刀" },
      { name: "description", content: "Togami Genshiro's katana in 3D: a family heirloom reforged with a blood-red rose tsuba and an illegal crimson saya." },
      { property: "og:title", content: "The Rose Blade · Togami's Katana" },
      { property: "og:description", content: "A family heirloom reforged with a rose tsuba and an illegal crimson saya." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WeaponPage,
});

function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="font-brush animate-pulse text-4xl text-primary">刀</p>
    </div>
  );
}

function WeaponPage() {
  return (
    <main className="pb-40">
      <section className="relative h-screen">
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-24 z-10 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <p className="font-brush text-6xl text-primary glow-red md:text-7xl">薔薇ノ刀</p>
          <h1 className="font-display text-sm uppercase tracking-[0.5em] text-gold">The Rose Blade</h1>
        </motion.div>
        <ClientOnly fallback={<Loading />}>
          <Suspense fallback={<Loading />}>
            <KatanaViewer />
          </Suspense>
        </ClientOnly>
      </section>
      <WeaponFlow blocks={weaponStory} />
    </main>
  );
}
