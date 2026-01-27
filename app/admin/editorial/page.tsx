'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Plus, Layout, Type, Image as ImageIcon, CheckCircle, Save, X, Loader2 } from 'lucide-react';
import { magazineService, Article } from '@/lib/supabase/magazine';
import { supabase } from '@/lib/supabase/client';

export default function AdminEditorialPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);
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
    // ... same saving logic ...
    setSaving(true);
    try {
      const slug = form.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('articles')
        .insert({
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
        });

      if (error) throw error;
      
      setIsWriting(false);
      fetchArticles();
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving article.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userRole !== 'admin' && userRole !== 'editor') {
    return (
      <div className="min-h-screen bg-dark-950 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">Access Denied</h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-8">This station is for authorized staff only.</p>
        <Button onClick={() => window.location.href = '/'}>Return to Surface</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        {!isWriting ? (
          <>
            <div className="flex items-center justify-between mb-12">
              <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter italic">Control Room / Editorial</h1>
                <p className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-xs">Manage your magazine content</p>
              </div>
              <Button onClick={() => setIsWriting(true)} className="gap-2 font-bold uppercase tracking-widest">
                <Plus className="w-4 h-4" /> Write New Story
              </Button>
            </div>

            {loading ? (
              <div className="py-24 text-center font-black uppercase tracking-widest animate-pulse">
                Syncing contents...
              </div>
            ) : (
              <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-dark-800 bg-dark-800/50 flex gap-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 w-1/2">Story Title</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 w-1/4">Status</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 w-1/4">Last Modified</p>
                </div>
                {articles.map((article) => (
                  <div key={article.id} className="p-6 border-b border-dark-800 flex gap-8 items-center hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="w-1/2">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{article.title}</h3>
                    </div>
                    <div className="w-1/4">
                      <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded ${
                        article.status === 'published' ? 'bg-success/20 text-success' : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {article.status}
                      </span>
                    </div>
                    <div className="w-1/4 flex items-center justify-between">
                      <p className="text-sm text-gray-500 font-medium">
                        {new Date(article.published_at || article.created_at).toLocaleDateString()}
                      </p>
                      <button className="text-xs font-black uppercase text-gray-600 hover:text-white transition-colors">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <button 
                onClick={() => setIsWriting(false)}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                disabled={saving}
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="gap-2 font-bold uppercase tracking-widest"
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Draft
                </Button>
                <Button 
                  className="gap-2 font-bold uppercase tracking-widest"
                  onClick={() => handleSave('published')}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Publish
                </Button>
              </div>
            </div>

            <div className="space-y-8">
              <input 
                type="text" 
                placeholder="Story Title..."
                className="w-full bg-transparent border-none text-5xl sm:text-7xl font-black uppercase tracking-tighter placeholder:text-dark-700 focus:ring-0"
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-dark-800">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Category</label>
                  <select 
                    value={form.category}
                    onChange={(e) => setForm({...form, category: e.target.value})}
                    className="w-full bg-black border-dark-800 rounded-lg p-3 text-white font-bold"
                  >
                    <option>Production</option>
                    <option>Interviews</option>
                    <option>Reviews</option>
                    <option>Technology</option>
                    <option>Culture</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Image URL</label>
                  <input 
                    type="text" 
                    value={form.imageUrl}
                    onChange={(e) => setForm({...form, imageUrl: e.target.value})}
                    className="w-full bg-black border-dark-800 rounded-lg p-3 text-white font-bold"
                    placeholder="Unsplash / Cloudinary link"
                  />
                </div>
              </div>

              <textarea 
                placeholder="Subtitle / Excerpt..."
                className="w-full bg-transparent border-none text-xl font-bold text-gray-400 placeholder:text-dark-700 focus:ring-0 italic"
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm({...form, excerpt: e.target.value})}
              />

              <textarea 
                placeholder="Start writing the next big headline..."
                className="w-full h-96 bg-transparent border-none text-xl font-medium text-gray-400 placeholder:text-dark-700 focus:ring-0 leading-relaxed"
                value={form.content}
                onChange={(e) => setForm({...form, content: e.target.value})}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
