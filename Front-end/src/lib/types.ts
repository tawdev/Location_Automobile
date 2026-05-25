export type RoleId = number;

export type User = {
  id: number;
  name: string;
  email: string;
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

export type Vehicle = {
  id: number;
  marque: string;
  model: string;
  year: number;
  registration: string;
  km: number;
  pricePerDay: number;
  fuelType: string;
  category_id: number;
  Occupants: string;
  device_id?: string | null;
  pictures?: Picture[];
  category?: Category;
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

  // Backend /with('user','vehicle') may also return nested objects
  vehicle?: Vehicle;
  user?: User;
};
