import ClientLayout from "@/components/ClientLayout";

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
