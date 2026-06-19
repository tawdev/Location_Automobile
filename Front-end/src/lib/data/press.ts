export type PressRelease = {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
};

export const catKeys: Record<string, string> = {
  Funding: "press.category_funding",
  Product: "press.category_product",
  Awards: "press.category_awards",
  Partnership: "press.category_partnership",
  Growth: "press.category_growth",
};

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const pressReleases: PressRelease[] = [
  {
    slug: slugify("CarForFar Raises $12M Series A to Expand Across North Africa"),
    date: "2026-05-12",
    title: "CarForFar Raises $12M Series A to Expand Across North Africa",
    excerpt: "The Moroccan car rental startup plans to triple its fleet and launch in Tunisia and Algeria by 2027.",
    category: "Funding",
    content: `Casablanca, Morocco — CarForFar, Morocco's leading car rental marketplace, today announced it has raised $12 million in Series A funding led by North Africa Ventures with participation from existing investors.

The funding will accelerate CarForFar's expansion across North Africa, with plans to triple its fleet to over 3,000 vehicles and launch operations in Tunisia and Algeria by early 2027. The company will also invest heavily in its technology platform, including AI-powered recommendations, dynamic pricing, and a frictionless digital check-in experience.

"Morocco is just the beginning," said the CEO of CarForFar. "This investment validates our vision of building the most trusted car rental platform in Africa. We are excited to bring our customer-first approach to new markets."

The Series A brings CarForFar's total funding to $16 million. The company has experienced 300% year-over-year growth and served over 100,000 customers since its founding.`,
  },
  {
    slug: slugify("CarForFar Launches Electric Vehicle Subscription Service"),
    date: "2026-03-28",
    title: "CarForFar Launches Electric Vehicle Subscription Service",
    excerpt: "A new monthly subscription model gives customers access to a rotating fleet of electric vehicles with insurance and maintenance included.",
    category: "Product",
    content: `CarForFar has launched a new electric vehicle subscription service, allowing customers to drive electric for a flat monthly fee with insurance, maintenance, and roadside assistance included.

The subscription starts at 4,500 MAD per month and includes the option to swap vehicles every 30 days. The initial fleet features popular EV models including the Tesla Model 3, Renault Zoe, and MG4 Electric.

"Making electric vehicles accessible is a key part of our sustainability strategy," said the Chief Product Officer. "The subscription model removes the traditional barriers to EV adoption — high upfront costs and range anxiety — by offering flexibility and peace of mind."

Charging partners have been secured across Casablanca, Rabat, Marrakech, and Tangier, with over 200 charging points available to subscribers at no additional cost.`,
  },
  {
    slug: slugify("CarForFar Named Morocco's Most Innovative Startup of 2025"),
    date: "2026-02-10",
    title: "CarForFar Named Morocco's Most Innovative Startup of 2025",
    excerpt: "Recognized at the Morocco Startup Awards for transforming the car rental industry with technology.",
    category: "Awards",
    content: `CarForFar has been named Morocco's Most Innovative Startup of 2025 at the annual Morocco Startup Awards, held in Casablanca on February 8, 2026.

The award recognizes CarForFar's transformative impact on the car rental industry through its digital-first platform, AI-powered vehicle recommendations, and contactless rental experience. The judging panel highlighted the company's rapid growth, customer satisfaction metrics, and contribution to modernizing Morocco's tourism infrastructure.

"We are honored to receive this recognition," said the Head of Product. "Innovation is at the core of everything we do, from our smart pricing algorithms to our seamless mobile experience. This award belongs to the entire team."

CarForFar was selected from over 200 nominees across 12 categories, beating four other finalists in the innovation category.`,
  },
  {
    slug: slugify("Partnership with Royal Air Maroc: Seamless Travel for Tourists"),
    date: "2025-11-05",
    title: "Partnership with Royal Air Maroc: Seamless Travel for Tourists",
    excerpt: "Arriving passengers can now pre-book vehicles directly through Royal Air Maroc's booking platform.",
    category: "Partnership",
    content: `CarForFar has entered a strategic partnership with Royal Air Maroc, Morocco's national airline, to offer seamless car rental booking directly through the airline's reservation platform.

Starting November 2025, passengers booking flights to Morocco can add a CarForFar vehicle to their itinerary with a single click. The integration covers all major airports including Casablanca, Marrakech, Agadir, Rabat, and Tangier.

"This partnership transforms the travel experience for tourists arriving in Morocco," said the VP of Partnerships at CarForFar. "From the moment they book their flight to the moment they drive off the lot, the experience is seamless."

Royal Air Maroc passengers receive exclusive benefits including priority pickup, complimentary GPS, and a 10% discount on all rentals. The partnership is expected to serve over 50,000 travelers in its first year.`,
  },
  {
    slug: slugify("CarForFar Reaches 100,000 Customers Milestone"),
    date: "2025-09-15",
    title: "CarForFar Reaches 100,000 Customers Milestone",
    excerpt: "A 300% year-over-year growth driven by digital-first approach and customer-centric policies.",
    category: "Growth",
    content: `CarForFar has reached a significant milestone — 100,000 customers served since its inception, with a 300% year-over-year growth rate.

The achievement underscores the company's rapid adoption among both domestic and international travelers. Key drivers include the company's digital-first approach, transparent pricing with no hidden fees, and a customer-centric cancellation policy that allows free cancellations up to 48 hours before pickup.

"We crossed 100,000 customers faster than any car rental company in Morocco's history," said the CEO. "This milestone is a testament to the trust our customers place in us and the hard work of our team."

The company's net promoter score (NPS) of 72 places it among the highest-rated car rental services globally. The average customer books 2.3 times per year, indicating strong loyalty and repeat usage.`,
  },
  {
    slug: slugify("New Mobile App Launches with AI-Powered Recommendations"),
    date: "2025-07-01",
    title: "New Mobile App Launches with AI-Powered Recommendations",
    excerpt: "The updated app uses machine learning to suggest vehicles based on travel history and preferences.",
    category: "Product",
    content: `CarForFar has released a major update to its mobile application, introducing AI-powered vehicle recommendations that learn from user preferences, past rentals, and travel patterns.

The new recommendation engine analyzes factors including vehicle type preferences, budget range, driving history, seasonal trends, and even weather conditions to suggest the perfect vehicle for each trip. Early testing shows a 40% increase in booking conversion rates and a 25% reduction in time spent browsing.

"Our goal is to make finding the perfect car as easy as possible," said the Head of Mobile. "The AI learns what you like and surfaces the best options before you even start searching."

The updated app also features a redesigned interface, digital check-in with QR code pickup, and real-time vehicle tracking. It is available on iOS and Android.`,
  },
];
