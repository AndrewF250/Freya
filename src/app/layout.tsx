import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ФРЕЯ — профессиональный уход Davines",
    template: "%s · ФРЕЯ",
  },
  description:
    "Студия ФРЕЯ и Кристина, амбассадор Davines: подбор домашнего ухода, продажа продукции Davines и запись на приём.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={montserrat.variable}>
      <body>{children}</body>
    </html>
  );
}
