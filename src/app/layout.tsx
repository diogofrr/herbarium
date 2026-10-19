import type { Metadata, Viewport } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import "./leaflet.css";
import { AppShell } from "@/components/app-shell";
import { PwaRegister } from "@/components/pwa";
import { Providers } from "@/components/providers";

const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const bodyFont = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Herbarium | Mapa e guia de ervas da Umbanda",
    template: "%s | Herbarium",
  },
  description:
    "Mapa colaborativo de ervas em Uberlândia e guia de ervas da Umbanda: orixás, povos, temperatura e função de cada erva.",
  applicationName: "Herbarium",
  appleWebApp: { capable: true, title: "Herbarium", statusBarStyle: "black-translucent" },
  icons: { apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#255633",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <PwaRegister />
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
