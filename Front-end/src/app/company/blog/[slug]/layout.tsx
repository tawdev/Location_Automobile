import ClientLayout from "@/components/ClientLayout";

export default function BlogDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
