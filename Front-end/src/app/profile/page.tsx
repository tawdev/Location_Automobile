"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/authContext";
import { profileImageUrl, vehicleImageUrl } from "@/lib/media";
import { addCin, addPermi, updateProfileName, updateProfilePicture, updateProfilePassword } from "@/lib/profileApi";
import { Shield, FileText, Upload, CheckCircle, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";

function UploadZone({
  label, file, existingUrl, onChange, hasImage,
}: {
  label: string; file: File | null; existingUrl?: string | null;
  onChange: (f: File | null) => void; hasImage?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  return (
    <label
      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors h-36
        ${dragging ? "border-[#395886] bg-[#eef2fb]" : "border-gray-300 bg-gray-50 hover:border-[#638ECB] hover:bg-[#f5f7fd]"}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onChange(f); }}
    >
      <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      {existingUrl && hasImage ? (
        <>
          <img src={existingUrl} alt={label} className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-40" />
          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="w-10 h-10 bg-[#395886] rounded-full flex items-center justify-center"><Upload className="w-5 h-5 text-white" /></div>
            <span className="text-sm font-semibold text-[#395886]">{label}</span>
            <span className="text-xs text-gray-500">JPG, PNG or PDF (Max 5MB)</span>
          </div>
        </>
      ) : file ? (
        <div className="flex flex-col items-center gap-1">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <span className="text-xs font-semibold text-gray-700 text-center px-2 truncate max-w-full">{file.name}</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"><Upload className="w-5 h-5 text-gray-400" /></div>
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          <span className="text-xs text-gray-400">JPG, PNG or PDF (Max 5MB)</span>
        </div>
      )}
    </label>
  );
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const initial = useMemo(() => ({
    name: user?.name ?? "",
    email: user?.email ?? "",
    profile_pic: user?.profile_pic ?? null,
    cin_recto: user?.cin_recto ?? null,
    cin_verso: user?.cin_verso ?? null,
    permi_recto: user?.permi_recto ?? null,
    permi_verso: user?.permi_verso ?? null,
  }), [user]);

  // ── state ──
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && initial.name) {
      setName(initial.name);
      setEmail(initial.email);
      initialized.current = true;
    }
  }, [initial.name, initial.email]);

  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmePassword, setConfirmePassword] = useState("");

  const [basicSubmitting, setBasicSubmitting] = useState(false);
  const [basicError, setBasicError] = useState<string | null>(null);
  const [basicSuccess, setBasicSuccess] = useState<string | null>(null);

  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  const [cinRectoFile, setCinRectoFile] = useState<File | null>(null);
  const [cinVersoFile, setCinVersoFile] = useState<File | null>(null);
  const [permiRectoFile, setPermiRectoFile] = useState<File | null>(null);
  const [permiVersoFile, setPermiVersoFile] = useState<File | null>(null);

  const [docsSubmitting, setDocsSubmitting] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [docsSuccess, setDocsSuccess] = useState<string | null>(null);

  // ── handlers ──
  async function onUpdateBasic(e: React.FormEvent) {
    e.preventDefault();
    setBasicSubmitting(true);
    setBasicError(null);
    setBasicSuccess(null);
    try {
      await updateProfileName(name.trim());
      if (profilePicFile) {
        await updateProfilePicture(profilePicFile);
      }
      setBasicSuccess("Profile updated successfully.");
      setProfilePicFile(null);
      await refreshUser();
    } catch (err) {
      setBasicError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setBasicSubmitting(false);
    }
  }

  async function onUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwSubmitting(true);
    setPwError(null);
    setPwSuccess(null);
    try {
      await updateProfilePassword({
        old_password: currentPassword,
        new_password: newPassword,
        confirme_password: confirmePassword,
      });
      setPwSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmePassword("");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setPwSubmitting(false);
    }
  }

  async function onUploadPermi(e: React.FormEvent) {
    e.preventDefault();
    if (!permiRectoFile || !permiVersoFile) { setDocsError("Please select both Permi recto and Permi verso."); return; }
    setDocsSubmitting(true); setDocsError(null); setDocsSuccess(null);
    try {
      await addPermi(permiRectoFile, permiVersoFile);
      setDocsSuccess("Driver's License uploaded successfully.");
      setPermiRectoFile(null); setPermiVersoFile(null);
      await refreshUser();
    } catch (err) {
      setDocsError(err instanceof Error ? err.message : "Failed to upload");
    } finally { setDocsSubmitting(false); }
  }

  async function onUploadCin(e: React.FormEvent) {
    e.preventDefault();
    if (!cinRectoFile || !cinVersoFile) { setDocsError("Please select both CIN recto and CIN verso."); return; }
    setDocsSubmitting(true); setDocsError(null); setDocsSuccess(null);
    try {
      await addCin(cinRectoFile, cinVersoFile);
      setDocsSuccess("CIN / Passport uploaded successfully.");
      setCinRectoFile(null); setCinVersoFile(null);
      await refreshUser();
    } catch (err) {
      setDocsError(err instanceof Error ? err.message : "Failed to upload");
    } finally { setDocsSubmitting(false); }
  }

  const profilePicSrc = initial.profile_pic ? profileImageUrl(initial.profile_pic) : null;

  return (
    <RequireAuth>
      <main className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-black text-[#1a2a4a]">Profile Settings</h1>
          <p className="text-gray-500 mt-1 text-sm">Update your personal information and required documents for seamless rentals.</p>
        </motion.div>

        {/* ── Personal Details ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl border border-[#D5DEEF] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#D5DEEF] flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#395886]" />
            <h2 className="font-bold text-[#1a2a4a] text-base">Personal Details</h2>
          </div>

          <form onSubmit={onUpdateBasic} className="px-6 py-5 flex flex-col gap-5">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#D5DEEF] bg-[#eef2fb]">
                  {profilePicSrc ? (
                    <img src={profilePicSrc} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-[#638ECB]" />
                    </div>
                  )}
                </div>
                <label className="text-xs font-semibold text-[#395886] cursor-pointer hover:underline">
                  Change Photo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setProfilePicFile(e.target.files?.[0] ?? null)} />
                </label>
                {profilePicFile && <span className="text-xs text-green-600 font-medium">Selected</span>}
              </div>

              {/* Name + Email */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Full Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border border-[#D5DEEF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#638ECB] bg-white"
                    type="text"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      value={email}
                      disabled
                      className="w-full border border-[#D5DEEF] rounded-lg pl-9 pr-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                      type="email"
                    />
                  </div>
                  <p className="text-xs text-gray-400">Contact support to change your email address.</p>
                </div>
              </div>
            </div>

            {basicError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{basicError}</div>}
            {basicSuccess && <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{basicSuccess}</div>}

            <div className="flex justify-end">
              <button type="submit" disabled={basicSubmitting}
                className="bg-[#395886] hover:bg-[#2d4770] text-white text-sm font-semibold px-5 py-2 rounded-lg disabled:opacity-50 transition-colors">
                {basicSubmitting ? "Saving..." : "Save Details"}
              </button>
            </div>
          </form>

          {/* Blue Thread at Bottom */}
          <div className="h-1 bg-gradient-to-r from-[#638ECB] via-[#395886] to-[#638ECB]"></div>
        </motion.div>

        {/* ── Security ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl border border-[#D5DEEF] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#D5DEEF] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#395886]" />
            <h2 className="font-bold text-[#1a2a4a] text-base">Security</h2>
          </div>

          <form onSubmit={onUpdatePassword} className="px-6 py-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Current Password</label>
              <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter password"
                className="border border-[#D5DEEF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#638ECB] bg-white" type="password" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">New Password</label>
              <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password"
                className="border border-[#D5DEEF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#638ECB] bg-white" type="password" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Confirm New Password</label>
              <input value={confirmePassword} onChange={(e) => setConfirmePassword(e.target.value)} placeholder="Confirm new password"
                className="border border-[#D5DEEF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#638ECB] bg-white" type="password" />
            </div>

            {pwError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{pwError}</div>}
            {pwSuccess && <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{pwSuccess}</div>}

            <button type="submit" disabled={pwSubmitting}
              className="w-fit bg-[#1a2a4a] hover:bg-[#0f1c33] text-white text-sm font-semibold px-5 py-2 rounded-lg disabled:opacity-50 transition-colors">
              {pwSubmitting ? "Updating..." : "Update Password"}
            </button>
          </form>

          {/* Blue Thread at Bottom */}
          <div className="h-1 bg-gradient-to-r from-[#638ECB] via-[#395886] to-[#638ECB]"></div>
        </motion.div>

        {/* ── Required Documents ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl border border-[#D5DEEF] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#D5DEEF] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#395886]" />
              <h2 className="font-bold text-[#1a2a4a] text-base">Required Documents</h2>
            </div>
            {(initial.cin_recto && initial.permi_recto) && (
              <span className="flex items-center gap-1 text-xs font-semibold text-[#395886] bg-[#eef2fb] border border-[#638ECB] rounded-full px-3 py-1">
                <CheckCircle className="w-3.5 h-3.5" /> Verified
              </span>
            )}
          </div>

          <div className="px-6 py-5 flex flex-col gap-6">
            <p className="text-sm text-gray-500">Upload high-quality images of your documents to expedite your next booking.</p>

            {docsError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{docsError}</div>}
            {docsSuccess && <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{docsSuccess}</div>}

            {/* Driver's License */}
            <form onSubmit={onUploadPermi} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-[#1a2a4a]">
                Driver&apos;s License
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <UploadZone label="Upload Front" file={permiRectoFile}
                  existingUrl={initial.permi_recto ? vehicleImageUrl(initial.permi_recto) : null}
                  onChange={setPermiRectoFile} hasImage={!!initial.permi_recto} />
                <UploadZone label="Upload Back" file={permiVersoFile}
                  existingUrl={initial.permi_verso ? vehicleImageUrl(initial.permi_verso) : null}
                  onChange={setPermiVersoFile} hasImage={!!initial.permi_verso} />
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={docsSubmitting}
                  className="bg-[#395886] hover:bg-[#2d4770] text-white text-sm font-semibold px-5 py-2 rounded-lg disabled:opacity-50 transition-colors">
                  {docsSubmitting ? "Uploading..." : "Upload License"}
                </button>
              </div>
            </form>

            <div className="border-t border-[#D5DEEF]" />

            {/* CIN / Passport */}
            <form onSubmit={onUploadCin} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-[#1a2a4a]">CIN / Passport</h3>
              <div className="grid grid-cols-2 gap-3">
                <UploadZone label="Upload Front" file={cinRectoFile}
                  existingUrl={initial.cin_recto ? vehicleImageUrl(initial.cin_recto) : null}
                  onChange={setCinRectoFile} hasImage={!!initial.cin_recto} />
                <UploadZone label="Upload Back" file={cinVersoFile}
                  existingUrl={initial.cin_verso ? vehicleImageUrl(initial.cin_verso) : null}
                  onChange={setCinVersoFile} hasImage={!!initial.cin_verso} />
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={docsSubmitting}
                  className="bg-[#395886] hover:bg-[#2d4770] text-white text-sm font-semibold px-5 py-2 rounded-lg disabled:opacity-50 transition-colors">
                  {docsSubmitting ? "Uploading..." : "Upload CIN / Passport"}
                </button>
              </div>
            </form>
          </div>

          {/* Blue Thread at Bottom */}
          <div className="h-1 bg-gradient-to-r from-[#638ECB] via-[#395886] to-[#638ECB]"></div>
        </motion.div>

      </main>
    </RequireAuth>
  );
}