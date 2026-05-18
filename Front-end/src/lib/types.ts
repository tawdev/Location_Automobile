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
  pictures?: Picture[];
  category?: Category;
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
