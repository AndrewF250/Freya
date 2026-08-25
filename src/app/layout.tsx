import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { defaultDescription, defaultKeywords, defaultOgImage, ogImageUrl, sharedOpenGraph, siteName, siteUrl } from "@/lib/seo";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — салон красоты и Davines в Перми`,
    template: `%s · ${siteName}`,
  },
  description: defaultDescription,
  keywords: defaultKeywords,
  authors: [{ name: "Кристина" }],
  creator: siteName,
  robots: { index: true, follow: true },
  openGraph: {
    ...sharedOpenGraph,
    url: siteUrl,
    title: `${siteName} — профессиональный уход Davines в Перми`,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Davines в Перми`,
    description: defaultDescription,
    images: [ogImageUrl(defaultOgImage)],
  },
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#faf6f0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={montserrat.variable}>
      <body>{children}</body>
    </html>
  );
}
