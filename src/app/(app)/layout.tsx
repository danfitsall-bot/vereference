import { Sidebar } from "@/components/sidebar";

export const dynamic = "force-dynamic";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      <Sidebar />
      <div className="pl-60 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
