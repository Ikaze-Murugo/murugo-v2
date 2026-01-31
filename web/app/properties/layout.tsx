import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Properties",
  description:
    "Explore houses, apartments, offices, and land for rent or sale in Rwanda. Filter by location, price, type, and more.",
  openGraph: {
    title: "Browse Properties - Murugo Homes",
    description:
      "Explore houses, apartments, offices, and land for rent or sale in Rwanda.",
  },
};

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
