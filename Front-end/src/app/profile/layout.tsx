import { Suspense } from "react";
import ClientLayout from "@/components/ClientLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientLayout>
      <Suspense fallback={null}>{children}</Suspense>
    </ClientLayout>
  );
}
