import { apiRequest } from "./apiClient";
import type { User } from "./types";

export async function updateProfileName(name: string): Promise<User> {
  const body = new FormData();
  body.set("new_name", name);

  const res = await apiRequest<{ status?: string; message?: string; data: User }>({
    method: "PUT",
    path: "/profile/name",
    body,
  });

  return res.data;
}

export async function updateProfilePicture(file: File): Promise<User> {
  const body = new FormData();
  body.set("profile_pic", file);

  const res = await apiRequest<{ status?: string; message?: string; data: User }>({
    method: "PUT",
    path: "/profile/picture",
    body,
  });

  return res.data;
}

export async function updateProfilePassword(data: {
  old_password: string;
  new_password: string;
  confirme_password: string;
}): Promise<User> {
  const body = new FormData();
  body.set("old_password", data.old_password);
  body.set("new_password", data.new_password);
  body.set("confirme_password", data.confirme_password);

  const res = await apiRequest<{ status?: string; message?: string; data: User }>({
    method: "PUT",
    path: "/profile/password",
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
