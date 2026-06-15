import ClientLayout from "@/components/ClientLayout";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
