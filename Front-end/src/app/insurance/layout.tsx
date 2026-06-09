import ClientLayout from "@/components/ClientLayout";

export default function InsuranceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
