import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.byebills.app"),
  title: "byeBills — your pocket bookkeeper",
  description: "Snap a receipt. Billie does the rest — automatic bookkeeping for side-hustlers.",
  icons: { icon: "/billie.png", apple: "/billie.png" },
  manifest: "/manifest.json",
  openGraph: {
    title: "byeBills — your pocket bookkeeper",
    description: "Snap a receipt. Billie does the rest.",
    url: "https://www.byebills.app",
    siteName: "byeBills",
    type: "website",
    locale: "en_US",
    images: [{ url: "/billie.png", width: 540, height: 540, alt: "Billie the flying invoice" }],
  },
  twitter: {
    card: "summary",
    title: "byeBills — your pocket bookkeeper",
    description: "Snap a receipt. Billie does the rest.",
    images: ["/billie.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} h-full antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0f1a14" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
