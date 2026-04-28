import React, { useState } from 'react';
import { ceramicaCleopatra } from '@/api/ceramicaCleopatraClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl, ensureArray } from '@/utils';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Clock, Eye, Search, Filter, ChevronRight, Tag } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/components/LanguageContext';

const categoryColors = {
  club_news: 'bg-[#d4af37] text-[#0a1628]',
  match_report: 'bg-green-500 text-white',
  transfers: 'bg-purple-500 text-white',
  injuries: 'bg-red-500 text-white',
  analysis: 'bg-blue-500 text-white',
  global_football: 'bg-cyan-500 text-white',
};

export default function News() {
  const { t, isArabic } = useLanguage();
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = isArabic ? [
    { value: 'all',            label: 'كل الأخبار' },
    { value: 'club_news',      label: 'أخبار النادي' },
    { value: 'match_report',   label: 'تقارير المباريات' },
    { value: 'transfers',      label: 'الانتقالات' },
    { value: 'injuries',       label: 'الإصابات' },
    { value: 'analysis',       label: 'تحليل' },
    { value: 'global_football',label: 'كرة دولية' },
    { value: 'egyptian_league',label: 'الدوري المصري' },
  ] : [
    { value: 'all',            label: 'All News' },
    { value: 'club_news',      label: 'Club News' },
    { value: 'match_report',   label: 'Match Reports' },
    { value: 'transfers',      label: 'Transfers' },
    { value: 'injuries',       label: 'Injuries' },
    { value: 'analysis',       label: 'Analysis' },
    { value: 'global_football',label: 'Global Football' },
    { value: 'egyptian_league',label: 'Egyptian League' },
  ];

  const { data: news = [], isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: () => ceramicaCleopatra.entities.News.filter({ status: 'published' }, '-published_at', 50),
    select: ensureArray,
  });

  const filteredNews = news.filter(article => {
    const matchCategory = category === 'all' || article.category === category;
    const matchSearch = !searchQuery || 
      article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const featuredNews = filteredNews.filter(n => n.is_featured);
  const regularNews = filteredNews.filter(n => !n.is_featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black text-white mb-4"
          >
            {isArabic ? 'أخبار' : 'Club'} <span className="text-[#d4af37]">{isArabic ? 'النادي' : 'News'}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-lg mb-8"
          >
            {t('news.subtitle','Latest updates from Ceramica Cleopatra FC')}
          </motion.p>

          {/* Search & Filter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder={isArabic ? 'ابحث في الأخبار...' : 'Search news...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px] h-12 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredNews.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-[#0a1628] mb-6 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-[#d4af37] rounded-full" />
              {t('news.featured','Featured Stories')}
            </h2>
            <div className="grid lg:grid-cols-2 gap-6">
              {featuredNews.slice(0, 2).map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    to={createPageUrl('NewsDetail') + `?id=${article.id}`}
                    className="block group"
                  >
                    <div className="relative h-[350px] rounded-2xl overflow-hidden">
                      <img 
                        src={article.featured_image || 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800'}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${categoryColors[article.category] || 'bg-gray-500 text-white'}`}>
                          {article.category?.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#d4af37] transition-colors">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-4 text-white/60 text-sm">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {article.published_at ? format(new Date(article.published_at), 'MMM d, yyyy') : 'Recent'}
                          </span>
                          {article.views > 0 && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {article.views.toLocaleString()} {isArabic ? 'مشاهدة' : 'views'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Articles */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0a1628] mb-6 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-[#0a1628] rounded-full" />
            {isArabic ? 'أحدث المقالات' : 'Latest Articles'}
            <span className="text-gray-400 text-lg font-normal">({filteredNews.length})</span>
          </h2>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularNews.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link 
                    to={createPageUrl('NewsDetail') + `?id=${article.id}`}
                    className="block group"
                  >
                    <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-[#d4af37]/50 hover:shadow-xl transition-all">
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={article.featured_image || 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400'}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-3 ${categoryColors[article.category] || 'bg-gray-500 text-white'}`}>
                          {article.category?.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <h3 className="font-bold text-[#0a1628] text-lg mb-2 line-clamp-2 group-hover:text-[#1e3a5f] transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-4">{article.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.published_at ? format(new Date(article.published_at), 'MMM d') : (isArabic ? 'حديثاً' : 'Recent')}
                          </span>
                          <span className="flex items-center gap-1 text-[#d4af37] font-medium">
                            {isArabic ? 'اقرأ المزيد' : 'Read More'} <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && filteredNews.length === 0 && (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">{isArabic ? 'لا توجد مقالات' : 'No articles found'}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}