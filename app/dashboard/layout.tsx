
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { Header } from '@/components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark-950">
      <Header />
      <div className="flex pt-20">
        <DashboardSidebar />
        <main className="flex-1 ml-64 min-h-[calc(100vh-80px)] p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
