'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  BarChart3, 
  TrendingUp, 
  Globe, 
  DollarSign, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingDown,
  Activity,
  Zap,
  Target
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

// DSP Multipliers (Hypothetical average payouts per stream)
const DSP_PAYOUTS = {
  Spotify: 0.004,
  AppleMusic: 0.008,
  Tidal: 0.012,
  Amazon: 0.005,
  Youtube: 0.001
};

export default function AdvancedAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [totalStreams, setTotalStreams] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Mocking high-frequency data for the "Advanced" feel
      const { data: dData, error } = await supabase
        .from('distribution_data')
        .select('*');

      if (error) throw error;
      
      const mockData = dData || [
        { dsp: 'Spotify', stream_count: 1250000, revenue_usd: 5000 },
        { dsp: 'AppleMusic', stream_count: 850000, revenue_usd: 6800 },
        { dsp: 'Tidal', stream_count: 120000, revenue_usd: 1440 },
        { dsp: 'Youtube', stream_count: 5000000, revenue_usd: 5000 },
      ];

      setData(mockData);
      setTotalStreams(mockData.reduce((acc, curr) => acc + curr.stream_count, 0));
      setTotalRevenue(mockData.reduce((acc, curr) => acc + curr.revenue_usd, 0));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Intelligence / Analytics</h1>
          <p className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-xs italic">Real-time distribution and financial synthesis</p>
        </div>

        <div className="flex gap-4">
           <Button 
             variant="outline" 
             className="border-white/10 text-gray-400 font-bold uppercase tracking-widest text-[10px] h-14 px-8"
             onClick={fetchAnalytics}
           >
             <RefreshCw className="w-4 h-4 mr-2" /> Re-Sync DSP Flow
           </Button>
           <Button className="bg-primary text-black font-black uppercase tracking-widest h-14 px-8 rounded-2xl shadow-xl shadow-primary/10">
             Export Financial Dossier
           </Button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
         {[
           { label: 'Global Streams', value: totalStreams.toLocaleString(), sub: '+12% vs last month', icon: Activity, color: 'text-primary' },
           { label: 'Platform Revenue', value: `$${totalRevenue.toLocaleString()}`, sub: 'Estimated Real-time', icon: DollarSign, color: 'text-success' },
           { label: 'Active DSPs', value: '18', sub: 'Worldwide Distribution', icon: Globe, color: 'text-blue-400' },
           { label: 'Conversion Rate', value: '3.4%', sub: 'Streams to Purchases', icon: Target, color: 'text-purple-400' },
         ].map((stat, i) => (
           <Card key={i} className="p-8 bg-dark-900/50 backdrop-blur-xl border-white/5 group hover:border-primary/20 transition-all">
              <div className="flex items-center justify-between mb-6">
                 <div className={`p-3 bg-white/5 rounded-xl border border-white/10 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                 </div>
                 <ArrowUpRight className="w-4 h-4 text-success opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black italic tracking-tighter">{stat.value}</h3>
              <p className={`text-[10px] font-bold mt-2 ${stat.color}`}>{stat.sub}</p>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* DSP Breakdown */}
        <div className="lg:col-span-2 space-y-8">
           <Card className="p-8 bg-dark-900/50 backdrop-blur-2xl border-white/5">
              <div className="flex items-center justify-between mb-12">
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter">DSP Performance Flow</h2>
                 <div className="flex gap-2">
                    <Badge className="bg-primary/20 text-primary border-none">Streams</Badge>
                    <Badge className="bg-success/20 text-success border-none">Revenue</Badge>
                 </div>
              </div>

              <div className="space-y-10">
                 {data.map((dsp, i) => (
                   <div key={i} className="space-y-4">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <span className="text-sm font-black italic uppercase tracking-widest">{dsp.dsp}</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{dsp.stream_count.toLocaleString()} Streams</span>
                         </div>
                         <span className="text-sm font-black italic text-success">+${dsp.revenue_usd}</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-primary shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all duration-1000"
                           style={{ width: `${(dsp.stream_count / (totalStreams / 2)) * 100}%` }}
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 border-primary/20 bg-primary/5">
                 <h4 className="text-sm font-black uppercase italic tracking-widest text-primary mb-2 flex items-center gap-2">
                   <Zap className="w-4 h-4" /> Optimization Insight
                 </h4>
                 <p className="text-xs text-gray-400 font-medium leading-relaxed">
                   Your tracks are trending in <strong>Brazil</strong> and <strong>Nigeria</strong>. Consider increasing marketing spend in these regions to maximize high-yield streaming.
                 </p>
              </Card>
              <Card className="p-8 border-success/20 bg-success/5">
                 <h4 className="text-sm font-black uppercase italic tracking-widest text-success mb-2 flex items-center gap-2">
                   <TrendingUp className="w-4 h-4" /> Growth Path
                 </h4>
                 <p className="text-xs text-gray-400 font-medium leading-relaxed">
                   Average payout per stream has increased by <strong>0.0002%</strong> this week due to a shift in audience toward premium subscription listeners.
                 </p>
              </Card>
           </div>
        </div>

        {/* Sidebar: Geographic / Tech Breakdown */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="p-8 bg-dark-900/50 backdrop-blur-xl border-white/5">
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-8">Top Territories</h3>
              <div className="space-y-6">
                 {[
                   { country: 'United States', code: 'US', share: '45%' },
                   { country: 'United Kingdom', code: 'UK', share: '12%' },
                   { country: 'Brazil', code: 'BR', share: '9%' },
                   { country: 'Germany', code: 'DE', share: '7%' },
                   { country: 'France', code: 'FR', share: '5%' },
                 ].map((c, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <span className="w-8 h-6 bg-white/5 rounded border border-white/5 flex items-center justify-center text-[10px] font-bold">{c.code}</span>
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{c.country}</span>
                      </div>
                      <span className="text-sm font-black italic">{c.share}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="p-8 bg-dark-900/50 backdrop-blur-xl border-white/5 text-center space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Total Playtime Volume</p>
              <h3 className="text-4xl font-black italic tracking-tighter uppercase">582<span className="text-primary text-xl">HRS</span></h3>
              <p className="text-[10px] font-bold text-primary italic uppercase tracking-widest">Active Listening Hours</p>
           </Card>
        </div>
      </div>
    </div>
  );
}
