'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  Globe,
  Camera,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function DashboardSettingsPage() {
  const { profile } = useAuth();

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-gray-400">Manage your profile information and preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Card */}
        <Card className="p-8 border-white/5 bg-dark-900/50">
           <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative">
                 <div className="w-32 h-32 rounded-3xl bg-dark-800 flex items-center justify-center border-2 border-white/5">
                    <User className="w-16 h-16 text-gray-700" />
                 </div>
                 <button className="absolute -bottom-2 -right-2 p-3 bg-primary rounded-2xl shadow-lg border-4 border-dark-950 hover:scale-110 transition-transform">
                   <Camera className="w-4 h-4 text-black" />
                 </button>
              </div>

              <div className="flex-1 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Input label="Display Name" defaultValue={profile?.display_name || ''} className="bg-dark-950 border-white/10" />
                   <Input label="Email Address" defaultValue={profile?.email || ''} disabled className="bg-dark-800 border-white/10 opacity-50" />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Bio</label>
                   <textarea className="border-white/10 w-full bg-dark-950 rounded-xl p-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]" 
                      defaultValue={profile?.bio || 'Professional music creator passionate about high-quality sound.'}
                   />
                 </div>
              </div>
           </div>
        </Card>

        {/* Account Details */}
        <Card className="p-8 border-white/5 bg-dark-900/50">
           <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-lg">
              <Mail className="w-5 h-5 text-primary" />
              Account Verification
           </h3>
           <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <Input label="New Email Address" placeholder="Enter new email..." className="bg-dark-950 border-white/10" />
                    <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold tracking-widest">A confirmation link will be sent</p>
                 </div>
                 <div className="flex items-end">
                    <Button variant="outline" className="h-11">Update Email</Button>
                 </div>
              </div>
           </div>
        </Card>

        {/* Security / Password */}
        <Card className="p-8 border-white/5 bg-dark-900/50">
           <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-lg">
              <Lock className="w-5 h-5 text-primary" />
              Security & Password
           </h3>
           <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Input type="password" label="Current Password" placeholder="••••••••" className="bg-dark-950 border-white/10" />
                 <Input type="password" label="New Password" placeholder="••••••••" className="bg-dark-950 border-white/10" />
              </div>
              <div className="flex justify-end">
                 <Button variant="outline" className="h-11 px-8">Update Password</Button>
              </div>
           </div>
        </Card>

        {/* Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card className="p-6 border-white/5 bg-dark-900/30">
              <div className="flex items-center gap-3 mb-6">
                 <Bell className="w-5 h-5 text-gray-500" />
                 <h3 className="font-bold text-white">Notifications</h3>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-gray-400">Transaction Emails</span>
                   <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer shadow-lg shadow-primary/10">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-black rounded-full" />
                   </div>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-gray-400">Marketing & Tips</span>
                   <div className="w-10 h-5 bg-dark-800 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-3 h-3 bg-gray-600 rounded-full" />
                   </div>
                 </div>
              </div>
           </Card>

           <Card className="p-6 border-white/5 bg-dark-900/30">
              <div className="flex items-center gap-3 mb-6">
                 <Globe className="w-5 h-5 text-gray-500" />
                 <h3 className="font-bold text-white">Regional Settings</h3>
              </div>
              <div className="space-y-4">
                 <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-500 font-bold uppercase tracking-widest">Currency Display</label>
                    <select className="w-full bg-dark-950 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary">
                       <option>USD ($)</option>
                       <option>EUR (€)</option>
                       <option>GBP (£)</option>
                    </select>
                 </div>
              </div>
           </Card>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-8 border-t border-white/5">
           <Button variant="ghost" className="text-error hover:bg-error/10">Deactivate Account</Button>
           <Button className="bg-primary text-black font-black px-12 h-14 rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform">
              Save All Changes
           </Button>
        </div>
      </div>
    </div>
  );
}
