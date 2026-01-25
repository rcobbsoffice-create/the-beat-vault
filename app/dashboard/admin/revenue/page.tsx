'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';

export default function AdminRevenuePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Platform Revenue</h1>
          <p className="text-gray-400">Financial overview and commission tracking</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </Button>
          <Button className="bg-primary text-black font-bold gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 bg-gradient-to-br from-dark-800 to-dark-950 border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-success/10 text-success">
              <DollarSign className="w-6 h-6" />
            </div>
            <Badge className="bg-success/20 text-success border-none">+12.5%</Badge>
          </div>
          <p className="text-sm text-gray-500 uppercase tracking-wider font-bold">Gross Volume</p>
          <p className="text-4xl font-black text-white mt-1">$428,950.40</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <TrendingUp className="w-3 h-3 text-success" />
            <span>Up from $381,240 last month</span>
          </div>
        </Card>

        <Card className="p-8 bg-gradient-to-br from-dark-800 to-dark-950 border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <Activity className="w-6 h-6" />
            </div>
            <Badge className="bg-primary/20 text-primary border-none">15% Fee</Badge>
          </div>
          <p className="text-sm text-gray-500 uppercase tracking-wider font-bold">Platform Earnings</p>
          <p className="text-4xl font-black text-white mt-1">$64,342.56</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <ArrowUpRight className="w-3 h-3 text-primary" />
            <span>Net profit after processing</span>
          </div>
        </Card>

        <Card className="p-8 bg-gradient-to-br from-dark-800 to-dark-950 border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-secondary/10 text-secondary">
              <BarChart3 className="w-6 h-6" />
            </div>
            <Badge className="bg-white/5 text-gray-400 border-none">Daily Avg</Badge>
          </div>
          <p className="text-sm text-gray-500 uppercase tracking-wider font-bold">Average Transaction</p>
          <p className="text-4xl font-black text-white mt-1">$42.50</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <ArrowDownRight className="w-3 h-3 text-error" />
            <span>Down 2% from last week</span>
          </div>
        </Card>
      </div>

      {/* Transaction History Placeholder */}
      <Card className="p-12 text-center border-dashed border-white/10 bg-transparent">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-gray-600" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Detailed Reports</h2>
        <p className="text-gray-500 max-w-sm mx-auto">
          Transaction history and detailed breakdown are being calculated. Check back in a few minutes for real-time data.
        </p>
      </Card>
    </div>
  );
}
