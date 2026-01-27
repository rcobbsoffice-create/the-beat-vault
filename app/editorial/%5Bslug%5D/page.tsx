'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { Share2, Bookmark, MessageSquare } from 'lucide-react';
import { magazineService, Article } from '@/lib/supabase/magazine';
import Link from 'next/link';

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) return;
      try {
        const data = await magazineService.getArticleBySlug(slug);
        if (data) {
          setArticle({
            ...data,
            author: data.profiles?.display_name || 'Staff',
            date: new Date(data.published_at || data.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          });
        }
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-2xl font-black uppercase tracking-widest animate-pulse">Loading Story...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black uppercase mb-4">Story Not Found</h1>
          <Link href="/editorial" className="text-primary font-bold uppercase tracking-widest underline">Back to Journal</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Header />
      
      <main className="flex-1 pb-24">
        {/* Article Header */}
        <header className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-6 block"
          >
            {article.category}
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-8"
          >
            {article.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl sm:text-2xl text-gray-500 font-medium mb-12 leading-relaxed italic"
          >
            {article.excerpt}
          </motion.p>
          
          <div className="flex items-center justify-center gap-8 border-y border-black/10 py-6">
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Written By</p>
              <p className="text-sm font-black uppercase">{article.author}</p>
            </div>
            <div className="w-px h-8 bg-black/10" />
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Date Published</p>
              <p className="text-sm font-black uppercase">{article.date}</p>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {article.image_url && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
            <div className="aspect-[21/9] bg-gray-100 overflow-hidden rounded-sm">
              <img 
                src={article.image_url} 
                className="w-full h-full object-cover"
                alt={article.title}
              />
            </div>
          </div>
        )}

        {/* Article Body */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg prose-gray max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:font-medium prose-p:leading-relaxed prose-p:text-gray-700">
            {article.content ? (
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            ) : (
              <p className="text-gray-400 italic">No content available for this article.</p>
            )}
          </div>

          {/* Social Interactions */}
          <div className="mt-24 pt-12 border-t border-black/10 flex items-center justify-between">
            <div className="flex gap-4">
              <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">
                <Bookmark className="w-4 h-4" /> Save
              </button>
            </div>
            <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">
              <MessageSquare className="w-4 h-4" /> Comments
            </button>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
