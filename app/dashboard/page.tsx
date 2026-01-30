'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Music,
  TrendingUp,
  DollarSign,
  Users,
  Play,
  ArrowRight,
  Upload,
  Store,
  BarChart3,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const { profile, loading } = useAuth();

  const [isConnecting, setIsConnecting] = useState(false);

  const handleStripeConnect = async () => {
    try {
      setIsConnecting(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please sign in to connect Stripe');
        return;
      }

      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (data.url) {
        toast.success('Redirecting to Stripe...', { icon: '💳' });
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create Connect account');
      }
    } catch (error: any) {
      console.error('Stripe Connect error:', error);
      toast.error(error.message || 'Verification failed. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const [stats, setStats] = useState<any[]>([]);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!profile?.id || profile.role !== 'producer') {
        setIsStatsLoading(false);
        return;
      }

      try {
        // 1. Total Beats
        const { count: beatsCount } = await supabase
          .from('beats')
          .select('*', { count: 'exact', head: true })
          .eq('producer_id', profile.id);

        // 2. Total Sales (Join with beats to get producer's purchases)
        // Note: For complex joins with PostgREST, we might need a view or nested select
        const { data: producerBeats } = await supabase
          .from('beats')
          .select('id')
          .eq('producer_id', profile.id);
        
        const beatIds = producerBeats?.map((b: any) => b.id) || [];
        
        const { data: salesData } = await supabase
          .from('purchases' as any)
          .select('amount_paid')
          .in('beat_id', beatIds);
        
        const totalSalesCents = salesData?.reduce((sum: number, item: any) => sum + item.amount_paid, 0) || 0;
        const totalSalesFormatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(totalSalesCents / 100);

        // 3. Total Plays (from analytics_events)
        const { count: playsCount } = await supabase
          .from('analytics_events' as any)
          .select('*', { count: 'exact', head: true })
          .eq('event_type', 'play')
          .in('beat_id', beatIds);

        setStats([
          { label: 'Total Beats', value: beatsCount?.toString() || '0', icon: Music },
          { label: 'Total Sales', value: totalSalesFormatted, icon: DollarSign },
          { label: 'Total Plays', value: playsCount?.toString() || '0', icon: Play },
          { label: 'Followers', value: '0', icon: Users }, // Placeholder for now
        ]);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setIsStatsLoading(false);
      }
    }

    fetchStats();
  }, [profile]);

  // Redirect based on role
  const dashboardLinks = {
    artist: [
      { name: 'My Library', href: '/dashboard/artist/library', icon: Music, description: 'View purchased beats' },
      { name: 'Favorites', href: '/dashboard/artist/favorites', icon: TrendingUp, description: 'Your saved beats' },
    ],
    producer: [
      { name: 'My Beats', href: '/dashboard/producer/beats', icon: Music, description: 'Manage your catalog' },
      { name: 'Upload', href: '/dashboard/producer/upload', icon: Upload, description: 'Add new beats' },
      { name: 'Sales', href: '/dashboard/producer/sales', icon: DollarSign, description: 'View revenue' },
      { name: 'Storefront', href: '/dashboard/producer/storefront', icon: Store, description: 'Customize your store' },
      { name: 'Analytics', href: '/dashboard/producer/analytics', icon: BarChart3, description: 'Track performance' },
    ],
    admin: [
      { name: 'Users', href: '/dashboard/admin/users', icon: Users, description: 'Manage users' },
      { name: 'Upload', href: '/dashboard/producer/upload', icon: Upload, description: 'Add new beats' },
      { name: 'All Beats', href: '/dashboard/admin/beats', icon: Music, description: 'Moderate content' },
      { name: 'Revenue', href: '/dashboard/admin/revenue', icon: DollarSign, description: 'Platform revenue' },
    ],
  };

  const links = dashboardLinks[profile?.role as keyof typeof dashboardLinks] || dashboardLinks.artist;

  if (loading || isStatsLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="mb-10 relative">
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
          Welcome back, <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent italic">{profile?.display_name || 'Maestro'}</span>!
        </h1>
        <p className="text-gray-400 font-medium">
          {profile?.role === 'producer' 
            ? 'Your sonic empire is growing. Track your legacy below.'
            : 'Your library of elite sounds is ready for your next masterpiece.'
          }
        </p>
      </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    {(stat as any).change && (
                      <p className="text-xs text-success mt-1">{(stat as any).change}</p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {links.map((link, index) => (
              <Link key={index} href={link.href}>
                <Card hoverable className="p-6 h-full">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                      <link.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{link.name}</h3>
                      <p className="text-sm text-gray-400">{link.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Producer: Stripe Connect Banner */}
          {profile?.role === 'producer' && !profile.stripe_onboarding_complete && (
            <Card className="p-6 border-warning/30 bg-warning/5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-warning mb-1">Complete Payment Setup</h3>
                  <p className="text-sm text-gray-400">
                    Connect your Stripe account to receive payments for your beat sales.
                  </p>
                </div>
                <Button 
                  variant="primary" 
                  onClick={handleStripeConnect}
                  isLoading={isConnecting}
                >
                  {isConnecting ? 'Initializing...' : 'Connect Stripe'}
                </Button>
              </div>
            </Card>
          )}

          {/* Recent Activity Placeholder */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            <Card className="p-6">
              <div className="text-center py-8 text-gray-400">
                <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity yet</p>
                <p className="text-sm mt-2">
                  {profile?.role === 'producer' 
                    ? 'Upload your first beat to get started'
                    : 'Browse the marketplace to find beats'
                  }
                </p>
                <Link href={profile?.role === 'producer' ? '/dashboard/producer/upload' : '/marketplace'}>
                  <Button variant="outline" className="mt-4">
                    {profile?.role === 'producer' ? 'Upload Beat' : 'Browse Beats'}
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
    </div>
  );
}
