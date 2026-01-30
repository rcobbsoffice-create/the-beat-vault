'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TrendingArticles } from '@/components/magazine/TrendingArticles';
import { magazineService, Article } from '@/lib/supabase/magazine';
import Link from 'next/link';

const EDITORIAL_CATEGORIES = ['All', 'Interviews', 'Reviews', 'News', 'Production', 'Technology'];

export default function EditorialPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      try {
        const fetched = await magazineService.getArticles(50);
        if (fetched) {
          setArticles(fetched.map((a: any) => ({
            ...a,
            author: a.profiles?.display_name || 'Staff',
            image: a.image_url,
            date: new Date(a.published_at || a.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          })));
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  const filteredArticles = activeCategory === 'All' 
    ? articles 
    : articles.filter(a => a.category === activeCategory);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24">
        {/* Magazine Masthead */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b-8 border-black pb-12 mb-12">
          <h1 className="text-[12vw] font-black uppercase tracking-tighter leading-[0.8] mb-4">
            EDITORIAL
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-bold uppercase tracking-[0.5em] text-gray-400">
              Volume 01 • Issue 01 • Winter 2026
            </p>
            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2">
              {EDITORIAL_CATEGORIES.map((cat) => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs font-black uppercase tracking-widest transition-colors ${
                    activeCategory === cat ? 'text-primary' : 'hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Content */}
        {loading ? (
          <div className="py-24 text-center font-black uppercase tracking-widest animate-pulse">
            Loading Stories...
          </div>
        ) : filteredArticles.length > 0 ? (
          <>
            <TrendingArticles articles={filteredArticles.slice(0, 4)} />
            
            {/* Grid of All Articles */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-12 border-b-2 border-black pb-4">
                The Archive
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
                {filteredArticles.slice(4).map((article) => (
                  <Link key={article.id} href={`/editorial/${article.slug}`} className="group block">
                    <div className="relative aspect-[4/5] bg-gray-100 mb-8 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        {article.category}
                      </span>
                      <h3 className="text-2xl font-black uppercase leading-tight group-hover:underline decoration-2 underline-offset-4">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-3 font-medium">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                        <span>{article.author}</span>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-400">{article.date}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="py-24 text-center font-black uppercase tracking-widest text-gray-400">
            No stories found in this category.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
