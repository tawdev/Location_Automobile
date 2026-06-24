import { SITE_URL, SITE_NAME } from "./seo";

export function organizationLD(_locale?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CARFORFAR",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/og-image.jpg`,
    description: "Location de voitures de luxe à Marrakech. Berlines, SUV, sportives avec chauffeur ou libre-service.",
    telephone: "+212-5XX-XXXXXX",
    email: "contact@carforfar.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Marrakech",
      addressLocality: "Marrakech",
      addressCountry: "MA",
      postalCode: "40000",
    },
    sameAs: [
      "https://www.instagram.com/carforfar",
      "https://www.facebook.com/carforfar",
    ],
  };
}

export function localBusinessLD(_locale?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CarRental",
    name: "CARFORFAR",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    image: `${SITE_URL}/og-image.jpg`,
    description: "Location de voitures de luxe à Marrakech.",
    priceRange: "$$",
    telephone: "+212-5XX-XXXXXX",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Marrakech",
      addressCountry: "MA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 31.6295,
      longitude: -7.9811,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "08:00",
      closes: "22:00",
    },
  };
}

export function websiteLD(_locale?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CARFORFAR",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/vehicules?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbLD(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function vehicleLD(vehicle: {
  name: string;
  description: string;
  image: string;
  url: string;
  brand: string;
  model: string;
  year?: number;
  fuelType?: string;
  seatingCapacity?: number;
  pricePerDay: number;
  currency?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: vehicle.name,
    description: vehicle.description,
    image: vehicle.image,
    url: vehicle.url,
    brand: { "@type": "Brand", name: vehicle.brand },
    model: vehicle.model,
    ...(vehicle.year && { vehicleModelDate: String(vehicle.year) }),
    ...(vehicle.fuelType && { fuelType: vehicle.fuelType }),
    ...(vehicle.seatingCapacity && { seatingCapacity: vehicle.seatingCapacity }),
    offers: {
      "@type": "Offer",
      price: vehicle.pricePerDay,
      priceCurrency: vehicle.currency || "MAD",
      availability: "https://schema.org/InStock",
      priceValidUntil: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
    },
  };
}

export function articleLD(article: {
  headline: string;
  description: string;
  image: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    image: article.image,
    url: article.url,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      "@type": "Person",
      name: article.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "CARFORFAR",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.png`,
      },
    },
  };
}
