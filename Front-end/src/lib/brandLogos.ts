const brandAliases: Record<string, string> = {
  renault: "renault",
  bmw: "bmw",
  mercedes: "mercedes",
  mercedesbenz: "mercedes",
  "mercedes-benz": "mercedes",
  audi: "audi",
  peugeot: "peugeot",
  volkswagen: "volkswagen",
  vw: "volkswagen",
  toyota: "toyota",
  dacia: "dacia",
  nissan: "nissan",
  hyundai: "hyundai",
  kia: "kia",
  citroen: "citroen",
  citroën: "citroen",
  fiat: "fiat",
  ford: "ford",
  opel: "opel",
  seat: "seat",
  skoda: "skoda",
  mazda: "mazda",
  honda: "honda",
  suzuki: "suzuki",
  landrover: "landrover",
  "land-rover": "landrover",
  jaguar: "jaguar",
  porsche: "porsche",
  ferrari: "ferrari",
  lamborghini: "lamborghini",
  maserati: "maserati",
  volvo: "volvo",
  mini: "mini",
  smart: "smart",
  jeep: "jeep",
  ds: "ds",
  alpine: "alpine",
  lexus: "lexus",
  mg: "mg",
  mitsubishi: "mitsubishi",
  subaru: "subaru",
  chrysler: "chrysler",
  chevrolet: "chevrolet",
  dodge: "dodge",
  bentley: "bentley",
  rollsroyce: "rollsroyce",
  "rolls-royce": "rollsroyce",
  tesla: "tesla",
  polestar: "polestar",
};

function normalize(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function getBrandLogo(marque: string): string | null {
  let key = marque.toLowerCase().trim();
  key = normalize(key);
  key = key.replace(/[^a-z0-9-]/g, "");

  const normalized = brandAliases[key];
  if (!normalized) return null;

  return `/logos/${normalized}.svg`;
}
