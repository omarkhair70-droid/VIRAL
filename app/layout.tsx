import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { PwaRegister } from "@/components/pwa-register";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  metadataBase: new URL("https://baddelha.app"),
  title: {
    default: "بدّلها | سوق المقايضة",
    template: "%s | بدّلها",
  },
  description: "بدّل الحاجة بدل ما تسيبها مركونة.",
  applicationName: "بدّلها",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "بدّلها",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/icons/icon-maskable.svg", color: "#C45A3A" }],
  },
  openGraph: {
    title: "بدّلها | سوق المقايضة",
    description: "بدّل الحاجة بدل ما تسيبها مركونة.",
    type: "website",
    locale: "ar_EG",
  },
};

export const viewport: Viewport = {
  themeColor: "#c86f3d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <SiteHeader />
        <main className="pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:pb-0">{children}</main>
        <SiteFooter />
        <MobileBottomNav />
        <PwaRegister />
      </body>
    </html>
  );
}
