import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download the app",
  description:
    "Download the Murugo Homes Android app to browse properties, save favorites, and contact listers on the go.",
  openGraph: {
    title: "Download Murugo Homes app",
    description: "Get the Android app for Murugo Homes – property in Rwanda.",
    url: "https://murugohomes.com/download",
  },
};

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
