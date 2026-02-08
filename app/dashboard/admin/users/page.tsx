'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Shield, 
  UserCheck, 
  UserMinus,
  ArrowUpDown,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  X,
  Plus,
  Star,
  Camera,
  Upload,
  Key
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { createAdminUser } from '@/app/actions/admin';


export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: 'artist',
    status: 'active'
  });

  // Edit User Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
    email: '',
    display_name: '',
    role: 'artist',
    status: 'active',
    bio: '',
    avatar_url: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const res = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch users');
      }

      const data = await res.json();
      setUsers(data.users);
      setStats(data.stats);
    } catch (err: any) {
      console.error('Fetch error:', err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateUser = async (userId: string, updates: any) => {
    const toastId = toast.loading('Updating user...');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(updates)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Update failed');
      }

      toast.success('User updated successfully', { id: toastId });
      fetchData(); // Refresh data
    } catch (err: any) {
      console.error('Update error:', err);
      toast.error(err.message, { id: toastId });
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading('Creating user...');

    try {
      const result = await createAdminUser(formData);

      if (!result.success) {
        throw new Error('Failed to create user');
      }

      toast.success('User created successfully', { id: toastId });
      setIsAddModalOpen(false);
      setFormData({ email: '', displayName: '', role: 'artist', status: 'active' });
      fetchData();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to send a password reset email to ${email}?`)) return;

    const toastId = toast.loading('Sending reset email...');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send reset email');
      }

      toast.success('Password reset email sent!', { id: toastId });
    } catch (err: any) {
      console.error('Reset error:', err);
      toast.error(err.message, { id: toastId });
    }
  };

  const handleEditClick = (user: any) => {
    setEditFormData({
      id: user.id,
      email: user.email,
      display_name: user.display_name || '',
      role: user.role,
      status: user.status || 'active',
      bio: user.bio || '',
      avatar_url: user.avatar_url || ''
    });
    setIsEditModalOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const toastId = toast.loading('Uploading profile picture...');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${editFormData.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setEditFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success('Image uploaded successfully', { id: toastId });
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error('Failed to upload image', { id: toastId });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await handleUpdateUser(editFormData.id, {
        display_name: editFormData.display_name,
        role: editFormData.role,
        status: editFormData.status,
        bio: editFormData.bio,
        avatar_url: editFormData.avatar_url
      });
      setIsEditModalOpen(false);
    } catch (err) {
      // Error handled in handleUpdateUser
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (isLoading && !users.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-gray-400">Loading user management...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">View and manage all registered users on the platform</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button 
            className="bg-primary text-black font-bold gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add New User
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-gray-400 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
          <p className="text-xs text-success mt-1">+{stats?.newThisWeek || 0} this week</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-400 mb-1">Producers</p>
          <p className="text-2xl font-bold text-white">{stats?.producers || 0}</p>
          <p className="text-xs text-primary mt-1">Platform Backbones</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-400 mb-1">Artists</p>
          <p className="text-2xl font-bold text-white">{stats?.artists || 0}</p>
          <p className="text-xs text-secondary mt-1">Content Consumers</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-400 mb-1">Pending Verification</p>
          <p className="text-2xl font-bold text-white">{stats?.pendingVerifications || 0}</p>
          <p className="text-xs text-warning mt-1">Producers awaiting review</p>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="overflow-hidden border-white/5 bg-dark-900/50">
        <div className="p-4 border-b border-white/5 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              placeholder="Search users by name, email..." 
              className="pl-10 bg-dark-950 border-white/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="bg-dark-950 border border-white/10 rounded-lg px-3 text-sm text-gray-300 outline-none"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="producer">Producers</option>
            <option value="artist">Artists</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Joined Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <p className="text-gray-500 italic">No users found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center font-bold text-primary border border-white/5">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            user.display_name?.charAt(0) || 'U'
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white flex items-center gap-2">
                            {user.display_name || 'Anonymous'}
                            {user.is_top_producer && (
                              <Badge className="bg-accent/10 text-accent border-accent/20 px-1 py-0 text-[10px]">
                                <Star className="w-2.5 h-2.5 fill-current mr-1" />
                                Top Producer
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={
                        user.role === 'producer' ? 'bg-primary/10 text-primary border-primary/20' : 
                        user.role === 'admin' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                        'bg-gray-800/50 text-gray-400 border-white/5'
                      }>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${
                           user.status === 'verified' ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
                           user.status === 'active' ? 'bg-primary shadow-[0_0_8px_rgba(212,175,55,0.5)]' :
                           'bg-error shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                         }`} />
                         <span className="text-sm text-gray-300 capitalize">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {user.role === 'producer' && user.status !== 'verified' && (
                          <button 
                            className="p-2 hover:bg-success/10 rounded-lg text-gray-400 hover:text-success transition-colors" 
                            title="Verify Producer"
                            onClick={() => handleUpdateUser(user.id, { status: 'verified' })}
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        {user.role === 'producer' && (
                          <button 
                            className={`p-2 rounded-lg transition-colors ${
                              user.is_top_producer 
                                ? 'bg-accent/20 text-accent hover:bg-accent/30' 
                                : 'hover:bg-accent/10 text-gray-400 hover:text-accent'
                            }`}
                            title={user.is_top_producer ? 'Remove from Top Producers' : 'Mark as Top Producer'}
                            onClick={() => handleUpdateUser(user.id, { is_top_producer: !user.is_top_producer })}
                          >
                            <Star className={`w-4 h-4 ${user.is_top_producer ? 'fill-current' : ''}`} />
                          </button>
                        )}
                        {user.status !== 'suspended' ? (
                          <button 
                            className="p-2 hover:bg-error/10 rounded-lg text-gray-400 hover:text-error transition-colors" 
                            title="Suspend User"
                            onClick={() => {
                              if (confirm(`Are you sure you want to suspend ${user.display_name}?`)) {
                                handleUpdateUser(user.id, { status: 'suspended' });
                              }
                            }}
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            className="p-2 hover:bg-success/10 rounded-lg text-gray-400 hover:text-success transition-colors" 
                            title="Activate User"
                            onClick={() => handleUpdateUser(user.id, { status: 'active' })}
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors" 
                          title="Change Role"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors" 
                          title="Reset Password"
                          onClick={() => handleResetPassword(user.id, user.email)}
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
                          onClick={() => handleEditClick(user)}
                          title="Edit User Details"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-gray-500">
          <p>Showing {filteredUsers.length} of {users.length} users</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled>Previous</Button>
            <Button variant="ghost" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-dark-900 border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">Add New User</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <Input 
                  type="email"
                  required
                  placeholder="user@example.com"
                  className="bg-dark-950 border-white/10 text-white"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Display Name</label>
                <Input 
                  placeholder="John Doe"
                  className="bg-dark-950 border-white/10 text-white"
                  value={formData.displayName}
                  onChange={e => setFormData({...formData, displayName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Role</label>
                  <select 
                    className="w-full bg-dark-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="artist">Artist</option>
                    <option value="producer">Producer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Status</label>
                  <select 
                    className="w-full bg-dark-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="verified">Verified</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary text-black font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Create User'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-dark-900 border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">Edit User Details</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-dark-800 border-2 border-white/10 flex items-center justify-center overflow-hidden">
                    {editFormData.avatar_url ? (
                      <img src={editFormData.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-3xl font-bold text-primary">
                        {editFormData.display_name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                    <Camera className="w-6 h-6 text-white" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">Click to update profile picture</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email Address (Read-only)</label>
                <Input 
                  type="email"
                  disabled
                  className="bg-dark-950 border-white/10 text-gray-400 cursor-not-allowed"
                  value={editFormData.email}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Display Name</label>
                <Input 
                  placeholder="John Doe"
                  className="bg-dark-950 border-white/10 text-white"
                  value={editFormData.display_name}
                  onChange={e => setEditFormData({...editFormData, display_name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Bio</label>
                <textarea 
                  placeholder="Tell us about this user..."
                  className="w-full bg-dark-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white min-h-[100px] outline-none focus:border-primary/50 transition-colors"
                  value={editFormData.bio}
                  onChange={e => setEditFormData({...editFormData, bio: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Role</label>
                  <select 
                    className="w-full bg-dark-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
                    value={editFormData.role}
                    onChange={e => setEditFormData({...editFormData, role: e.target.value})}
                  >
                    <option value="artist">Artist</option>
                    <option value="producer">Producer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Status</label>
                  <select 
                    className="w-full bg-dark-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
                    value={editFormData.status}
                    onChange={e => setEditFormData({...editFormData, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="verified">Verified</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary text-black font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
