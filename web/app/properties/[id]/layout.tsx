import type { Metadata } from "next";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.murugohomes.com";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/api/v1/properties/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { title: "Property | Murugo Homes" };
    const json = await res.json();
    const property = json.data?.property ?? json.data;
    if (!property?.title) return { title: "Property | Murugo Homes" };
    const description =
      typeof property.description === "string"
        ? property.description.slice(0, 160)
        : "View property details on Murugo Homes.";
    const image = property.media?.[0]?.url;
    return {
      title: property.title,
      description,
      openGraph: {
        title: `${property.title} | Murugo Homes`,
        description,
        ...(image && { images: [image] }),
      },
      twitter: {
        card: "summary_large_image",
        title: property.title,
        description,
      },
    };
  } catch {
    return { title: "Property | Murugo Homes" };
  }
}

export default function PropertyDetailLayout({ children }: Props) {
  return <>{children}</>;
}
