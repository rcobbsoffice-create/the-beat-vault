'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Music,
  DollarSign,
  Play,
  TrendingUp,
  Upload,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
} from 'lucide-react';

// Demo data
const demoBeats = [
  { 
    id: '1', 
    title: 'Midnight Dreams', 
    genre: 'Trap', 
    bpm: 140, 
    status: 'published', 
    plays: 1250, 
    sales: 8, 
    revenue: 239.92,
    created: '2026-01-15'
  },
  { 
    id: '2', 
    title: 'Street Anthem', 
    genre: 'Drill', 
    bpm: 145, 
    status: 'published', 
    plays: 890, 
    sales: 5, 
    revenue: 174.95,
    created: '2026-01-10'
  },
  { 
    id: '3', 
    title: 'Summer Vibes', 
    genre: 'R&B', 
    bpm: 85, 
    status: 'draft', 
    plays: 0, 
    sales: 0, 
    revenue: 0,
    created: '2026-01-20'
  },
];

export default function ProducerBeatsPage() {
  const [beats] = useState(demoBeats);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filteredBeats = beats.filter(beat => 
    beat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = beats.reduce((acc, beat) => acc + beat.revenue, 0);
  const totalPlays = beats.reduce((acc, beat) => acc + beat.plays, 0);
  const totalSales = beats.reduce((acc, beat) => acc + beat.sales, 0);

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Beats</h1>
              <p className="text-gray-400">Manage your beat catalog</p>
            </div>
            <Link href="/dashboard/producer/upload">
              <Button className="gap-2">
                <Upload className="w-4 h-4" />
                Upload New Beat
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Beats</p>
                  <p className="text-xl font-bold text-white">{beats.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Revenue</p>
                  <p className="text-xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Play className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Plays</p>
                  <p className="text-xl font-bold text-white">{totalPlays.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Sales</p>
                  <p className="text-xl font-bold text-white">{totalSales}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search beats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>

          {/* Beats Table */}
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-dark-800">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Beat</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Plays</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Sales</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Revenue</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {filteredBeats.map((beat) => (
                  <tr key={beat.id} className="hover:bg-dark-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                          <Music className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{beat.title}</p>
                          <p className="text-sm text-gray-400">{beat.genre} • {beat.bpm} BPM</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={beat.status === 'published' ? 'success' : 'default'}>
                        {beat.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-white">{beat.plays.toLocaleString()}</td>
                    <td className="py-4 px-6 text-white">{beat.sales}</td>
                    <td className="py-4 px-6 text-success font-medium">${beat.revenue.toFixed(2)}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setOpenMenu(openMenu === beat.id ? null : beat.id)}
                          className="p-2 hover:bg-dark-700 rounded-lg"
                        >
                          <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </button>
                        {openMenu === beat.id && (
                          <div className="absolute right-0 mt-2 w-40 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-10">
                            <Link href={`/beats/${beat.id}`}>
                              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-dark-700">
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                            </Link>
                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-dark-700">
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-dark-700">
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredBeats.length === 0 && (
              <div className="text-center py-12">
                <Music className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No beats found</p>
                <Link href="/dashboard/producer/upload">
                  <Button variant="outline" className="mt-4">
                    Upload Your First Beat
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
