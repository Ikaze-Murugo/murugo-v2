import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Murugo Homes - Find Your Perfect Property in Rwanda",
    template: "%s | Murugo Homes",
  },
  description: "Discover houses, apartments, offices, and land for rent or sale in Rwanda. Connect directly with property owners and agents.",
  keywords: ["Rwanda real estate", "property in Rwanda", "houses for rent", "apartments for sale", "Kigali properties", "land for sale Rwanda"],
  authors: [{ name: "Murugo Homes" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://murugohomes.com",
    siteName: "Murugo Homes",
    title: "Murugo Homes - Find Your Perfect Property in Rwanda",
    description: "Discover houses, apartments, offices, and land for rent or sale in Rwanda. Connect directly with property owners and agents.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Murugo Homes - Find Your Perfect Property in Rwanda",
    description: "Discover houses, apartments, offices, and land for rent or sale in Rwanda.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
