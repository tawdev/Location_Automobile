import { apiRequest } from "./apiClient";
import type { User } from "./types";

type UpdateProfilePayload = {
  name?: string;
  email?: string;
  profile_pic?: File | null;
  new_password?: string;
  confirme_password?: string;
};

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const body = new FormData();

  if (payload.name) body.set("name", payload.name);
  if (payload.email) body.set("email", payload.email);

  if (payload.profile_pic) {
    body.set("profile_pic", payload.profile_pic);
  }

  if (payload.new_password) body.set("new_password", payload.new_password);
  if (payload.confirme_password) body.set("confirme_password", payload.confirme_password);

  const res = await apiRequest<{ status?: string; message?: string; data: User }>({
    method: "PUT",
    path: "/profile",
    body,
  });

  return res.data;
}

export async function addCin(cinRecto: File, cinVerso: File): Promise<void> {
  const body = new FormData();
  body.set("cin_recto", cinRecto);
  body.set("cin_verso", cinVerso);

  await apiRequest({
    method: "POST",
    path: "/Profile/CIN",
    body,
  });
}

export async function addPermi(permiRecto: File, permiVerso: File): Promise<void> {
  const body = new FormData();
  body.set("permi_recto", permiRecto);
  body.set("permi_verso", permiVerso);

  await apiRequest({
    method: "POST",
    path: "/Profile/Permi",
    body,
  });
}
