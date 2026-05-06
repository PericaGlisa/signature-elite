import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Stranica nije pronađena</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Stranica koju tražiš ne postoji ili je premeštena.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Početna strana
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Signature Elite · Studio za email potpise" },
      { name: "description", content: "Premium generator email potpisa u brendu EKO Elektrofrigo. QR vCard, OEM bedževi, dual CTA dugmad, social proof i multi-platform export." },
      { name: "author", content: "EKO Elektrofrigo" },
      { property: "og:title", content: "Signature Elite · Studio za email potpise" },
      { property: "og:description", content: "Premium generator email potpisa u brendu EKO Elektrofrigo. QR vCard, OEM bedževi, dual CTA dugmad, multi-platform export." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/og-image.svg" },
      { property: "og:image:type", content: "image/svg+xml" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Signature Elite · Studio za email potpise" },
      { name: "twitter:description", content: "Premium generator email potpisa u brendu EKO Elektrofrigo." },
      { name: "twitter:image", content: "/og-image.svg" },
      { name: "theme-color", content: "#2A3F8F" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/favicon.svg" },
      { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr">
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
  return <Outlet />;
}
