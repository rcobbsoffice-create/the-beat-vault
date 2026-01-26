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
  Plus
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const res = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create user');
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
                          <p className="font-medium text-white">{user.display_name || 'Anonymous'}</p>
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
                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors" title="Change Role">
                          <Shield className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
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
    </div>
  );
}
