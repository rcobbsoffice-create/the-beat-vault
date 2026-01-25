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
  ArrowUpDown
} from 'lucide-react';

// Demo users
const demoUsers = [
  { id: '1', name: 'Metro Boomin', email: 'metro@boomin.com', role: 'producer', status: 'verified', joined: 'Jan 12, 2024' },
  { id: '2', name: 'Rising Star', email: 'artist@rising.com', role: 'artist', status: 'active', joined: 'Jan 15, 2024' },
  { id: '3', name: 'Dark Beats', email: 'dark@beats.com', role: 'producer', status: 'active', joined: 'Jan 18, 2024' },
  { id: '4', name: 'Pop Prince', email: 'pop@prince.com', role: 'artist', status: 'suspended', joined: 'Jan 20, 2024' },
  { id: '5', name: 'Gold Chains', email: 'gold@chains.com', role: 'producer', status: 'verified', joined: 'Jan 22, 2024' },
];

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
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
          <Button className="bg-primary text-black font-bold">
            Add New User
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-gray-400 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-white">12,450</p>
          <p className="text-xs text-success mt-1">+324 this week</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-400 mb-1">Producers</p>
          <p className="text-2xl font-bold text-white">3,820</p>
          <p className="text-xs text-primary mt-1">+85 this week</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-400 mb-1">Artists</p>
          <p className="text-2xl font-bold text-white">8,630</p>
          <p className="text-xs text-secondary mt-1">+239 this week</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-400 mb-1">Pending Verification</p>
          <p className="text-2xl font-bold text-white">42</p>
          <p className="text-xs text-warning mt-1">Review required</p>
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
            />
          </div>
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
              {demoUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center font-bold text-primary">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={
                      user.role === 'producer' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary/10 text-secondary border-secondary/20'
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
                    {user.joined}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors" title="Manage Permissions">
                        <Shield className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors" title="Send Message">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-gray-500">
          <p>Showing 5 of 12,450 users</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled>Previous</Button>
            <Button variant="ghost" size="sm">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
