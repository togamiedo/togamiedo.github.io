import { PageTransition } from "@/components/PageTransition";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { IntroGate } from "../components/IntroGate";
import { SiteNav } from "../components/SiteNav";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();


  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Togami Genshiro · 戸上 玄城" },
      { name: "description", content: "The tale of Togami Genshiro, a disgraced ronin and rose-obsessed bounty hunter." },
      { property: "og:title", content: "Togami Genshiro · 戸上 玄城" },
      { property: "og:description", content: "A disgraced ronin and rose-obsessed bounty hunter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Shippori+Mincho+B1:wght@500;700;800&family=Yuji+Syuku&family=Dela+Gothic+One&family=Great+Vibes&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <IntroGate />
      <SiteNav />
      <PageTransition />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <footer className="relative border-t border-gold/20 bg-lacquer/80 px-6 pb-28 pt-12 text-center">
        <p className="font-brush text-3xl text-primary glow-red">制作</p>
        <p className="mt-1 font-display text-xs uppercase tracking-[0.5em] text-gold">Credits</p>
        <p className="mt-5 font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">Made by</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-x-8 gap-y-2 font-body text-xl italic text-paper">
          {["f1ras_", "SoLongGONETEDZ", "Siiiilkbind.-.", "velcrozzz", "cu!lan"].map((n) => (
            <li key={n} className="transition hover:text-primary">🌹 {n}</li>
          ))}
        </ul>
        <p className="mt-6 font-body text-sm italic text-paper/50">Katana model by @rosepath on Roblox · Music: Shika no Tōne, traditional shakuhachi (public domain)</p>
      </footer>
    </QueryClientProvider>
  );
}
