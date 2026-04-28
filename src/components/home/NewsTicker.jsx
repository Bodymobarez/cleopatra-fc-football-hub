import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function NewsTicker({ news = [] }) {
  const { isArabic } = useLanguage();
  const breakingNews = news.filter(n => n.is_breaking);
  if (breakingNews.length === 0) return null;

  return (
    <div className="bg-[#FFB81C] overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-[#1B2852]">
          <Zap className="w-4 h-4 text-[#FFB81C]" />
          <span className="text-[#FFB81C] font-bold text-sm uppercase whitespace-nowrap">
            {isArabic ? 'عاجل' : 'Breaking'}
          </span>
        </div>
        <div className="flex-1 overflow-hidden py-2">
          <motion.div
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="flex gap-12 whitespace-nowrap"
          >
            {breakingNews.concat(breakingNews).map((item, i) => (
              <span key={i} className="text-[#1B2852] font-medium">
                {item.title} <span className="mx-4">•</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
