import { SITE_URL, SITE_NAME } from "./seo";

export function organizationLD(locale: string = "fr") {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: "CARFORFAR Marrakech",
    url: SITE_URL,
    logo: `${SITE_URL}/CarForFar_logo.png`,
    image: `${SITE_URL}/CarForFar_logo.png`,
    description:
      locale === "fr"
        ? "Location de voitures de luxe à Marrakech"
        : locale === "ar"
          ? "تأجير سيارات فاخرة في مراكش"
          : "Luxury car rental in Marrakech",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Avenue Mohammed VI",
      addressLocality: "Marrakech",
      addressRegion: "Marrakech-Safi",
      postalCode: "40000",
      addressCountry: "MA",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+212-5XX-XXXXXX",
        contactType: "customer service",
        availableLanguage: ["French", "English", "Arabic"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+212-5XX-XXXXXX",
        contactType: "reservations",
        availableLanguage: ["French", "English", "Arabic"],
      },
    ],
    sameAs: [
      "https://facebook.com/carforfar",
      "https://instagram.com/carforfar",
    ],
    foundingDate: "2010",
    foundingLocation: "Marrakech, Morocco",
    numberOfEmployees: { "@type": "QuantitativeValue", minValue: 10, maxValue: 50 },
  };
}

export function websiteLD(locale: string = "fr") {
  const desc =
    locale === "fr"
      ? "Location de voitures de luxe à Marrakech. Réservez votre véhicule premium."
      : locale === "ar"
        ? "تأجير سيارات فاخرة في مراكش. احجز سيارتك المميزة."
        : "Luxury car rental in Marrakech. Book your premium vehicle.";

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: desc,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/vehicules?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function localBusinessLD(locale: string = "fr") {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    image: `${SITE_URL}/logo.png`,
    url: SITE_URL,
    telephone: "+212-5XX-XXXXXX",
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Avenue Mohammed VI",
      addressLocality: "Marrakech",
      addressRegion: "Marrakech-Safi",
      postalCode: "40000",
      addressCountry: "MA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 31.6295,
      longitude: -7.9811,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "08:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "09:00",
        closes: "14:00",
      },
    ],
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
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}
