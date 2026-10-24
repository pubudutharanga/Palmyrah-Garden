import type { Metadata, Viewport } from "next";
import { Fraunces, Great_Vibes, Hanken_Grotesk, Limelight } from "next/font/google";

import { Providers } from "@/components/providers";
import { resort } from "@/content/resort";
import { cn } from "@/lib/utils";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

/** Calligraphic wordmark — matches the resort's script logotype. */
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap",
});

/** Art Deco subtitle — "Mannar, Sri Lanka" under the mark. */
const limelight = Limelight({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-limelight",
  display: "swap",
});

const prototype = process.env.NEXT_PUBLIC_PROTOTYPE_MODE !== "false";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${resort.name} — Mannar, Sri Lanka`,
    template: `%s — ${resort.name}`,
  },
  description: resort.summary,
  applicationName: resort.name,
  authors: [{ name: resort.name }],
  keywords: [
    "Mannar hotel",
    "Northern Province resort",
    "Sri Lanka boutique hotel",
    "Palmyrah Garden",
    "Mannar accommodation",
  ],
  robots: prototype
    ? { index: false, follow: false, nocache: true }
    : { index: true, follow: true },
  openGraph: {
    type: "website",
    title: `${resort.name} — Mannar, Sri Lanka`,
    description: resort.summary,
    siteName: resort.name,
    locale: "en_LK",
    url: appUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${resort.name} — Mannar, Sri Lanka`,
    description: resort.summary,
  },
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#F3F5F0",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(
        fraunces.variable,
        hanken.variable,
        greatVibes.variable,
        limelight.variable,
        "h-full antialiased",
      )}
    >
      <body className="flex min-h-full flex-col bg-salt text-ink">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-ink px-5 py-3 text-salt focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
