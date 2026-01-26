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
  CreditCard,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

export default function DashboardSettingsPage() {
  const { profile, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Security State
  const [newEmail, setNewEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setPreviewUrl(profile.avatar_url || null);
    }
  }, [profile]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const toastId = toast.loading('Uploading profile picture...');
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setPreviewUrl(data.avatarUrl);
        toast.success('Profile picture updated!', { id: toastId });
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error(error.message || 'Failed to upload image', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const toastId = toast.loading('Saving changes...');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, bio }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Settings saved successfully!', { id: toastId });
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (error: any) {
      console.error('Save settings error:', error);
      toast.error(error.message || 'Error saving changes', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail) {
      toast.error('Please enter a new email address');
      return;
    }

    setIsUpdatingEmail(true);
    const toastId = toast.loading('Sending verification link...');

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;

      toast.success('Confirmation link sent! Please check both your old and new email addresses.', { id: toastId, duration: 6000 });
      setNewEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update email', { id: toastId });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsUpdatingPassword(true);
    const toastId = toast.loading('Updating password...');

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast.success('Password updated successfully!', { id: toastId });
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password', { id: toastId });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

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
                 <div className="w-32 h-32 rounded-3xl bg-dark-800 flex items-center justify-center border-2 border-white/5 overflow-hidden relative">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-gray-700" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                    )}
                 </div>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleFileChange} 
                   className="hidden" 
                   accept="image/*"
                 />
                 <button 
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="absolute -bottom-2 -right-2 p-3 bg-primary rounded-2xl shadow-lg border-4 border-dark-950 hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed z-10"
                 >
                   <Camera className="w-4 h-4 text-black" />
                 </button>
              </div>

              <div className="flex-1 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Input 
                     label="Display Name" 
                     value={displayName} 
                     onChange={(e) => setDisplayName(e.target.value)}
                     className="bg-dark-950 border-white/10" 
                   />
                   <Input label="Email Address" defaultValue={profile?.email || ''} disabled className="bg-dark-800 border-white/10 opacity-50" />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Bio</label>
                   <textarea 
                    className="border-white/10 w-full bg-dark-950 rounded-xl p-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]" 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell the world about your sound..."
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
                    <Input 
                      label="New Email Address" 
                      placeholder="Enter new email..." 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="bg-dark-950 border-white/10" 
                    />
                    <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold tracking-widest">A confirmation link will be sent</p>
                 </div>
                 <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      className="h-11"
                      onClick={handleUpdateEmail}
                      isLoading={isUpdatingEmail}
                    >
                      Update Email
                    </Button>
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
                 <Input 
                   type="password" 
                   label="Current Password" 
                   placeholder="••••••••" 
                   value={currentPassword}
                   onChange={(e) => setCurrentPassword(e.target.value)}
                   className="bg-dark-950 border-white/10" 
                 />
                 <Input 
                   type="password" 
                   label="New Password" 
                   placeholder="••••••••" 
                   value={newPassword}
                   onChange={(e) => setNewPassword(e.target.value)}
                   className="bg-dark-950 border-white/10" 
                 />
              </div>
              <div className="flex justify-end">
                 <Button 
                   variant="outline" 
                   className="h-11 px-8"
                   onClick={handleUpdatePassword}
                   isLoading={isUpdatingPassword}
                 >
                   Update Password
                 </Button>
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
           <Button 
              onClick={handleSaveAll}
              isLoading={isSaving}
              disabled={isUploading}
              className="bg-primary text-black font-black px-12 h-14 rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform"
            >
              Save All Changes
           </Button>
        </div>
      </div>
    </div>
  );
}
