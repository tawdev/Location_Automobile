import ClientLayout from "@/components/ClientLayout";

export default function PressDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
