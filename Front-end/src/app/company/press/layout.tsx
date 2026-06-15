import ClientLayout from "@/components/ClientLayout";

export default function PressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
