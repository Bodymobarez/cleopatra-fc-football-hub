import React, { useState } from 'react';
import { ceramicaCleopatra } from '@/api/ceramicaCleopatraClient';
import { useQuery } from '@tanstack/react-query';
import { ensureArray } from '@/utils';
import { motion } from 'framer-motion';
import { Play, Image, Film, ExternalLink } from 'lucide-react';

const TABS = [
  { id: 'all',    label: 'All' },
  { id: 'video',  label: 'Videos' },
  { id: 'image',  label: 'Photos' },
];

export default function Media() {
  const [activeTab, setActiveTab] = useState('all');

  const { data: media = [], isLoading } = useQuery({
    queryKey: ['media', activeTab],
    queryFn: () =>
      activeTab === 'all'
        ? ceramicaCleopatra.entities.Media.list('-created_date', 50)
        : ceramicaCleopatra.entities.Media.filter({ type: activeTab }, '-created_date', 50),
    select: ensureArray,
  });

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#1B2852] to-[#C8102E]/30" />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-[#FFB81C]/20 border border-[#FFB81C]/30 rounded-full px-4 py-1 mb-6">
              <Film className="w-4 h-4 text-[#FFB81C]" />
              <span className="text-[#FFB81C] text-sm font-semibold">MEDIA CENTER</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4">
              Photos & <span className="text-[#FFB81C]">Videos</span>
            </h1>
            <p className="text-white/60 text-lg">
              The best moments from Ceramica Cleopatra FC
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-20 z-30 bg-gray-950/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#FFB81C] text-[#FFB81C]'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-video bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-24">
              <Film className="w-20 h-20 text-white/20 mx-auto mb-6" />
              <p className="text-white/40 text-xl">No media content yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {media.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-[#FFB81C]/50 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video overflow-hidden bg-gray-900">
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title || ''}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {item.type === 'video'
                          ? <Film className="w-12 h-12 text-white/20" />
                          : <Image className="w-12 h-12 text-white/20" />}
                      </div>
                    )}
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-[#FFB81C] rounded-full flex items-center justify-center shadow-2xl">
                          <Play className="w-8 h-8 text-[#1B2852] ml-1" fill="currentColor" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-white font-semibold text-sm line-clamp-2">
                        {item.title || 'Untitled'}
                      </h3>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#FFB81C] hover:opacity-80 shrink-0 mt-0.5"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                      item.type === 'video'
                        ? 'bg-[#FFB81C]/20 text-[#FFB81C]'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {item.type === 'video' ? '▶ Video' : '📷 Photo'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
