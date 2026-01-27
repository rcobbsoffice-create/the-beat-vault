'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Music, 
  Plus, 
  Globe, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Search
} from 'lucide-react';

export default function DistributionDashboard() {
  const [releases] = useState([
    {
      id: '1',
      title: 'Neon Nights',
      artist: 'AudioGenes Artist',
      status: 'live',
      releaseDate: '2026-01-15',
      isrc: 'US-TF1-26-00001',
      upc: '190000000001',
      artwork: null
    },
    {
      id: '2',
      title: 'Midnight Shadows',
      artist: 'AudioGenes Artist',
      status: 'processing',
      releaseDate: '2026-02-01',
      isrc: 'US-TF1-26-00002',
      upc: '190000000002',
      artwork: null
    }
  ]);

  const statusIcons = {
    draft: <Clock className="w-4 h-4 text-gray-400" />,
    pending: <Clock className="w-4 h-4 text-warning" />,
    processing: <Globe className="w-4 h-4 text-primary animate-pulse" />,
    live: <CheckCircle2 className="w-4 h-4 text-success" />,
    rejected: <AlertCircle className="w-4 h-4 text-error" />
  };

  const statusLabels = {
    draft: 'Draft',
    pending: 'Pending Review',
    processing: 'Distributing',
    live: 'Live on DSPs',
    rejected: 'Action Required'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Music Distribution</h1>
          <p className="text-gray-400">Manage your releases and distribution to global DSPs</p>
        </div>
        <Link href="/dashboard/artist/distribution/new">
          <Button className="gap-2 bg-primary text-black font-bold">
            <Plus className="w-5 h-5" />
            New Release
          </Button>
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-white/5 bg-dark-900/50">
          <p className="text-sm text-gray-400 font-medium mb-1">Total Releases</p>
          <p className="text-2xl font-bold text-white">{releases.length}</p>
        </Card>
        <Card className="p-6 border-white/5 bg-dark-900/50">
          <p className="text-sm text-gray-400 font-medium mb-1">Live on DSPs</p>
          <p className="text-2xl font-bold text-success">{releases.filter(r => r.status === 'live').length}</p>
        </Card>
        <Card className="p-6 border-white/5 bg-dark-900/50">
          <p className="text-sm text-gray-400 font-medium mb-1">Est. Marketplace Reach</p>
          <p className="text-2xl font-bold text-primary">150+ Platforms</p>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search releases..." 
            className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <Button variant="outline">Filter Status</Button>
      </div>

      {/* Release List */}
      <div className="space-y-4">
        {releases.length > 0 ? (
          releases.map((release) => (
            <Card key={release.id} className="p-4 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-lg bg-dark-800 flex items-center justify-center relative overflow-hidden shrink-0">
                  <Music className="w-8 h-8 text-gray-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-white truncate">{release.title}</h3>
                    <Badge 
                      variant={(release.status === 'live' ? 'success' : release.status === 'processing' ? 'primary' : 'default') as any}
                      className="gap-1.5"
                    >
                      {statusIcons[release.status as keyof typeof statusIcons]}
                      {statusLabels[release.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {release.releaseDate}</span>
                    <span className="font-mono">{release.isrc}</span>
                    <span className="font-mono">{release.upc}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Edit Metadata
                  </Button>
                  {release.status === 'live' && (
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="w-3 h-3" />
                      View Links
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-2xl">
            <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Releases Yet</h3>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">
              Start distributing your music to Spotify, Apple Music, and 150+ other platforms for free.
            </p>
            <Link href="/dashboard/artist/distribution/new">
              <Button className="bg-primary text-black font-bold">Create Your First Release</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
