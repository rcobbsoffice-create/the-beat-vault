'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { Header } from '@/components/Header';
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
} from 'lucide-react';

export default function DashboardPage() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
      { name: 'All Beats', href: '/dashboard/admin/beats', icon: Music, description: 'Moderate content' },
      { name: 'Revenue', href: '/dashboard/admin/revenue', icon: DollarSign, description: 'Platform revenue' },
    ],
  };

  const links = dashboardLinks[profile?.role as keyof typeof dashboardLinks] || dashboardLinks.artist;

  // Demo stats
  const stats = profile?.role === 'producer' ? [
    { label: 'Total Beats', value: '24', icon: Music, change: '+3 this week' },
    { label: 'Total Sales', value: '$4,280', icon: DollarSign, change: '+$620 this month' },
    { label: 'Total Plays', value: '12.4K', icon: Play, change: '+1.2K this week' },
    { label: 'Followers', value: '892', icon: Users, change: '+45 this month' },
  ] : [
    { label: 'Licensed Beats', value: '8', icon: Music },
    { label: 'Total Spent', value: '$380', icon: DollarSign },
    { label: 'Favorites', value: '24', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {profile?.display_name || 'User'}!
            </h1>
            <p className="text-gray-400">
              {profile?.role === 'producer' 
                ? 'Manage your beats and track your sales'
                : 'Access your licensed beats and favorites'
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
                    {stat.change && (
                      <p className="text-xs text-success mt-1">{stat.change}</p>
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
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
                <Button variant="primary">
                  Connect Stripe
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
      </main>
    </div>
  );
}
