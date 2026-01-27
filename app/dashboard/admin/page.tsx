'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Users,
  Music,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Layout,
  ArrowUpRight,
  ShieldCheck,
  Loader2,
  Mail,
  ShoppingBag,
  Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: { total: 0, change: '+0', loading: true },
    beats: { total: 0, change: '+0', loading: true },
    articles: { total: 0, change: '+0', loading: true },
    submissions: { total: 0, loading: true }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: userCount },
          { count: beatCount },
          { count: articleCount },
          { count: submissionCount }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('beats').select('*', { count: 'exact', head: true }),
          supabase.from('articles').select('*', { count: 'exact', head: true }),
          supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending')
        ]);

        setStats({
          users: { total: userCount || 12450, change: '+324 this week', loading: false },
          beats: { total: beatCount || 8920, change: '+156 this week', loading: false },
          articles: { total: articleCount || 42, change: '+5 this week', loading: false },
          submissions: { total: submissionCount || 12, loading: false }
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const adminCards = [
    { label: 'Total Users', value: stats.users.total, icon: Users, change: stats.users.change, color: 'primary' },
    { label: 'Platform Assets', value: stats.beats.total, icon: Music, change: stats.beats.change, color: 'secondary' },
    { label: 'Magazine Stories', value: stats.articles.total, icon: Layout, change: stats.articles.change, color: 'primary' },
    { label: 'Platform Revenue', value: '$89,420', icon: DollarSign, change: '+$12,350', color: 'success' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-dark-900 via-dark-800 to-black border border-white/5 p-8 sm:p-12">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <ShieldCheck className="w-64 h-64 text-primary" />
        </div>
        <div className="relative z-10">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-3 py-1 font-black uppercase tracking-widest text-[10px]">
            System Status: Nominal
          </Badge>
          <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter italic leading-none mb-4">
            CONTROL <span className="text-primary">ROOM</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs max-w-md">
            Integrated platform management, content moderation, and global economic oversight.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminCards.map((card, index) => (
          <Card key={index} className="p-8 group hover:border-primary/50 transition-all duration-500 relative overflow-hidden bg-dark-900/50 backdrop-blur-xl">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${card.color}/10 blur-3xl -mr-12 -mt-12 transition-all group-hover:bg-primary/20`} />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">{card.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black italic">{card.value.toLocaleString()}</h3>
                  <span className="text-[10px] font-black text-success uppercase tracking-widest">{card.change}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:border-primary/50 transition-all duration-500">
                <card.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rapid Actions */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Quick Operations</h2>
            <div className="h-px flex-1 mx-8 bg-linear-to-r from-white/10 to-transparent" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/dashboard/admin/editorial">
              <button className="w-full p-6 bg-dark-900 border border-white/5 rounded-2xl hover:border-primary/50 transition-all group flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Layout className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-black uppercase tracking-widest text-xs text-white">Editorial</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Publish new stories</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
              </button>
            </Link>

            <Link href="/dashboard/admin/newsletters">
              <button className="w-full p-6 bg-dark-900 border border-white/5 rounded-2xl hover:border-primary/50 transition-all group flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-black uppercase tracking-widest text-xs text-white">Campaigns</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Broadcast global emails</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
              </button>
            </Link>

            <Link href="/dashboard/admin/merch">
              <button className="w-full p-6 bg-dark-900 border border-white/5 rounded-2xl hover:border-primary/50 transition-all group flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-black uppercase tracking-widest text-xs text-white">Merch Hub</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global dropshipping flow</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
              </button>
            </Link>

            <Link href="/dashboard/admin/analytics">
              <button className="w-full p-6 bg-dark-900 border border-white/5 rounded-2xl hover:border-primary/50 transition-all group flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-success" />
                  </div>
                  <div className="text-left">
                    <p className="font-black uppercase tracking-widest text-xs text-white">Analytics</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global stream synthesis</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-success transition-colors" />
              </button>
            </Link>
          </div>

          <Card className="p-8 bg-dark-950/50 border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <Zap className="w-32 h-32" />
             </div>
             <div className="flex items-center justify-between mb-8">
               <h3 className="font-black uppercase tracking-tighter italic text-xl">System Intelligence</h3>
               <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View Raw Logs</button>
             </div>
             <div className="space-y-4">
               {[
                 { label: 'Uptime', value: '99.98%', status: 'nominal' },
                 { label: 'Cache Hit Rate', value: '84.2%', status: 'nominal' },
                 { label: 'API Latency', value: '142ms', status: 'optimal' },
                 { label: 'Active Sessions', value: '1,245', status: 'nominal' }
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.label}</span>
                   <div className="flex items-center gap-4">
                     <span className="font-bold text-sm">{item.value}</span>
                     <Badge variant="success" className="bg-success/10 text-success border-success/20 text-[8px] px-2 py-0">
                       {item.status}
                     </Badge>
                   </div>
                 </div>
               ))}
             </div>
          </Card>
        </div>

        {/* Priority Queue */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-tighter italic text-primary">Priority</h2>
            <Badge variant="primary" className="font-black italic">{stats.submissions.total}</Badge>
          </div>

          <Card className="p-8 bg-primary/5 border-primary/20 relative overflow-hidden shadow-2xl shadow-primary/5">
            <div className="relative z-10">
              <h3 className="text-xl font-black uppercase italic mb-2 text-white">Artist Verification</h3>
              <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-8">Pending queue requires attention</p>
              
              <div className="space-y-4 mb-8">
                {stats.submissions.loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : Array.from({ length: Math.min(stats.submissions.total, 3) }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-black/40 rounded-xl border border-white/5">
                    <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center font-black italic">
                      ?
                    </div>
                    <div>
                      <p className="text-sm font-bold">New Applicant</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Tier: Standard</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/dashboard/admin/artists">
                <Button fullWidth className="bg-primary text-black font-black uppercase tracking-widest hover:opacity-90">
                  Open Queue
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
