import { apiRequest } from "./apiClient";

export type ClientInfo = {
  id?: number;
  user_id?: number;
  nom_prenom: string;
  date_naissance: string;
  cin_passport: string;
  adresse: string;
  telephone: string;
  numero_permi: string;
  date_delivrance: string;
  date_expiration: string;
};

export async function getClientInfo(): Promise<ClientInfo | null> {
  const res = await apiRequest<{ status: string; data: ClientInfo | null }>({
    method: "GET",
    path: "/client",
    auth: true,
  });
  return res.data;
}

export async function saveClientInfo(payload: ClientInfo): Promise<ClientInfo> {
  const res = await apiRequest<{ status: string; data: ClientInfo }>({
    method: "POST",
    path: "/client",
    body: payload as unknown as Record<string, unknown>,
    auth: true,
  });
  return res.data;
}
