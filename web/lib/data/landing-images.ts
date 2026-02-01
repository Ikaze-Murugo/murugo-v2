/**
 * Landing page image paths – filenames match what’s in public/images/landing/
 * (mix of .png, .jpg, .svg, .svg.png)
 */
const base = "/images/landing";

export const landingImages = {
  hero: {
    phone: `${base}/hero/phone-app.png`,
  },
  appStores: {
    google: `${base}/app-stores/google-store.svg`,
    apple: `${base}/app-stores/apple-store.svg.png`,
  },
  partners: [
    `${base}/partners/partner-1.svg`,
    `${base}/partners/partner-2.svg`,
    `${base}/partners/partner-3.svg`,
    `${base}/partners/partner-4.svg`,
    `${base}/partners/partner-5.svg`,
    `${base}/partners/partner-6.svg`,
  ],
  services: {
    renting: { image: `${base}/services/renting.jpg`, title: "Renting houses", description: "Find your next rental across Rwanda." },
    buying: { image: `${base}/services/buying.jpg`, title: "Buying houses", description: "Browse homes for sale and connect with sellers." },
    selling: { image: `${base}/services/selling.jpg`, title: "Selling homes", description: "List your property and reach serious buyers." },
  },
} as const;
