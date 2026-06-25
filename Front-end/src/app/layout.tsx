import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import HtmlLangSync from "@/components/HtmlLangSync";
import Footer from "@/components/Footer";
import Script from "next/script";
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SOCIAL } from "@/lib/seo";
import { organizationLD, websiteLD, localBusinessLD } from "@/lib/json-ld";



const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-headings",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-96.png', type: 'image/png', sizes: '96x96' },
      { url: '/favicon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180' },
    ],
  },
  
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} – ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: "CARFORFAR – Location de voitures de luxe à Marrakech. Réservez votre berline, SUV ou sportive Premium. Livraison aéroport, chauffeur privé. Meilleur rapport qualité-prix.",
  keywords: [
    "location voiture Marrakech",
    "location voiture luxe Marrakech", 
    "voiture de luxe Marrakech",
    "car rental Marrakech",
    "luxury car rental Morocco",
    "voiture avec chauffeur Marrakech",
    "location berline Marrakech",
    "SUV luxe Marrakech",
    "carforfar",
    "agence location voiture Marrakech",
    "voiture sportive Marrakech",
    "location voiture aéroport Marrakech",
    "location voiture premium Marrakech",
    "voiture de location Marrakech pas cher",
    "location voiture luxe Marrakech pas cher",
    "meilleure agence location voiture Marrakech",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
  openGraph: {
    type: "website",
    locale: "fr_MA",
    alternateLocale: ["en_US", "ar_AE"],
    siteName: "CARFORFAR",
    title: "CARFORFAR – Location de Voitures de Luxe à Marrakech",
    description: "Location de voitures premium à Marrakech. Berlines, SUV, sportives. Livraison aéroport disponible.",
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "CARFORFAR – Location de Voitures de Luxe à Marrakech",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SOCIAL.twitter,
    creator: SOCIAL.twitter,
    title: `${SITE_NAME} – ${SITE_TAGLINE}`,
    description: "Location de voitures de luxe à Marrakech. Réservez votre véhicule premium.",
    images: [`${SITE_URL}/og-image.jpg`],
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "car rental",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
  other: {
    "geo.region": "MA-07",
    "geo.placename": "Marrakech",
    "geo.position": "31.6295;-7.9811",
    "ICBM": "31.6295, -7.9811",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          <HtmlLangSync />
          <div className="flex-1">{children}</div>
          <Footer />
        </Providers>
        <Script
          id="ld-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLD()) }}
        />
        <Script
          id="ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLD()) }}
        />
        <Script
          id="ld-local-business"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLD()) }}
        />
      </body>
    </html>
  );
}
