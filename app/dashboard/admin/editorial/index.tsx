import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Layout, Type, Image as ImageIcon, CheckCircle, Save, X, Loader2 } from 'lucide-react-native';
import { magazineService, Article } from '@/lib/magazine';
import { supabase } from '@/lib/supabase';
import { Picker } from '@react-native-picker/picker';

export default function AdminEditorialPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Form State
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Production',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop'
  });

  const resetForm = () => {
    setForm({
      title: '',
      excerpt: '',
      content: '',
      category: 'Production',
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop'
    });
    setEditingId(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAuthLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserRole(profile.role);
        if (profile.role === 'admin' || profile.role === 'editor') {
          fetchArticles();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setAuthLoading(false);
    }
  }

  async function fetchArticles() {
    setLoading(true);
    try {
      const data = await magazineService.getArticles(100);
      if (data) {
        setArticles(data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (status: 'published' | 'draft') => {
    setSaving(true);
    try {
      const slug = form.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const { data: userData } = await supabase.auth.getUser();
      
      const articleData = {
        title: form.title,
        slug: slug,
        excerpt: form.excerpt,
        content: form.content,
        category: form.category,
        image_url: form.imageUrl,
        status: status,
        author_id: userData.user?.id || '00000000-0000-0000-0000-000000000000',
        published_at: status === 'published' ? new Date().toISOString() : null,
        featured: false
      };

      let error;
      if (editingId) {
        const { error: updateError } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('articles')
          .insert(articleData);
        error = insertError;
      }

      if (error) throw error;
      
      resetForm();
      setIsWriting(false);
      fetchArticles();
      Alert.alert('Success', `Article ${status === 'published' ? 'published' : 'saved as draft'}!`);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Error saving article.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <View className="flex-1 bg-dark-950 items-center justify-center">
        <ActivityIndicator size="large" color="#005CB9" />
      </View>
    );
  }

  if (userRole !== 'admin' && userRole !== 'editor') {
    return (
      <View className="flex-1 bg-dark-950 items-center justify-center p-8">
        <Text className="text-3xl font-black uppercase text-white mb-4 italic">Access Denied</Text>
        <Text className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-8 text-center">This station is for authorized staff only.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-dark-950 p-6">
      {!isWriting ? (
        <View>
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-3xl font-bold text-white mb-2">Control Room / Editorial</Text>
              <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">Manage your magazine content</Text>
            </View>
            <Button onPress={() => { resetForm(); setIsWriting(true); }} className="bg-primary flex-row gap-2">
              <Plus size={16} color="#000" />
              <Text className="text-black font-bold uppercase text-xs">Write New Story</Text>
            </Button>
          </View>

          {loading ? (
             <View className="py-20 items-center">
               <ActivityIndicator size="large" color="#005CB9" />
               <Text className="text-gray-500 mt-4 font-bold uppercase tracking-widest text-xs">Syncing contents...</Text>
             </View>
          ) : (
            <View className="bg-dark-900 border border-white/5 rounded-3xl overflow-hidden">
              <View className="p-4 border-b border-white/5 bg-white/5 flex-row gap-4">
                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex-1">Story Title</Text>
                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-500 w-20 text-center">Status</Text>
                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-500 w-24 text-right">Actions</Text>
              </View>
              {articles.map((article) => (
                <View key={article.id} className="p-4 border-b border-white/5 flex-row items-center gap-4">
                  <View className="flex-1">
                    <Text className="font-bold text-lg text-white mb-1" numberOfLines={1}>{article.title}</Text>
                    <Text className="text-xs text-gray-500 font-medium">{article.category}</Text>
                  </View>
                  <View className="w-20 items-center">
                    <Badge variant={article.status === 'published' ? 'success' : 'secondary'}>
                      <Text className="text-[10px] font-bold uppercase">{article.status}</Text>
                    </Badge>
                  </View>
                  <View className="w-24 items-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onPress={() => {
                          setForm({
                            title: article.title,
                            excerpt: article.excerpt || '',
                            content: article.content || '',
                            category: article.category,
                            imageUrl: article.image_url || ''
                          });
                          setEditingId(article.id);
                          setIsWriting(true);
                      }}
                    >
                      <Text className="text-gray-400 text-xs font-bold uppercase">Edit</Text>
                    </Button>
                  </View>
                </View>
              ))}
              {articles.length === 0 && (
                <View className="p-12 items-center">
                  <Text className="text-gray-500 font-bold uppercase tracking-widest text-xs">No articles created yet.</Text>
                </View>
              )}
            </View>
          )}
        </View>
      ) : (
        <View>
          <View className="flex-row items-center justify-between mb-8">
            <Button variant="ghost" onPress={() => { resetForm(); setIsWriting(false); }} disabled={saving} className="flex-row gap-2">
              <X size={16} color="#6B7280" />
              <Text className="text-gray-500 font-bold uppercase text-xs">Cancel</Text>
            </Button>
            <View className="flex-row gap-3">
              <Button 
                variant="outline" 
                className="flex-row gap-2 border-white/10"
                onPress={() => handleSave('draft')}
                disabled={saving}
              >
                {saving ? <ActivityIndicator size="small" color="#fff" /> : <Save size={16} color="#fff" />}
                <Text className="text-white font-bold uppercase text-xs">Save Draft</Text>
              </Button>
              <Button 
                className="bg-primary flex-row gap-2"
                onPress={() => handleSave('published')}
                disabled={saving}
              >
                {saving ? <ActivityIndicator size="small" color="#000" /> : <CheckCircle size={16} color="#000" />}
                <Text className="text-black font-bold uppercase text-xs">Publish</Text>
              </Button>
            </View>
          </View>

          <View className="gap-6">
            <TextInput 
              placeholder="Story Title..."
              placeholderTextColor="#374151"
              className="w-full bg-dark-900 border border-white/10 rounded-2xl px-6 py-4 text-2xl font-black uppercase text-white tracking-tighter"
              value={form.title}
              onChangeText={(text) => setForm({...form, title: text})}
            />
            
            <View className="flex-col md:flex-row gap-4">
              <View className="flex-1 gap-2">
                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-500">Category</Text>
                <View className="bg-dark-900 border border-white/10 rounded-xl overflow-hidden">
                   <Picker
                      selectedValue={form.category}
                      onValueChange={(itemValue) => setForm({...form, category: itemValue})}
                      style={{ color: 'white' }}
                      dropdownIconColor="white"
                    >
                      <Picker.Item label="Production" value="Production" />
                      <Picker.Item label="Interviews" value="Interviews" />
                      <Picker.Item label="Reviews" value="Reviews" />
                      <Picker.Item label="Technology" value="Technology" />
                      <Picker.Item label="Culture" value="Culture" />
                   </Picker>
                </View>
              </View>
            </View>

            <View className="gap-2">
                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-500">Image URL</Text>
                <TextInput 
                  value={form.imageUrl}
                  onChangeText={(text) => setForm({...form, imageUrl: text})}
                  className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white"
                  placeholder="https://..."
                  placeholderTextColor="#6B7280"
                />
            </View>

            <TextInput 
              placeholder="Subtitle / Excerpt..."
              placeholderTextColor="#374151"
              className="w-full bg-dark-900 border border-white/10 rounded-2xl px-6 py-4 text-lg font-bold text-gray-400 italic"
              multiline
              value={form.excerpt}
              onChangeText={(text) => setForm({...form, excerpt: text})}
            />

            <TextInput 
              placeholder="Start writing the next big headline..."
              placeholderTextColor="#374151"
              className="w-full bg-dark-900 border border-white/10 rounded-2xl px-6 py-6 text-base font-medium text-gray-300 min-h-[300px]"
              multiline
              textAlignVertical="top"
              value={form.content}
              onChangeText={(text) => setForm({...form, content: text})}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}
