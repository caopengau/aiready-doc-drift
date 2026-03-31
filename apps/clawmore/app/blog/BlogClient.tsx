'use client';

import React from 'react';
import BlogCard from '../../components/BlogCard';
import BlogHero from '../../components/BlogHero';
import Navbar from '../../components/Navbar';
import { BLOG_POSTS, SERIES_ORDER } from '../../lib/blog-data';

interface BlogClientProps {
  apiUrl: string;
}

export default function BlogClient({ apiUrl: _apiUrl }: BlogClientProps) {
  // 1. Group posts by series
  const groupedPosts = SERIES_ORDER.reduce(
    (acc, seriesName) => {
      const posts = BLOG_POSTS.filter((p) => p.series === seriesName).sort(
        (a, b) => (a.episode || 0) - (b.episode || 0)
      );
      if (posts.length > 0) {
        acc.push({ name: seriesName, posts });
      }
      return acc;
    },
    [] as Array<{ name: string; posts: typeof BLOG_POSTS }>
  );

  // 2. Add standalone posts (those without a series)
  const standalonePosts = BLOG_POSTS.filter((p) => !p.series).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar variant="post" />
      <BlogHero />

      <section className="container mx-auto px-4 py-20 pb-40">
        {/* Render grouped series */}
        {groupedPosts.map((group) => (
          <div key={group.name} className="mb-24">
            <div className="flex items-center gap-4 mb-12">
              <h2 className="text-2xl font-black italic tracking-tighter uppercase text-cyber-blue">
                {group.name} <span className="text-white/20 ml-2">Series</span>
              </h2>
              <div className="h-px bg-white/5 flex-grow" />
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">
                {group.posts.length} Episodes
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {group.posts.map((post) => (
                <div key={post.slug} className="relative group">
                  {post.episode && (
                    <div className="absolute -top-3 -left-3 z-10 w-8 h-8 rounded-lg bg-cyber-blue flex items-center justify-center text-[10px] font-black italic text-black shadow-[0_0_15px_rgba(0,224,255,0.4)] group-hover:scale-110 transition-transform">
                      {post.episode}
                    </div>
                  )}
                  <BlogCard {...post} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Render standalone posts */}
        {standalonePosts.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-12">
              <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white/40">
                Latest <span className="text-white/20 ml-2">Updates</span>
              </h2>
              <div className="h-px bg-white/5 flex-grow" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-70 hover:opacity-100 transition-opacity">
              {standalonePosts.map((post) => (
                <BlogCard key={post.slug} {...post} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
