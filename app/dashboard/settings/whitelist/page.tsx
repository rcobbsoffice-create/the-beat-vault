'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  ShieldCheck, 
  Youtube, 
  Instagram, 
  Plus, 
  Trash2, 
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Video
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function WhitelistDashboard() {
  const [handles, setHandles] = useState([
    { id: '1', platform: 'youtube', handle: '@TheBeatVaultArtist', status: 'active' },
    { id: '2', platform: 'instagram', handle: 'vault_vibes', status: 'pending' },
  ]);

  const [newHandle, setNewHandle] = useState('');
  const [newPlatform, setNewPlatform] = useState('youtube');

  const addHandle = () => {
    if (!newHandle) return;
    setHandles([...handles, { id: Date.now().toString(), platform: newPlatform, handle: newHandle, status: 'pending' }]);
    setNewHandle('');
    toast.success('Handle submitted for whitelisting!');
  };

  const removeHandle = (id: string) => {
    setHandles(handles.filter(h => h.id !== id));
    toast.success('Protection removed');
  };

  const platformIcons = {
    youtube: <Youtube className="w-5 h-5 text-red-500" />,
    instagram: <Instagram className="w-5 h-5 text-pink-500" />,
    twitch: <Video className="w-5 h-5 text-purple-500" />,
    tiktok: <Video className="w-5 h-5 text-white" />
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
          <ShieldCheck className="w-8 h-8 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Content ID Shield</h1>
          <p className="text-gray-400 text-sm">Whitelist your channels to prevent automated copyright claims on your purchases.</p>
        </div>
      </div>

      {/* Add New */}
      <Card className="p-6 bg-dark-900/40 border-white/5 backdrop-blur-xl">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-500" />
          Add Protection
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <select 
            className="bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value)}
          >
            <option value="youtube">YouTube</option>
            <option value="twitch">Twitch</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
          </select>
          <Input 
            placeholder="@yourchannel or username" 
            className="flex-1" 
            value={newHandle}
            onChange={(e) => setNewHandle(e.target.value)}
          />
          <Button onClick={addHandle} className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-8">
            Enable Shield
          </Button>
        </div>
        <p className="text-[10px] text-gray-500 mt-4 leading-relaxed flex items-start gap-2">
          <HelpCircle className="w-3 h-3 shrink-0" />
          Whitelisting ensures that The Beat Vault AI recognizes your channel as a licensed user, 
          preventing digital fingerprinting engines from flagging your content. Clearance can take up to 24-48 hours.
        </p>
      </Card>

      {/* List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2">Active Protections</h3>
        {handles.map(h => (
          <Card key={h.id} className="p-4 bg-dark-900 border-white/5 hover:border-emerald-500/20 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                {platformIcons[h.platform as keyof typeof platformIcons]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{h.handle}</span>
                  <Badge variant={h.status === 'active' ? 'success' : 'default'} className="lowercase text-[10px]">
                    {h.status}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500 capitalize">{h.platform} Protection</span>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-white">
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => removeHandle(h.id)} className="text-gray-500 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Warning */}
      <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <p className="text-xs text-gray-400 leading-relaxed">
          <strong className="text-white">Important:</strong> Whitelisting is only valid for channels you own or manage. 
          Misuse of the Content ID Shield can result in your account being flagged for rights abuse. 
          Make sure your licenses are current before publishing.
        </p>
      </div>
    </div>
  );
}
