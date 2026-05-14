import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { PwaRegister } from "@/components/pwa-register";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  metadataBase: new URL("https://viral-one-delta.vercel.app"),
  title: {
    default: "تِسوى | حاجتك ممكن تِسوى إيه عند غيرك؟",
    template: "%s | تِسوى",
  },
  description: "تِسوى مساحة تعرض فيها الحاجات اللي خرجت من حياتك، وتشوف قيمتها وهي بتتغيّر في عيون ناس تانية من خلال اقتراحات ومقايضات غير متوقعة.",
  applicationName: "تِسوى",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "تِسوى",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "تِسوى | حاجتك ممكن تِسوى إيه عند غيرك؟",
    description: "تِسوى مساحة تعرض فيها الحاجات اللي خرجت من حياتك، وتشوف قيمتها وهي بتتغيّر في عيون ناس تانية من خلال اقتراحات ومقايضات غير متوقعة.",
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
