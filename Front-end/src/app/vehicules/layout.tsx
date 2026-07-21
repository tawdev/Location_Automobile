import ClientLayout from "@/components/ClientLayout";
import PageErrorBoundary from "@/components/PageErrorBoundary";

export default function VehiculesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout><PageErrorBoundary>{children}</PageErrorBoundary></ClientLayout>;
}
