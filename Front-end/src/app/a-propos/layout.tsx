import ClientLayout from "@/components/ClientLayout";

export default function AProposLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
