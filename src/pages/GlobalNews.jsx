import React, { useState } from 'react';
import { ceramicaCleopatra } from '@/api/ceramicaCleopatraClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl, ensureArray } from '@/utils';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Clock, Eye, Search, Globe, Trophy } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/components/LanguageContext';

const categoryColors = {
  premier_league: 'bg-purple-600 text-white',
  la_liga: 'bg-orange-500 text-white',
  serie_a: 'bg-blue-600 text-white',
  bundesliga: 'bg-red-600 text-white',
  champions_league: 'bg-indigo-600 text-white',
  world_cup: 'bg-[#FFB81C] text-[#1B2852]',
  egyptian_league: 'bg-[#C8102E] text-white',
  african_football: 'bg-green-600 text-white',
  global_football: 'bg-cyan-500 text-white',
};

export default function GlobalNews() {
  const { isArabic } = useLanguage();
  const [activeLeague, setActiveLeague] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const leagues = [
    { value: 'all',             label: isArabic ? 'كل الأخبار' : 'All News',          icon: Globe },
    { value: 'premier_league',  label: isArabic ? 'الدوري الإنجليزي' : 'Premier League',  color: 'bg-purple-600' },
    { value: 'la_liga',         label: isArabic ? 'الدوري الإسباني' : 'La Liga',           color: 'bg-orange-500' },
    { value: 'serie_a',         label: isArabic ? 'الدوري الإيطالي' : 'Serie A',            color: 'bg-blue-600' },
    { value: 'bundesliga',      label: isArabic ? 'الدوري الألماني' : 'Bundesliga',         color: 'bg-red-600' },
    { value: 'champions_league',label: isArabic ? 'دوري الأبطال' : 'Champions League',      color: 'bg-indigo-600' },
    { value: 'world_cup',       label: isArabic ? 'كأس العالم' : 'World Cup',              color: 'bg-[#FFB81C]' },
    { value: 'egyptian_league', label: isArabic ? 'الدوري المصري' : 'Egyptian League',      color: 'bg-[#C8102E]' },
    { value: 'african_football',label: isArabic ? 'كرة إفريقيا' : 'African Football',      color: 'bg-green-600' },
  ];

  const { data: news = [], isLoading } = useQuery({
    queryKey: ['globalNews'],
    queryFn: () => ceramicaCleopatra.entities.News.filter({ status: 'published' }, '-published_at', 100),
    select: ensureArray,
  });

  const globalNews = news.filter(n => !n.is_club_news);

  const filteredNews = globalNews.filter(article => {
    const matchLeague = activeLeague === 'all' || article.category === activeLeague || article.league === activeLeague;
    const matchSearch = !searchQuery || 
      article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLeague && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1B2852] via-[#C8102E] to-[#1B2852] py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1920')] bg-cover bg-center opacity-10" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Globe className="w-16 h-16 text-[#FFB81C] mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
              {isArabic ? 'أخبار كرة القدم' : 'Global Football'} <span className="text-[#FFB81C]">{isArabic ? 'العالمية' : 'News'}</span>
            </h1>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              {isArabic
                ? 'تغطية شاملة للدوريات والبطولات والمسابقات الكروية حول العالم'
                : 'Comprehensive coverage of football leagues, tournaments, and competitions worldwide'}
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder={isArabic ? 'ابحث في أخبار كرة القدم...' : 'Search global football news...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 text-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* League Tabs */}
      <section className="sticky top-20 z-30 bg-white/95 backdrop-blur-xl border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            {leagues.map((league) => (
              <button
                key={league.value}
                onClick={() => setActiveLeague(league.value)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all ${
                  activeLeague === league.value
                    ? league.color ? `${league.color} text-white` : 'bg-[#1B2852] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {league.icon && <league.icon className="w-4 h-4" />}
                {league.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredNews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.map((article, index) => (
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
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100">
                      <div className="relative h-56 overflow-hidden">
                        <img 
                          src={article.featured_image || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800'}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${categoryColors[article.category] || 'bg-gray-500 text-white'}`}>
                          {article.category?.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-[#1B2852] text-lg mb-2 line-clamp-2 group-hover:text-[#C8102E] transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-4">{article.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.published_at ? format(new Date(article.published_at), 'MMM d, yyyy') : (isArabic ? 'حديثاً' : 'Recent')}
                          </span>
                          {article.views > 0 && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {article.views.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">{isArabic ? 'لا توجد أخبار كروية' : 'No global football news found'}</p>
              <p className="text-gray-400 text-sm mt-2">{isArabic ? 'جرّب اختيار دوري آخر أو تعديل البحث' : 'Try selecting a different league or adjusting your search'}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}