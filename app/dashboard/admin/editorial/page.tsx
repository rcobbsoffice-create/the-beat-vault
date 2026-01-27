'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Layout, Type, Image as ImageIcon, CheckCircle, Save, X, Loader2 } from 'lucide-react';
import { magazineService, Article } from '@/lib/supabase/magazine';
import { supabase } from '@/lib/supabase/client';

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
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving article.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userRole !== 'admin' && userRole !== 'editor') {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">Access Denied</h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-8">This station is for authorized staff only.</p>
        <Button onClick={() => window.location.href = '/'}>Return to Surface</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      {!isWriting ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter italic">Control Room / Editorial</h1>
              <p className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-xs">Manage your magazine content</p>
            </div>
              <Button onClick={() => { resetForm(); setIsWriting(true); }} className="gap-2 font-bold uppercase tracking-widest bg-primary text-black hover:opacity-90">
                <Plus className="w-4 h-4" /> Write New Story
              </Button>
            </div>

          {loading ? (
            <div className="py-24 text-center font-black uppercase tracking-widest animate-pulse text-gray-500">
              Syncing contents...
            </div>
          ) : (
            <div className="bg-dark-900/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 bg-white/5 flex gap-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 w-1/2">Story Title</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 w-1/4">Status</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 w-1/4">Last Modified</p>
              </div>
              <div className="divide-y divide-white/5">
                {articles.map((article) => (
                  <div key={article.id} className="p-8 flex gap-8 items-center hover:bg-white/5 transition-all cursor-pointer group">
                    <div className="w-1/2">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{article.title}</h3>
                      <p className="text-xs text-gray-500 font-medium mt-1">{article.category}</p>
                    </div>
                    <div className="w-1/4">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                        article.status === 'published' ? 'bg-success/20 text-success' : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {article.status}
                      </span>
                    </div>
                    <div className="w-1/4 flex items-center justify-between">
                      <p className="text-sm text-gray-500 font-medium">
                        {new Date(article.published_at || article.created_at).toLocaleDateString()}
                      </p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
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
                        className="text-xs font-black uppercase text-gray-400 hover:text-primary transition-colors border-b border-white/5 pb-1 px-2"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {articles.length === 0 && (
                <div className="p-24 text-center border-t border-white/5">
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No articles created yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center justify-between mb-12">
            <button 
              onClick={() => { resetForm(); setIsWriting(false); }}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg"
              disabled={saving}
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="gap-2 font-bold uppercase tracking-widest border-white/10 hover:bg-white/5"
                onClick={() => handleSave('draft')}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Draft
              </Button>
              <Button 
                className="gap-2 font-bold uppercase tracking-widest bg-primary text-black hover:opacity-90"
                onClick={() => handleSave('published')}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Publish
              </Button>
            </div>
          </div>

          <div className="space-y-12">
            <input 
              type="text" 
              placeholder="Story Title..."
              className="w-full bg-dark-900/50 border border-white/10 rounded-2xl px-6 py-8 text-4xl sm:text-6xl font-black uppercase tracking-tighter placeholder:text-dark-700 focus:ring-1 focus:ring-primary focus:border-primary transition-all italic"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12 border-y border-white/5">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Category</label>
                <select 
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                  className="w-full bg-dark-900 border border-white/20 rounded-2xl p-4 text-white font-bold focus:border-primary transition-all hover:bg-dark-800"
                >
                  <option>Production</option>
                  <option>Interviews</option>
                  <option>Reviews</option>
                  <option>Technology</option>
                  <option>Culture</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Image URL</label>
                <input 
                  type="text" 
                  value={form.imageUrl}
                  onChange={(e) => setForm({...form, imageUrl: e.target.value})}
                  className="w-full bg-dark-900 border border-white/20 rounded-2xl p-4 text-white font-bold focus:border-primary transition-all hover:bg-dark-800"
                  placeholder="Unsplash / Cloudinary link"
                />
              </div>
            </div>

            <textarea 
              placeholder="Subtitle / Excerpt..."
              className="w-full bg-dark-900/30 border border-white/10 rounded-2xl p-6 text-xl font-bold text-gray-400 placeholder:text-dark-700 focus:ring-1 focus:ring-primary focus:border-primary transition-all italic"
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm({...form, excerpt: e.target.value})}
            />

            <textarea 
              placeholder="Start writing the next big headline..."
              className="w-full h-96 bg-dark-900/30 border border-white/10 rounded-2xl p-8 text-xl font-medium text-gray-400 placeholder:text-dark-700 focus:ring-1 focus:ring-primary focus:border-primary transition-all leading-relaxed"
              value={form.content}
              onChange={(e) => setForm({...form, content: e.target.value})}
            />
          </div>
        </div>
      )}
    </div>
  );
}
