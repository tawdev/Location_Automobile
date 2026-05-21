import React from "react";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <AdminLayout>{children}</AdminLayout>
    </RequireAdmin>
  );
}
