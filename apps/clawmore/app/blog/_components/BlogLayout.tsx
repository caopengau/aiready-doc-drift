'use client';

import { useState, ReactNode } from 'react';
import { Clock, Hash } from 'lucide-react';
import Modal from '@/components/Modal';
import LeadForm from '@/components/LeadForm';
import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import SeriesNavigation from './SeriesNavigation';

interface BlogLayoutProps {
  children: ReactNode;
  metadata: {
    title: string;
    description: string;
    date: string;
    image: string;
    slug: string;
  };
  header: {
    category: string;
    hash: string;
    readTime: string;
    title: ReactNode;
    subtitle: ReactNode;
    description: string;
    image: string;
  };
  breadcrumbItems?: Array<{ label: string; href: string }>;
}

export default function BlogLayout({
  children,
  metadata,
  header,
  breadcrumbItems = [],
}: BlogLayoutProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);
  const apiUrl = process.env.NEXT_PUBLIC_LEAD_API_URL || '';

  const BLOG_JSON_LD = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: metadata.title,
    description: metadata.description,
    datePublished: metadata.date,
    author: {
      '@type': 'Person',
      name: 'Minimalist Architect',
    },
    image: metadata.image,
    url: `/blog/${metadata.slug}`,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-cyber-purple/30 selection:text-cyber-purple font-sans uppercase">
      <JsonLd data={BLOG_JSON_LD} />
      <Navbar variant="post" />

      <header className="py-24 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.05)_0%,_transparent_70%)] opacity-30" />

        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="text-cyber-purple font-mono text-[9px] uppercase tracking-[0.4em] font-black border border-cyber-purple/20 px-2 py-1 bg-cyber-purple/5">
                {header.category}
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[9px]">
                <Hash className="w-3 h-3" />
                <span>HASH: {header.hash}</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[9px]">
                <Clock className="w-3 h-3" />
                <span>{header.readTime}</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic leading-[1.1]">
              {header.title} <br />
              <span className="opacity-50 text-4xl italic lowercase font-light tracking-normal">
                {header.subtitle}
              </span>
            </h1>

            <p className="text-xl text-zinc-200 font-light leading-relaxed italic normal-case max-w-2xl">
              {header.description}
            </p>

            <div className="mt-12 bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative group">
              <img
                src={header.image}
                alt={`${metadata.title} Cover`}
                className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            </div>
          </div>
        </div>
      </header>

      <main className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Breadcrumbs items={breadcrumbItems} />
            <article className="prose prose-invert prose-zinc max-w-none normal-case">
              {children}
              <SeriesNavigation currentSlug={metadata.slug} />
            </article>
          </div>
        </div>
      </main>

      <footer className="py-20 bg-black">
        <div className="container mx-auto px-4 text-center text-zinc-700 text-[10px] font-mono uppercase tracking-[0.5em]">
          TERMINAL_LOCKED // 2026 MUTATION_LOG
        </div>
      </footer>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <LeadForm type="waitlist" onSuccess={closeModal} apiUrl={apiUrl} />
      </Modal>
    </div>
  );
}
