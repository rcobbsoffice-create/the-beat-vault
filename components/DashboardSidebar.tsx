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
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SidebarLink {
  name: string;
  href: string;
  icon: any;
  highlight?: boolean;
}

export function DashboardSidebar() {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();

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

  // Default to artist if role undefined, or handle loading state
  const role = profile?.role as keyof typeof links || 'artist';
  const currentLinks = links[role] || links.artist;

  return (
    <aside className="w-64 bg-dark-900 border-r border-white/5 flex flex-col fixed top-20 bottom-0 z-40 overflow-y-auto">
      {/* User Info */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-black font-bold">
            {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-bold text-white truncate">{profile?.display_name || 'Loading...'}</h3>
            <p className="text-xs text-primary uppercase tracking-wider font-bold">{profile?.role || 'Guest'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {currentLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-primary text-black font-bold shadow-lg shadow-primary/20' 
                  : link.highlight 
                    ? 'bg-white/5 text-white hover:bg-white/10 border border-primary/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <link.icon className={`w-5 h-5 ${isActive ? 'text-black' : link.highlight ? 'text-primary' : 'text-gray-500 group-hover:text-white'}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/5">
        <Button 
          variant="ghost" 
          fullWidth 
          onClick={() => signOut()}
          className="justify-start gap-3 text-gray-400 hover:text-red-500 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
