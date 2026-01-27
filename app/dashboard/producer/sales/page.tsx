'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SplitTree } from '@/components/SplitTree';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Calendar,
  CreditCard,
  ShoppingBag,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProducerSalesPage() {
  const handleExport = () => {
    toast.success('Sales report exported to PDF', { icon: '📊' });
  };

  const handleDashboard = () => {
    toast('Opening Stripe Express dashboard...', { icon: '💳' });
  };

  const handleFilter = () => {
    toast('Date range selector coming soon!', { icon: '📅' });
  };
  const demoParties = [
    { name: 'Metro Vibes', role: 'Main Producer', percentage: 70, amount: '20.99', status: 'settled' as const },
    { name: 'Lyricist A', role: 'Songwriter', percentage: 15, amount: '4.50', status: 'pending' as const },
    { name: 'Drum Designer X', role: 'Sound Design', percentage: 10, amount: '3.00', status: 'pending' as const },
    { name: 'AudioGenes', role: 'Platform Fee', percentage: 5, amount: '1.50', status: 'settled' as const },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Sales & Revenue</h1>
          <p className="text-gray-400">Track your earnings and manage payout settings</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={handleFilter}>
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-white/5 bg-dark-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-success/10 text-success">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-400 font-medium">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">$4,280.50</p>
          <p className="text-xs text-success mt-1 flex items-center gap-1">
             <TrendingUp className="w-3 h-3" /> +12% from last month
          </p>
        </Card>

        <Card className="p-6 border-white/5 bg-dark-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-400 font-medium">Total Sales</span>
          </div>
          <p className="text-2xl font-bold text-white">124</p>
          <p className="text-xs text-primary mt-1">+8 new today</p>
        </Card>

        <Card className="p-6 border-white/5 bg-dark-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-400 font-medium">Pending Payout</span>
          </div>
          <p className="text-2xl font-bold text-white">$842.15</p>
          <p className="text-xs text-gray-500 mt-1">Expected: Feb 1st</p>
        </Card>

        <Card className="p-6 border-white/5 bg-dark-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-white/5 text-gray-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-sm text-gray-400 font-medium">Avg Sale Value</span>
          </div>
          <p className="text-2xl font-bold text-white">$34.50</p>
          <p className="text-xs text-gray-500 mt-1">Steady performance</p>
        </Card>
      </div>

      {/* Split Transparency Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
           <Zap className="w-5 h-5 text-primary" />
           <h2 className="text-xl font-bold text-white">Revenue Split Transparency</h2>
        </div>
        <Card className="p-8 bg-dark-900/30 border-white/5 backdrop-blur-sm">
           <SplitTree totalAmount="29.99" parties={demoParties} />
        </Card>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Sales History */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:bg-primary/10"
                onClick={handleExport}
            >
                Export Records
            </Button>
          </div>
          
          <Card className="overflow-hidden border-white/5 bg-dark-900/30 backdrop-blur-md">
             <div className="divide-y divide-white/5">
               {['Future Hendrix', 'Midnight Dreams', 'Savage Mode', 'Lo-fi Beats'].map((title, i) => (
                 <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-dark-800 flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
                        MP3
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{title}</p>
                        <p className="text-xs text-gray-500 italic">Purchased by artist_user_99</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-white">$29.99</p>
                      <p className="text-xs text-success">Completed</p>
                    </div>
                 </div>
               ))}
             </div>
          </Card>
        </div>

        {/* Payout Settings Summary */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Stripe Connectivity</h2>
          <Card className="p-6 border-primary/20 bg-primary/5">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-black">
                   <CreditCard className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="font-bold text-white">Verified Account</h3>
                   <span className="text-xs text-primary font-bold uppercase tracking-widest">Active</span>
                </div>
             </div>
             
             <p className="text-sm text-gray-400 mb-6 leading-relaxed">
               Your account is fully verified and connected to Stripe. Earnings are automatically processed every 7 days.
             </p>
             
             <Button 
                fullWidth 
                className="bg-primary text-black font-bold"
                onClick={handleDashboard}
             >
               View Stripe Dashboard
             </Button>
          </Card>
        </div>

      </div>
    </div>
  );
}
