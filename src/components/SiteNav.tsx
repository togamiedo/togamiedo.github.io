import { Link } from "@tanstack/react-router";

const items = [
  { to: "/", en: "Introduction", jp: "序" },
  { to: "/story", en: "Story", jp: "物語" },
  { to: "/weapon", en: "Weapon", jp: "刀" },
] as const;

export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-lacquer to-transparent">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="font-brush text-2xl text-primary glow-red">戸上</Link>
        <ul className="flex gap-6 md:gap-10">
          {items.map((it) => (
            <li key={it.to}>
              <Link
                to={it.to}
                className="group flex flex-col items-center font-display text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-paper"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: true }}
              >
                <span className="font-brush text-base normal-case tracking-normal">{it.jp}</span>
                {it.en}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
