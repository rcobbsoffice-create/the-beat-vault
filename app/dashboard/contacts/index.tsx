import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Users, 
  Search, 
  Plus, 
  Mail,
  MapPin,
  Tag,
  MoreVertical,
  Trash2,
  Upload
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'expo-router';
import Papa from 'papaparse';

interface Contact {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  source: 'manual' | 'gmail' | 'csv';
  geolocation: any;
  metadata: any;
  tags: string[];
  created_at: string;
}

export default function ContactsPage() {
  const { profile } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const fileInputRef = useRef<any>(null);

  useEffect(() => {
    fetchContacts();
  }, [profile]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    const performDelete = async () => {
      try {
        const { error } = await supabase
          .from('contacts')
          .delete()
          .eq('id', contactId);

        if (error) throw error;
        fetchContacts();
      } catch (err: any) {
        console.error('Delete error:', err);
        if (Platform.OS !== 'web') {
          Alert.alert('Error', `Failed to delete contact: ${err.message}`);
        } else {
          alert(`Failed to delete contact: ${err.message}`);
        }
      }
    };

    if (Platform.OS !== 'web') {
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this contact?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete }
        ]
      );
    } else {
      if (confirm('Are you sure you want to delete this contact?')) {
        performDelete();
      }
    }
  };

  const handleImportCSV = () => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    } else {
      Alert.alert('Coming Soon', 'CSV Import is being optimized for native mobile.');
    }
  };

  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const { data } = results;
        if (data.length === 0) {
          if (Platform.OS === 'web') alert('No data found in CSV');
          return;
        }

        setLoading(true);
        try {
          const contactsToInsert = data.map((row: any) => ({
            email: row.email || row.Email || row.EMAIL || '',
            first_name: row.first_name || row.FirstName || row['First Name'] || null,
            last_name: row.last_name || row.LastName || row['Last Name'] || null,
            phone: row.phone || row.Phone || null,
            source: 'csv' as const,
            owner_id: profile?.id,
            tags: row.tags ? String(row.tags).split(',').map((t: string) => t.trim()) : [],
          })).filter(c => c.email);

          if (contactsToInsert.length === 0) {
            throw new Error('No valid contacts with email addresses found.');
          }

          const { error } = await supabase.from('contacts').insert(contactsToInsert);
          if (error) throw error;

          if (Platform.OS === 'web') alert(`Successfully imported ${contactsToInsert.length} contacts!`);
          fetchContacts();
        } catch (err: any) {
          console.error('Import Error:', err);
          if (Platform.OS === 'web') alert(`Import failed: ${err.message}`);
        } finally {
          setLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      }
    });
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.last_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = selectedFilter === 'all' || contact.source === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: contacts.length,
    manual: contacts.filter(c => c.source === 'manual').length,
    gmail: contacts.filter(c => c.source === 'gmail').length,
    csv: contacts.filter(c => c.source === 'csv').length,
  };

  return (
    <ScrollView className="flex-1 bg-dark-950 px-4 py-8">
      {/* Header */}
      <View className="flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <View>
          <Text className="text-3xl font-bold text-white mb-2">Contacts</Text>
          <Text className="text-gray-400">Manage your audience and customer relationships</Text>
        </View>
        <View className="flex-row gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onPress={handleImportCSV}
          >
            <View className="flex-row items-center gap-2">
              <Upload size={16} color="#005CB9" />
              <Text className="text-primary font-bold text-xs uppercase">Import CSV</Text>
            </View>
          </Button>
          <Button 
            size="sm" 
            className="bg-primary"
            onPress={() => {
               router.push('/dashboard/contacts/new');
            }}
          >
            <View className="flex-row items-center gap-2">
              <Plus size={16} color="#000" />
              <Text className="text-black font-bold text-xs uppercase">Add Contact</Text>
            </View>
          </Button>
        </View>
      </View>

      {Platform.OS === 'web' && (
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".csv"
          onChange={handleFileChange}
        />
      )}

      {/* Stats Cards */}
      <View className="flex-row flex-wrap gap-4 mb-8">
        <Card className="flex-1 min-w-[150px] p-4 bg-dark-900 border-white/5">
          <Text className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Total Contacts</Text>
          <Text className="text-2xl font-bold text-white">{stats.total}</Text>
        </Card>
        <Card className="flex-1 min-w-[150px] p-4 bg-dark-900 border-white/5">
          <Text className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Manual</Text>
          <Text className="text-2xl font-bold text-primary">{stats.manual}</Text>
        </Card>
        <Card className="flex-1 min-w-[150px] p-4 bg-dark-900 border-white/5">
          <Text className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Gmail Sync</Text>
          <Text className="text-2xl font-bold text-blue-500">{stats.gmail}</Text>
        </Card>
        <Card className="flex-1 min-w-[150px] p-4 bg-dark-900 border-white/5">
          <Text className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">CSV Import</Text>
          <Text className="text-2xl font-bold text-green-500">{stats.csv}</Text>
        </Card>
      </View>

      {/* Search & Filter */}
      <View className="flex-col md:flex-row gap-4 mb-6">
        <View className="flex-1 flex-row items-center bg-dark-900 border border-white/10 rounded-xl px-4 py-3">
          <Search size={20} color="#6B7280" />
          <TextInput
            placeholder="Search contacts..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-white"
          />
        </View>
        <View className="flex-row gap-2">
          {['all', 'manual', 'gmail', 'csv'].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              className={`px-4 py-3 rounded-xl border ${
                selectedFilter === filter 
                  ? 'bg-primary border-primary' 
                  : 'bg-dark-900 border-white/10'
              }`}
            >
              <Text className={`text-xs font-bold uppercase ${
                selectedFilter === filter ? 'text-black' : 'text-gray-400'
              }`}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Contacts List */}
      <View className="space-y-4">
        {loading ? (
          <View className="py-8 items-center">
            <Text className="text-gray-400">Loading contacts...</Text>
          </View>
        ) : filteredContacts.length === 0 ? (
          <Card className="p-8 bg-dark-900 border-white/5 items-center">
            <Users size={48} color="#374151" />
            <Text className="text-white font-bold text-lg mt-4">No contacts found</Text>
            <Text className="text-gray-400 text-sm text-center mt-2">
              {searchQuery ? 'Try a different search term' : 'Add your first contact to get started'}
            </Text>
          </Card>
        ) : (
          filteredContacts.map((contact) => (
            <Card key={contact.id} className="p-4 bg-dark-900 border-white/5">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center gap-3 mb-2">
                    <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                      <Text className="text-primary font-bold text-sm">
                        {(contact.first_name?.[0] || contact.email[0]).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-base">
                        {contact.first_name && contact.last_name 
                          ? `${contact.first_name} ${contact.last_name}`
                          : contact.email}
                      </Text>
                      {(contact.first_name || contact.last_name) && (
                        <View className="flex-row items-center gap-1 mt-0.5">
                          <Mail size={12} color="#6B7280" />
                          <Text className="text-gray-400 text-xs">{contact.email}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View className="flex-row flex-wrap items-center gap-2 mt-2">
                    <Badge variant="outline" className="bg-white/5">
                      <Text className="text-[10px] text-gray-400 uppercase">{contact.source}</Text>
                    </Badge>
                    {contact.tags && contact.tags.length > 0 && contact.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="bg-primary/10 border-primary/20">
                        <Text className="text-[10px] text-primary uppercase">{tag}</Text>
                      </Badge>
                    ))}
                    <Text className="text-[10px] text-gray-600 ml-auto">
                      Added {new Date(contact.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={() => handleDeleteContact(contact.id)}
                  className="ml-4 p-2 rounded-lg bg-red-500/10"
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </View>

      <View className="h-20" />
    </ScrollView>
  );
}
