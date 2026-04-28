import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, ChevronRight, Eye, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageContext';

export default function FeaturedVideo({ videos = [] }) {
  const { isArabic } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState(null);

  if (videos.length === 0) return null;

  const mainVideo  = videos[0];
  const sideVideos = videos.slice(1, 4);

  return (
    <section className="py-16 bg-[#1B2852]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-10 bg-[#FFB81C] rounded-full" />
            <h2 className="text-3xl font-black text-white">
              {isArabic ? 'الفيديوهات المميزة' : 'Featured Videos'}
            </h2>
          </div>
          <Link
            to={createPageUrl('Media')}
            className="flex items-center gap-2 text-[#FFB81C] font-medium hover:gap-3 transition-all"
          >
            {isArabic ? 'عرض الكل' : 'View All'} <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div
              className="relative rounded-2xl overflow-hidden cursor-pointer group h-[400px]"
              onClick={() => setSelectedVideo(mainVideo)}
            >
              <img
                src={mainVideo.thumbnail || 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800'}
                alt={mainVideo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <motion.div className="absolute inset-0 flex items-center justify-center" whileHover={{ scale: 1.1 }}>
                <div className="w-20 h-20 rounded-full bg-[#FFB81C] flex items-center justify-center shadow-lg shadow-[#FFB81C]/30">
                  <Play className="w-8 h-8 text-[#1B2852] fill-current ml-1" />
                </div>
              </motion.div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="inline-block px-3 py-1 bg-[#FFB81C] text-[#1B2852] text-xs font-bold rounded-full mb-3">
                  {mainVideo.type?.replace(/_/g, ' ').toUpperCase() || (isArabic ? 'فيديو' : 'VIDEO')}
                </span>
                <h3 className="text-2xl font-bold text-white mb-2">{mainVideo.title}</h3>
                <div className="flex items-center gap-4 text-white/60 text-sm">
                  {mainVideo.duration && (
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{mainVideo.duration}</span>
                  )}
                  {mainVideo.views > 0 && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {mainVideo.views.toLocaleString()} {isArabic ? 'مشاهدة' : 'views'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            {sideVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative rounded-xl overflow-hidden cursor-pointer group h-[120px]"
                onClick={() => setSelectedVideo(video)}
              >
                <img
                  src={video.thumbnail || 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400'}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                <div className="absolute inset-0 flex items-center p-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-4 group-hover:bg-[#FFB81C] transition-colors">
                    <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold line-clamp-2 text-sm">{video.title}</h4>
                    {video.duration && <span className="text-white/50 text-xs">{video.duration}</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setSelectedVideo(null)} className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors">
                <X className="w-8 h-8" />
              </button>
              <div className="aspect-video bg-black rounded-xl overflow-hidden">
                {selectedVideo.url ? (
                  <iframe src={selectedVideo.url} className="w-full h-full" allowFullScreen title={selectedVideo.title} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50">
                    {isArabic ? 'الفيديو غير متاح' : 'Video unavailable'}
                  </div>
                )}
              </div>
              <h3 className="text-white font-bold text-xl mt-4">{selectedVideo.title}</h3>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
