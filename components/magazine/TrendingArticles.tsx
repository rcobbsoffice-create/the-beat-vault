'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  category: string;
  image: string;
  date: string;
}

interface TrendingArticlesProps {
  articles: Article[];
}

export function TrendingArticles({ articles }: TrendingArticlesProps) {
  return (
    <section className="py-24 bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12 border-b-2 border-black pb-4">
          <h2 className="text-4xl font-black uppercase tracking-tighter">Trending Stories</h2>
          <Link href="/editorial" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">
            View All News →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Article (Featured) */}
          <div className="lg:col-span-7">
            {articles[0] && (
              <Link href={`/editorial/${articles[0].slug}`} className="group block">
                <div className="relative aspect-[16/9] overflow-hidden mb-6">
                  <Image
                    src={articles[0].image}
                    alt={articles[0].title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">
                      {articles[0].category}
                    </span>
                  </div>
                </div>
                <h3 className="text-3xl sm:text-4xl font-black mb-4 leading-tight group-hover:underline decoration-4 underline-offset-4">
                  {articles[0].title}
                </h3>
                <p className="text-lg text-gray-600 mb-4 line-clamp-2">
                  {articles[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest">
                  <span>By {articles[0].author}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">{articles[0].date}</span>
                </div>
              </Link>
            )}
          </div>

          {/* List of Other Trending Articles */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {articles.slice(1, 4).map((article, index) => (
              <Link key={article.id} href={`/editorial/${article.slug}`} className="group flex gap-6 items-start">
                <span className="text-4xl font-black text-gray-200 group-hover:text-primary transition-colors italic">
                  0{index + 2}
                </span>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
                    {article.category}
                  </div>
                  <h4 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors leading-tight">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <span>{article.author}</span>
                    <span>•</span>
                    <span>{article.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
