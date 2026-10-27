import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useSpring } from "framer-motion";
import { StoryFlow } from "@/components/StoryFlow";
import { Petals } from "@/components/Petals";
import { story } from "@/lib/story";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "The Story of Togami Genshiro · 物語" },
      { name: "description", content: "Three chapters of Togami Genshiro: the root, the bloom and the thorn. A tale of law, roses and blood in Kyoto." },
      { property: "og:title", content: "The Story of Togami Genshiro · 物語" },
      { property: "og:description", content: "The root, the bloom and the thorn. Law, roses and blood in Kyoto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StoryPage,
});

function StoryPage() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  return (
    <main className="relative overflow-x-clip pb-40">
      <motion.div className="fixed left-0 top-0 z-[60] h-1 w-full origin-left bg-primary" style={{ scaleX: progress }} />
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center text-center">
        <Petals count={10} />
        <p className="font-brush text-7xl text-primary glow-red md:text-9xl">物語</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-[0.3em] text-paper md:text-5xl">THE STORY</h1>
        <p className="mt-6 animate-pulse font-display text-xs uppercase tracking-[0.5em] text-gold">Scroll to unroll ↓</p>
      </section>
      <StoryFlow blocks={story} />
      <div className="mt-32 text-center">
        <Link to="/weapon" className="inline-block bg-primary px-7 py-3 font-display text-sm uppercase tracking-[0.3em] text-primary-foreground hover:bg-blood">
          See the rose blade
        </Link>
      </div>
    </main>
  );
}
