'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  Music,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
} from 'lucide-react';

// Demo admin stats
const stats = [
  { label: 'Total Users', value: '12,450', icon: Users, change: '+324 this week', trend: 'up' },
  { label: 'Total Beats', value: '8,920', icon: Music, change: '+156 this week', trend: 'up' },
  { label: 'Gross Revenue', value: '$89,420', icon: DollarSign, change: '+$12,350 this month', trend: 'up' },
  { label: 'Platform Fees', value: '$13,413', icon: TrendingUp, change: '15% of gross', trend: 'up' },
];

const recentActivity = [
  { type: 'purchase', message: 'New purchase: "Midnight Dreams" by Metro Vibes', time: '2 min ago' },
  { type: 'signup', message: 'New producer signup: DJ Soundwave', time: '15 min ago' },
  { type: 'upload', message: 'New beat uploaded: "Street Kings" by Dark Sound', time: '32 min ago' },
  { type: 'purchase', message: 'New exclusive purchase: "$1,499.99 sale', time: '1 hour ago' },
  { type: 'report', message: 'Content flagged for review: Beat ID #4521', time: '2 hours ago' },
];

const pendingModerations = [
  { id: '1', title: 'Beat Sample Check', type: 'Copyright', status: 'pending' },
  { id: '2', title: 'User Report', type: 'Inappropriate', status: 'pending' },
];

export default function AdminDashboardPage() {
  return (
  return (
    <div className="space-y-8">
      {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Platform overview and management</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-success mt-1">{stat.change}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                  <button className="text-sm text-primary hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 pb-4 border-b border-dark-700 last:border-0 last:pb-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'purchase' ? 'bg-success/10' :
                        activity.type === 'signup' ? 'bg-primary/10' :
                        activity.type === 'upload' ? 'bg-secondary/10' :
                        'bg-warning/10'
                      }`}>
                        {activity.type === 'purchase' && <DollarSign className="w-4 h-4 text-success" />}
                        {activity.type === 'signup' && <Users className="w-4 h-4 text-primary" />}
                        {activity.type === 'upload' && <Music className="w-4 h-4 text-secondary" />}
                        {activity.type === 'report' && <AlertTriangle className="w-4 h-4 text-warning" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{activity.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Pending Moderation */}
            <div>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Pending Review</h2>
                  <Badge variant="warning">{pendingModerations.length}</Badge>
                </div>
                
                {pendingModerations.length > 0 ? (
                  <div className="space-y-4">
                    {pendingModerations.map((item) => (
                      <div key={item.id} className="p-4 bg-dark-800 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-white">{item.title}</p>
                          <Clock className="w-4 h-4 text-warning" />
                        </div>
                        <Badge variant="default">{item.type}</Badge>
                        <div className="flex gap-2 mt-3">
                          <button className="flex-1 py-1.5 text-sm bg-success/10 text-success rounded hover:bg-success/20 transition-colors flex items-center justify-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Approve
                          </button>
                          <button className="flex-1 py-1.5 text-sm bg-error/10 text-error rounded hover:bg-error/20 transition-colors">
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No pending reviews</p>
                  </div>
                )}
              </Card>

              {/* Quick Stats */}
              <Card className="p-6 mt-6">
                <h2 className="text-lg font-semibold text-white mb-4">Platform Health</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Uptime</span>
                    <span className="text-sm text-success font-medium">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Active Users (24h)</span>
                    <span className="text-sm text-white font-medium">1,245</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Conversion Rate</span>
                    <span className="text-sm text-white font-medium">3.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Avg. Order Value</span>
                    <span className="text-sm text-white font-medium">$42.50</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
    </div>
  );
}
