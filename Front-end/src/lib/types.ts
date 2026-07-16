export type RoleId = number;

export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  cin_passport?: string | null;
  date_of_birth?: string | null;
  driver_license_number?: string | null;
  license_issue_date?: string | null;
  license_expiry_date?: string | null;
  role_id: RoleId;

  // profile images/documents (stored as filenames/paths)
  profile_pic?: string | null;
  cin_recto?: string | null;
  cin_verso?: string | null;
  permi_recto?: string | null;
  permi_verso?: string | null;
  scCinRecto?: string | null;
  scCinVerso?: string | null;
  scPermiRecto?: string | null;
  scPermiVerso?: string | null;

  // permissions loaded for admin panel access
  permissions?: { id: number; slug: string }[];
};

export type Picture = {
  id: number;
  vehicle_id: number;
  path: string;
};

export type Category = {
  id: number;
  name: string;
};

export type TypeVehicule = {
  id: number;
  name: string;
};

export type Marque = {
  id: number;
  name: string;
  logo: string | null;
};

export type Country = {
  id: number;
  name: string;
  cities?: City[];
};

export type CityLocation = {
  id: number;
  city_id: number;
  name: string;
  type: "airport" | "citycenter";
  price?: number | null;
};

export type City = {
  id: number;
  country_id: number;
  name: string;
  locations?: CityLocation[];
};

export type Vehicle = {
  id: number;
  marque: string;
  model: string;
  year: number;
  registration: string;
  km: number;
  pricePerDay: number;
  fuelType: string;
  transmission?: string | null;
  protection_percentage?: number;
  protection_price_percentage?: number;
  category_id: number;
  type_vehicule_id?: number | null;
  Occupants: string;
  device_id?: string | null;
  air_conditioner?: boolean;
  gps?: boolean;
  order?: number | null;
  country_id?: number | null;
  city_id?: number | null;
  pickup_country_id?: number | null;
  pickup_city_id?: number | null;
  current_country_id?: number | null;
  current_city_id?: number | null;
  location_type?: string | null;
  pictures?: Picture[];
  category?: Category;
  typeVehicule?: TypeVehicule;
  country?: Country;
  city?: Country;
  pickupCountry?: Country;
  pickupCity?: City;
  currentCountry?: Country;
  currentCity?: City;
  created_at?: string;
};

export type DashboardStats = {
  totalVehicles: number;
  totalReservations: number;
  totalClients: number;
  totalRevenue: number;
  reservationsByStatus: {
    En_Attente: number;
    Confirmée: number;
    Annulée: number;
    Terminée: number;
  };
  monthlyRevenue: { month: string; revenue: number }[];
  recentReservations: {
    id: number;
    start_date: string;
    end_date: string;
    status: string;
    TotalPrice: number;
    user: { id: number; name: string; email: string } | null;
    vehicle: { id: number; marque: string; model: string } | null;
  }[];
  popularVehicles: {
    count: number;
    vehicle: {
      id: number;
      marque: string;
      model: string;
      pricePerDay: number;
      pictures?: Picture[];
      category?: Category;
    } | null;
  }[];
};

export type ReservationStatus = string;

export type Reservation = {
  id: number;
  start_date: string;
  end_date: string;
  user_id: number;
  vehicle_id: number;
  status: ReservationStatus;
  TotalPrice: number;
  contract_pdf?: string | null;

  // New fields
  client_id?: number | null;
  lieu_depart?: string | null;
  lieu_retour?: string | null;
  depart_country_id?: number | null;
  depart_city_id?: number | null;
  return_country_id?: number | null;
  return_city_id?: number | null;
  date_heure_depart?: string | null;
  date_heure_retour?: string | null;
  caution_montant?: number | null;
  caution_mode?: string | null;
  depart_location_type?: string | null;
  return_location_type?: string | null;
  return_location_name?: string | null;
  return_location_supplement?: number | null;
  observations?: string | null;

  // Second conductor
  driver2_nom_prenom?: string | null;
  driver2_date_naissance?: string | null;
  driver2_cin_passport?: string | null;
  driver2_adresse?: string | null;
  driver2_telephone?: string | null;
  driver2_numero_permi?: string | null;
  driver2_date_delivrance?: string | null;
  driver2_date_expiration?: string | null;

  // Old second conductor fields kept for compatibility
  driver2_name?: string | null;

  // Backend /with('user','vehicle') may also return nested objects
  vehicle?: Vehicle;
  user?: User;
  depart_country?: Country;
  depart_city?: City;
  return_country?: Country;
  return_city?: City;
  extras?: Extra[];
  client?: ClientInfo;
  departure_conditions?: DepartureCondition[];
  pictures?: ReservationPicture[];
};

export type ReservationPicture = {
  id: number;
  reservation_id: number;
  type: "before" | "after";
  path: string;
  created_at: string;
};

export type ClientInfo = {
  id: number;
  user_id: number;
  nom_prenom: string;
  date_naissance: string;
  cin_passport: string;
  adresse: string;
  telephone: string;
  numero_permi: string;
  date_delivrance: string;
  date_expiration: string;
};

export type DepartureCondition = {
  id: number;
  name: string;
  pivot?: {
    checked: boolean;
  };
};

export type Extra = {
  id: number;
  name: string;
  price_per_day: number;
  image?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Blog = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  author: string | null;
  published_at: string | null;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
};

export type PressRelease = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  category: string | null;
  published_at: string | null;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
};

export type Career = {
  id: number;
  title: string;
  slug: string;
  location: string | null;
  type: string | null;
  department: string | null;
  description: string | null;
  requirements: string | null;
  salary_range: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
