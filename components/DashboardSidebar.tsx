'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  LayoutDashboard, 
  Upload, 
  Music, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Store,
  Users,
  Shield,
  ShieldCheck,
  BrainCircuit,
  Heart,
  ShoppingBag,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { useUI } from '@/stores/ui';

interface SidebarLink {
  name: string;
  href: string;
  icon: any;
  highlight?: boolean;
}

export function DashboardSidebar() {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const { isSidebarCollapsed: isCollapsed, setSidebarCollapsed: setIsCollapsed } = useUI();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-collapse on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const links: { [key: string]: SidebarLink[] } = {
    producer: [
      { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Upload Beat', href: '/dashboard/producer/upload', icon: Upload, highlight: true },
      { name: 'My Catalog', href: '/dashboard/producer/beats', icon: Music },
      { name: 'Sales & Revenue', href: '/dashboard/producer/sales', icon: DollarSign },
      { name: 'Analytics', href: '/dashboard/producer/analytics', icon: BarChart3 },
      { name: 'Rights Shield', href: '/dashboard/settings/whitelist', icon: ShieldCheck },
      { name: 'Storefront', href: '/dashboard/producer/storefront', icon: Store },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
    artist: [
      { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { name: 'My Insights', href: '/dashboard/artist/insights', icon: BrainCircuit },
      { name: 'My Library', href: '/dashboard/artist/library', icon: ShoppingBag },
      { name: 'Music Distribution', href: '/dashboard/artist/distribution', icon: Music, highlight: true },
      { name: 'Rights Shield', href: '/dashboard/settings/whitelist', icon: ShieldCheck },
      { name: 'Favorites', href: '/dashboard/artist/favorites', icon: Heart },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
    admin: [
      { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { name: 'User Management', href: '/dashboard/admin/users', icon: Users },
      { name: 'Content Moderation', href: '/dashboard/admin/beats', icon: Shield },
      { name: 'Platform Revenue', href: '/dashboard/admin/revenue', icon: DollarSign },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ]
  };

  const role = profile?.role as keyof typeof links || 'artist';
  const currentLinks = links[role] || links.artist;

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary rounded-full shadow-2xl flex items-center justify-center text-black"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside className={`bg-dark-900 border-r border-white/5 flex flex-col fixed top-20 bottom-0 z-40 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Toggle Button (Desktop Only) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-dark-800 border border-white/10 rounded-full items-center justify-center text-gray-400 hover:text-white z-50 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* User Info */}
        <div className={`p-6 border-b border-white/5 transition-opacity ${isCollapsed ? 'opacity-0 lg:opacity-100 flex justify-center p-4' : 'opacity-100'}`}>
          <div className="flex items-center gap-3 mb-1">
            <div className={`rounded-full bg-dark-800 flex items-center justify-center text-black font-bold shrink-0 transition-all overflow-hidden relative ${
              isCollapsed ? 'w-10 h-10' : 'w-10 h-10'
            }`}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                  {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden animate-in fade-in duration-300">
                <h3 className="font-bold text-white truncate">{profile?.display_name || 'Loading...'}</h3>
                <p className="text-xs text-primary uppercase tracking-wider font-bold">{profile?.role || 'Guest'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {currentLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center rounded-xl transition-all duration-200 group ${
                  isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
                } ${
                  isActive 
                    ? 'bg-primary text-black font-bold shadow-lg shadow-primary/20' 
                    : link.highlight 
                      ? 'bg-white/5 text-white hover:bg-white/10 border border-primary/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={isCollapsed ? link.name : ''}
              >
                <link.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-black' : link.highlight ? 'text-primary' : 'text-gray-500 group-hover:text-white'}`} />
                {!isCollapsed && <span className="truncate whitespace-nowrap">{link.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/5 bg-dark-900/50">
          <Button 
            variant="ghost" 
            fullWidth 
            onClick={() => signOut()}
            className={`justify-start gap-3 text-gray-400 hover:text-red-500 hover:bg-red-500/10 ${isCollapsed ? 'px-0' : ''}`}
          >
            <LogOut className={`w-5 h-5 shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
            {!isCollapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </aside>
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
