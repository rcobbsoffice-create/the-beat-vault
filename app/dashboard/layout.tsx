'use client';

import { DashboardSidebar } from '@/components/DashboardSidebar';
import { Header } from '@/components/Header';
import { useUI } from '@/stores/ui';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarCollapsed } = useUI();

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />
      <div className="flex pt-20">
        <DashboardSidebar />
        <main className={`flex-1 transition-all duration-300 min-h-[calc(100vh-80px)] p-8 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
}
