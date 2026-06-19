import ClientLayout from "@/components/ClientLayout";

export default function ReservationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
