"use client";

import React, { useEffect, useMemo, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/authContext";
import type { User } from "@/lib/types";
import { profileImageUrl, vehicleImageUrl } from "@/lib/media";
import { addCin, addPermi, updateProfile } from "@/lib/profileApi";
import { useRouter } from "next/navigation";
import { authLogout } from "@/lib/authApi";
import { clearAuthToken } from "@/lib/tokenStorage";

function TopBar({ user }: { user: User | null }) {
  const router = useRouter();

  return (
    <div className="border-b-4 border-black bg-white p-4 flex items-center justify-between gap-4">
      <div className="flex flex-col">
        <div className="font-black text-xl leading-tight">Location Automobile</div>
        <div className="font-bold text-sm">{user?.name ?? ""}</div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/vehicles")}
          className="font-black border-2 border-black px-3 py-2 bg-white hover:bg-zinc-100"
        >
          Vehicles
        </button>

        <button
          type="button"
          onClick={() => router.push("/reservations")}
          className="font-black border-2 border-black px-3 py-2 bg-white hover:bg-zinc-100"
        >
          My reservations
        </button>

        <button
          type="button"
          onClick={async () => {
            try {
              await authLogout();
            } finally {
              clearAuthToken();
              router.push("/login");
            }
          }}
          className="font-black border-2 border-black px-3 py-2 bg-white hover:bg-zinc-100"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const initial = useMemo(() => {
    return {
      name: user?.name ?? "",
      email: user?.email ?? "",
      profile_pic: user?.profile_pic ?? null,
      cin_recto: user?.cin_recto ?? null,
      cin_verso: user?.cin_verso ?? null,
      permi_recto: user?.permi_recto ?? null,
      permi_verso: user?.permi_verso ?? null,
    };
  }, [user]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmePassword, setConfirmePassword] = useState("");

  const [basicSubmitting, setBasicSubmitting] = useState(false);
  const [basicError, setBasicError] = useState<string | null>(null);
  const [basicSuccess, setBasicSuccess] = useState<string | null>(null);

  const [cinRectoFile, setCinRectoFile] = useState<File | null>(null);
  const [cinVersoFile, setCinVersoFile] = useState<File | null>(null);
  const [permiRectoFile, setPermiRectoFile] = useState<File | null>(null);
  const [permiVersoFile, setPermiVersoFile] = useState<File | null>(null);

  const [docsSubmitting, setDocsSubmitting] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [docsSuccess, setDocsSuccess] = useState<string | null>(null);

  useEffect(() => {
    setName(initial.name);
    setEmail(initial.email);
  }, [initial.email, initial.name]);

  async function onUpdateBasic(e: React.FormEvent) {
    e.preventDefault();

    setBasicSubmitting(true);
    setBasicError(null);
    setBasicSuccess(null);

    try {
      await updateProfile({
        name: name.trim() ? name.trim() : undefined,
        email: email.trim() ? email.trim() : undefined,
        profile_pic: profilePicFile,
        new_password: newPassword ? newPassword : undefined,
        confirme_password: confirmePassword ? confirmePassword : undefined,
      });

      setBasicSuccess("Profile updated successfully.");
      setProfilePicFile(null);
      setNewPassword("");
      setConfirmePassword("");
      await refreshUser();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      setBasicError(msg);
    } finally {
      setBasicSubmitting(false);
    }
  }

  async function onUploadCin(e: React.FormEvent) {
    e.preventDefault();
    if (!cinRectoFile || !cinVersoFile) {
      setDocsError("Please select both CIN recto and CIN verso.");
      return;
    }

    setDocsSubmitting(true);
    setDocsError(null);
    setDocsSuccess(null);

    try {
      await addCin(cinRectoFile, cinVersoFile);
      setDocsSuccess("CIN updated successfully.");
      setCinRectoFile(null);
      setCinVersoFile(null);
      await refreshUser();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to upload CIN";
      setDocsError(msg);
    } finally {
      setDocsSubmitting(false);
    }
  }

  async function onUploadPermi(e: React.FormEvent) {
    e.preventDefault();
    if (!permiRectoFile || !permiVersoFile) {
      setDocsError("Please select both Permi recto and Permi verso.");
      return;
    }

    setDocsSubmitting(true);
    setDocsError(null);
    setDocsSuccess(null);

    try {
      await addPermi(permiRectoFile, permiVersoFile);
      setDocsSuccess("Permi updated successfully.");
      setPermiRectoFile(null);
      setPermiVersoFile(null);
      await refreshUser();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to upload Permi";
      setDocsError(msg);
    } finally {
      setDocsSubmitting(false);
    }
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-zinc-50 text-black">
        <TopBar user={user} />

        <div className="max-w-5xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic profile */}
          <div className="border-4 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="font-black text-3xl mb-2">Profile</h1>
            <p className="font-bold mb-6">Update your information</p>

            {basicError ? (
              <div className="mb-4 p-3 border-2 border-black bg-white font-bold">
                {basicError}
              </div>
            ) : null}

            {basicSuccess ? (
              <div className="mb-4 p-3 border-2 border-black bg-white font-bold">
                {basicSuccess}
              </div>
            ) : null}

            <form onSubmit={onUpdateBasic} className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="font-bold">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-2 border-black p-2"
                  type="text"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-bold">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2 border-black p-2"
                  type="email"
                />
              </label>

              <div className="flex items-start gap-4">
                <div className="w-24">
                  {initial.profile_pic ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profileImageUrl(initial.profile_pic)}
                      alt="Profile"
                      className="w-24 h-24 object-cover border-2 border-black"
                    />
                  ) : (
                    <div className="w-24 h-24 border-2 border-black flex items-center justify-center font-black">
                      No pic
                    </div>
                  )}
                </div>

                <label className="flex flex-col gap-2 flex-1">
                  <span className="font-bold">Profile picture</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setProfilePicFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)
                    }
                  />
                  <span className="text-sm font-bold">Optional</span>
                </label>
              </div>

              <div className="border-t-4 border-black pt-4 mt-2">
                <div className="font-black text-xl mb-2">Change password</div>

                <label className="flex flex-col gap-2">
                  <span className="font-bold">New password</span>
                  <input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border-2 border-black p-2"
                    type="password"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="font-bold">Confirm password</span>
                  <input
                    value={confirmePassword}
                    onChange={(e) => setConfirmePassword(e.target.value)}
                    className="border-2 border-black p-2"
                    type="password"
                  />
                </label>

                <div className="text-sm font-bold mt-2">
                  Leave empty if you don't want to change password.
                </div>
              </div>

              <button
                type="submit"
                disabled={basicSubmitting}
                className="h-12 font-black text-lg border-2 border-black bg-white hover:bg-zinc-100 disabled:opacity-50"
              >
                {basicSubmitting ? "Saving..." : "Save profile"}
              </button>
            </form>
          </div>

          {/* Documents */}
          <div className="border-4 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="font-black text-3xl mb-2">Documents</h2>
            <p className="font-bold mb-6">Upload CIN + Permi images</p>

            {docsError ? (
              <div className="mb-4 p-3 border-2 border-black bg-white font-bold">
                {docsError}
              </div>
            ) : null}
            {docsSuccess ? (
              <div className="mb-4 p-3 border-2 border-black bg-white font-bold">
                {docsSuccess}
              </div>
            ) : null}

            {/* CIN */}
            <form onSubmit={onUploadCin} className="flex flex-col gap-4 mb-8">
              <div className="border-t-4 border-black pt-4 mt-2">
                <div className="font-black text-xl mb-2">CIN</div>

                <div className="flex items-start gap-4">
                  <div className="flex gap-3">
                    <div className="w-24">
                      {initial.cin_recto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={vehicleImageUrl(initial.cin_recto)}
                          alt="CIN recto"
                          className="w-24 h-24 object-cover border-2 border-black"
                        />
                      ) : (
                        <div className="w-24 h-24 border-2 border-black flex items-center justify-center font-black">
                          Recto
                        </div>
                      )}
                    </div>
                    <div className="w-24">
                      {initial.cin_verso ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={vehicleImageUrl(initial.cin_verso)}
                          alt="CIN verso"
                          className="w-24 h-24 object-cover border-2 border-black"
                        />
                      ) : (
                        <div className="w-24 h-24 border-2 border-black flex items-center justify-center font-black">
                          Verso
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-1">
                    <label className="flex flex-col gap-2">
                      <span className="font-bold">CIN recto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setCinRectoFile(
                            e.target.files && e.target.files[0] ? e.target.files[0] : null
                          )
                        }
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="font-bold">CIN verso</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setCinVersoFile(
                            e.target.files && e.target.files[0] ? e.target.files[0] : null
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={docsSubmitting}
                className="h-12 font-black text-lg border-2 border-black bg-white hover:bg-zinc-100 disabled:opacity-50"
              >
                {docsSubmitting ? "Uploading..." : "Upload CIN"}
              </button>
            </form>

            {/* Permi */}
            <form onSubmit={onUploadPermi} className="flex flex-col gap-4">
              <div className="border-t-4 border-black pt-4 mt-2">
                <div className="font-black text-xl mb-2">Permi</div>

                <div className="flex items-start gap-4">
                  <div className="flex gap-3">
                    <div className="w-24">
                      {initial.permi_recto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={vehicleImageUrl(initial.permi_recto)}
                          alt="Permi recto"
                          className="w-24 h-24 object-cover border-2 border-black"
                        />
                      ) : (
                        <div className="w-24 h-24 border-2 border-black flex items-center justify-center font-black">
                          Recto
                        </div>
                      )}
                    </div>
                    <div className="w-24">
                      {initial.permi_verso ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={vehicleImageUrl(initial.permi_verso)}
                          alt="Permi verso"
                          className="w-24 h-24 object-cover border-2 border-black"
                        />
                      ) : (
                        <div className="w-24 h-24 border-2 border-black flex items-center justify-center font-black">
                          Verso
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-1">
                    <label className="flex flex-col gap-2">
                      <span className="font-bold">Permi recto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setPermiRectoFile(
                            e.target.files && e.target.files[0] ? e.target.files[0] : null
                          )
                        }
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="font-bold">Permi verso</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setPermiVersoFile(
                            e.target.files && e.target.files[0] ? e.target.files[0] : null
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={docsSubmitting}
                className="h-12 font-black text-lg border-2 border-black bg-white hover:bg-zinc-100 disabled:opacity-50"
              >
                {docsSubmitting ? "Uploading..." : "Upload Permi"}
              </button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => router.push("/vehicles")}
                  className="underline font-bold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => refreshUser()}
                  className="underline font-bold"
                >
                  Refresh
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
