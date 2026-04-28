import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/components/LanguageContext';

const categoryColors = {
  club_news:       'bg-[#FFB81C] text-[#1B2852]',
  match_report:    'bg-green-500 text-white',
  transfers:       'bg-purple-500 text-white',
  injuries:        'bg-red-500 text-white',
  analysis:        'bg-blue-500 text-white',
  global_football: 'bg-cyan-500 text-white',
  premier_league:  'bg-indigo-600 text-white',
  la_liga:         'bg-orange-500 text-white',
  serie_a:         'bg-blue-800 text-white',
  bundesliga:      'bg-red-600 text-white',
  champions_league:'bg-indigo-500 text-white',
  world_cup:       'bg-[#FFB81C] text-[#1B2852]',
  egyptian_league: 'bg-[#C8102E] text-white',
  african_football:'bg-green-600 text-white',
};

const categoryLabelAr = {
  club_news:       'أخبار النادي',
  match_report:    'تقرير مباراة',
  transfers:       'الانتقالات',
  injuries:        'الإصابات',
  analysis:        'تحليل',
  global_football: 'كرة دولية',
  premier_league:  'دوري إنجليزي',
  la_liga:         'دوري إسباني',
  champions_league:'دوري الأبطال',
  world_cup:       'كأس العالم',
  egyptian_league: 'دوري مصري',
};

export default function NewsGrid({ news = [], title, showViewAll = true }) {
  const { isArabic } = useLanguage();
  const defaultTitle = isArabic ? 'آخر الأخبار' : 'Latest News';
  const displayTitle = title || defaultTitle;

  const featuredNews = news.find(n => n.is_featured) || news[0];
  const otherNews    = news.filter(n => n.id !== featuredNews?.id).slice(0, 4);

  if (news.length === 0) return null;

  const categoryLabel = (cat) => {
    if (!cat) return '';
    if (isArabic) return categoryLabelAr[cat] || cat.replace(/_/g, ' ');
    return cat.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-10 bg-[#FFB81C] rounded-full" />
            <h2 className="text-3xl font-black text-[#1B2852]">{displayTitle}</h2>
          </div>
          {showViewAll && (
            <Link
              to={createPageUrl('News')}
              className="flex items-center gap-2 text-[#C8102E] font-medium hover:gap-3 transition-all"
            >
              {isArabic ? 'عرض الكل' : 'View All'} <ChevronRight className="w-5 h-5" />
            </Link>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {featuredNews && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group">
              <Link to={createPageUrl('NewsDetail') + `?id=${featuredNews.id}`}>
                <div className="relative h-[400px] rounded-2xl overflow-hidden">
                  <img
                    src={featuredNews.featured_image || 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800'}
                    alt={featuredNews.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${categoryColors[featuredNews.category] || 'bg-gray-500 text-white'}`}>
                      {categoryLabel(featuredNews.category)}
                    </span>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#FFB81C] transition-colors">
                      {featuredNews.title}
                    </h3>
                    <p className="text-white/70 line-clamp-2 mb-4">{featuredNews.excerpt}</p>
                    <div className="flex items-center gap-4 text-white/60 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredNews.published_at ? format(new Date(featuredNews.published_at), 'MMM d, yyyy') : (isArabic ? 'حديثاً' : 'Recent')}
                      </span>
                      {featuredNews.views > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {featuredNews.views.toLocaleString()} {isArabic ? 'مشاهدة' : 'views'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          <div className="space-y-4">
            {otherNews.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={createPageUrl('NewsDetail') + `?id=${article.id}`}
                  className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-[#FFB81C]/50 hover:shadow-lg transition-all group"
                >
                  <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={article.featured_image || 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400'}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-2 ${categoryColors[article.category] || 'bg-gray-500 text-white'}`}>
                      {categoryLabel(article.category)}
                    </span>
                    <h4 className="font-bold text-[#1B2852] line-clamp-2 group-hover:text-[#C8102E] transition-colors">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-3 text-gray-400 text-xs mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.published_at ? format(new Date(article.published_at), 'MMM d') : (isArabic ? 'حديثاً' : 'Recent')}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
