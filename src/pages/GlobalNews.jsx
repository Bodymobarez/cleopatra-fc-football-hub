import React, { useState, useMemo } from 'react';
import { ceramicaCleopatra } from '@/api/ceramicaCleopatraClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl, ensureArray } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate, getCategoryLabel } from '@/utils';
import { Clock, Eye, Search, Globe, Newspaper, ChevronRight, TrendingUp, X, LayoutGrid, List } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

/* ── category meta ─────────────────────────────────────────── */
const CATEGORIES = [
  { value: 'all',             labelEn: 'All News',       labelAr: 'كل الأخبار',        color: 'bg-[#1B2852]' },
  { value: 'club_news',       labelEn: 'Club News',      labelAr: 'أخبار النادي',       color: 'bg-[#FFB81C]' },
  { value: 'match_report',    labelEn: 'Match Reports',  labelAr: 'تقارير المباريات',   color: 'bg-green-600' },
  { value: 'transfers',       labelEn: 'Transfers',      labelAr: 'الانتقالات',          color: 'bg-purple-600' },
  { value: 'injuries',        labelEn: 'Injuries',       labelAr: 'الإصابات',            color: 'bg-red-600' },
  { value: 'analysis',        labelEn: 'Analysis',       labelAr: 'تحليل',              color: 'bg-blue-600' },
  { value: 'egyptian_league', labelEn: 'Egyptian League',labelAr: 'الدوري المصري',      color: 'bg-[#C8102E]' },
  { value: 'global_football', labelEn: 'Global Football',labelAr: 'كرة دولية',          color: 'bg-cyan-600' },
];

const CAT_COLOR = CATEGORIES.reduce((acc, c) => { acc[c.value] = c.color; return acc; }, {});

function readingTime(text = '', isArabic) {
  const words = String(text || '').split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return isArabic ? `${mins} دقيقة قراءة` : `${mins} min read`;
}

/* ── Single Article Card (grid variant) ────────────────────── */
function ArticleCard({ article, index, isArabic }) {
  const catColor = CAT_COLOR[article.category] || 'bg-gray-500';
  const fallback = 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
    >
      {article.external_url ? (
        <a href={article.external_url} target="_blank" rel="noopener noreferrer" className="block group h-full">
        <div className="h-full bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#FFB81C]/40 hover:shadow-2xl transition-all duration-300 flex flex-col">
          {/* Image */}
          <div className="relative h-52 overflow-hidden shrink-0">
            <img
              src={article.featured_image || fallback}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={e => { e.target.src = fallback; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${catColor}`}>
              {getCategoryLabel(article.category, isArabic)}
            </span>
            {article.is_featured && (
              <span className="absolute top-3 right-3 px-2 py-1 bg-[#FFB81C] text-[#1B2852] text-[10px] font-black rounded-full uppercase">
                {isArabic ? 'مميز' : 'Featured'}
              </span>
            )}
          </div>

          {/* Body */}
          <div className="flex flex-col flex-1 p-5">
            <h3 className="font-bold text-[#1B2852] text-base leading-snug mb-2 line-clamp-2 group-hover:text-[#C8102E] transition-colors">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="text-gray-500 text-sm line-clamp-2 mb-auto">{article.excerpt}</p>
            )}
            <div className="flex items-center justify-between text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(article.published_at, isArabic, true)}
                </span>
                {article.views > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.views.toLocaleString()}
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 text-[#FFB81C] font-semibold">
                {isArabic ? 'اقرأ' : 'Read'} <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
        </a>
      ) : (
        <Link to={createPageUrl('NewsDetail') + `?id=${article.id}`} className="block group h-full">
        <div className="h-full bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#FFB81C]/40 hover:shadow-2xl transition-all duration-300 flex flex-col">
          {/* Image */}
          <div className="relative h-52 overflow-hidden shrink-0">
            <img
              src={article.featured_image || fallback}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={e => { e.target.src = fallback; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${catColor}`}>
              {getCategoryLabel(article.category, isArabic)}
            </span>
            {article.is_featured && (
              <span className="absolute top-3 right-3 px-2 py-1 bg-[#FFB81C] text-[#1B2852] text-[10px] font-black rounded-full uppercase">
                {isArabic ? 'مميز' : 'Featured'}
              </span>
            )}
          </div>
          <div className="flex flex-col flex-1 p-5">
            <h3 className="font-bold text-[#1B2852] text-base leading-snug mb-2 line-clamp-2 group-hover:text-[#C8102E] transition-colors">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="text-gray-500 text-sm line-clamp-2 mb-auto">{article.excerpt}</p>
            )}
            <div className="flex items-center justify-between text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(article.published_at, isArabic, true)}
                </span>
                {article.views > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.views.toLocaleString()}
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 text-[#FFB81C] font-semibold">
                {isArabic ? 'اقرأ' : 'Read'} <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
        </Link>
      )}
    </motion.div>
  );
}

/* ── Single Article Row (list variant) ─────────────────────── */
function ArticleRow({ article, index, isArabic }) {
  const catColor = CAT_COLOR[article.category] || 'bg-gray-500';
  const fallback = 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&q=80';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03 }}
    >
      {article.external_url ? (
        <a href={article.external_url} target="_blank" rel="noopener noreferrer" className="block group">
          <div className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-[#FFB81C]/40 hover:shadow-lg transition-all">
            <div className="w-28 h-20 rounded-xl overflow-hidden shrink-0">
              <img src={article.featured_image || fallback} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={e => { e.target.src = fallback; }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase text-white ${catColor}`}>{getCategoryLabel(article.category, isArabic)}</span>
                <span className="text-gray-400 text-[10px] flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{formatDate(article.published_at, isArabic, true)}</span>
                <span className="text-cyan-500 text-[9px] font-bold">{article.source || 'BBC'}</span>
              </div>
              <h3 className="font-bold text-[#1B2852] text-sm leading-snug line-clamp-2 group-hover:text-[#C8102E] transition-colors">{article.title}</h3>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#FFB81C] transition-colors shrink-0 self-center" />
          </div>
        </a>
      ) : (
        <Link to={createPageUrl('NewsDetail') + `?id=${article.id}`} className="block group">
          <div className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-[#FFB81C]/40 hover:shadow-lg transition-all">
            <div className="w-28 h-20 rounded-xl overflow-hidden shrink-0">
              <img src={article.featured_image || fallback} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={e => { e.target.src = fallback; }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase text-white ${catColor}`}>{getCategoryLabel(article.category, isArabic)}</span>
                <span className="text-gray-400 text-[10px] flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{formatDate(article.published_at, isArabic, true)}</span>
              </div>
              <h3 className="font-bold text-[#1B2852] text-sm leading-snug line-clamp-2 group-hover:text-[#C8102E] transition-colors">{article.title}</h3>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#FFB81C] transition-colors shrink-0 self-center" />
          </div>
        </Link>
      )}
    </motion.div>
  );
}

/* ── Featured Hero Article ──────────────────────────────────── */
function FeaturedHeroInner({ article, isArabic, fallback, catColor }) {
  return (
    <div className="relative h-[420px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
      <img
        src={article.featured_image || fallback}
        alt={article.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
        onError={e => { e.target.src = fallback; }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase text-white ${catColor}`}>
            {getCategoryLabel(article.category, isArabic)}
          </span>
          <span className="text-white/50 text-sm">{formatDate(article.published_at, isArabic)}</span>
          {article.source && <span className="text-cyan-400 text-xs font-bold">{article.source}</span>}
        </div>
        <h2 className="text-2xl md:text-4xl font-black text-white mb-3 leading-tight group-hover:text-[#FFB81C] transition-colors line-clamp-3">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-white/70 text-base line-clamp-2 mb-4 max-w-2xl">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-4 text-white/50 text-sm">
          {article.views > 0 && (
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {article.views.toLocaleString()} {isArabic ? 'مشاهدة' : 'views'}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-[#FFB81C] font-semibold">
            {isArabic ? 'اقرأ التقرير الكامل' : 'Read full story'} <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

function FeaturedHero({ article, isArabic }) {
  if (!article) return null;
  const fallback = 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1920&q=80';
  const catColor = CAT_COLOR[article.category] || 'bg-gray-500';

  if (article.external_url) {
    return (
      <a href={article.external_url} target="_blank" rel="noopener noreferrer" className="block group mb-8">
        <FeaturedHeroInner article={article} isArabic={isArabic} fallback={fallback} catColor={catColor} />
      </a>
    );
  }
  return (
    <Link to={createPageUrl('NewsDetail') + `?id=${article.id}`} className="block group mb-8">
      <FeaturedHeroInner article={article} isArabic={isArabic} fallback={fallback} catColor={catColor} />
    </Link>
  );
}

/* ── Main Page ─────────────────────────────────────────────── */
export default function GlobalNews() {
  const { isArabic } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const { data: dbNews = [], isLoading } = useQuery({
    queryKey: ['news-all'],
    queryFn: () => ceramicaCleopatra.entities.News.filter({ status: 'published' }, '-published_at', 200),
    select: ensureArray,
    staleTime: 3 * 60 * 1000,
  });

  // Live BBC RSS feed for global_football category
  const { data: feedData } = useQuery({
    queryKey: ['news-feeds-global'],
    queryFn: () => ceramicaCleopatra.newsFeeds('global_football'),
    select: (d) => ensureArray(d?.data ?? d),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Merge DB news + live RSS, dedup by id
  const news = useMemo(() => {
    const rssItems = feedData || [];
    const combined = [...dbNews, ...rssItems];
    const seen = new Set();
    return combined.filter(a => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    }).sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  }, [dbNews, feedData]);

  const filteredNews = useMemo(() => {
    return news.filter(a => {
      const catMatch = activeCategory === 'all' || a.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const searchMatch = !q
        || (a.title || '').toLowerCase().includes(q)
        || (a.excerpt || '').toLowerCase().includes(q);
      return catMatch && searchMatch;
    });
  }, [news, activeCategory, searchQuery]);

  const featuredArticle = filteredNews.find(a => a.is_featured) || filteredNews[0] || null;
  const restArticles    = filteredNews.filter(a => a.id !== featuredArticle?.id);

  // Category counts
  const counts = useMemo(() => {
    const map = { all: news.length };
    for (const a of news) {
      map[a.category] = (map[a.category] || 0) + 1;
    }
    return map;
  }, [news]);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-[#0a1628] via-[#1B2852] to-[#0a1628] py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1920')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a1628]/80" />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-[#FFB81C]/20 border border-[#FFB81C]/30 rounded-full px-5 py-2 mb-5">
              <Newspaper className="w-4 h-4 text-[#FFB81C]" />
              <span className="text-[#FFB81C] text-sm font-bold uppercase tracking-wider">
                {isArabic ? 'مركز الأخبار' : 'News Center'}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
              {isArabic ? 'أخبار' : 'Latest'}{' '}
              <span className="text-[#FFB81C]">{isArabic ? 'سيراميكا' : 'News'}</span>
            </h1>
            <p className="text-white/50 text-base mb-8 max-w-xl mx-auto">
              {isArabic
                ? 'آخر أخبار النادي والدوري المصري وكرة القدم العالمية'
                : 'Latest club news, Egyptian league coverage and global football updates'}
            </p>

            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                placeholder={isArabic ? 'ابحث في الأخبار...' : 'Search news...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 h-13 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#FFB81C]/50 focus:bg-white/15 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Stats strip */}
            <div className="flex items-center justify-center gap-8 mt-8 text-white/40 text-sm">
              <span>{news.length} {isArabic ? 'مقال' : 'articles'}</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span>{CATEGORIES.length - 1} {isArabic ? 'تصنيف' : 'categories'}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Category Tabs ── */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORIES.map(cat => {
              const count = counts[cat.value] || 0;
              const isActive = activeCategory === cat.value;
              const label = isArabic ? cat.labelAr : cat.labelEn;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? `${cat.color} text-white shadow-md`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* View mode toggle */}
            <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow text-[#1B2852]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow text-[#1B2852]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto">

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-24">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-xl font-semibold mb-2">
                {isArabic ? 'لا توجد مقالات' : 'No articles found'}
              </p>
              <p className="text-gray-300 text-sm mb-6">
                {isArabic ? 'جرّب تصنيفاً آخر أو أعد البحث' : 'Try a different category or adjust your search'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-2.5 bg-[#1B2852] text-white rounded-xl text-sm font-semibold hover:bg-[#FFB81C] hover:text-[#1B2852] transition-colors"
                >
                  {isArabic ? 'مسح البحث' : 'Clear search'}
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Featured big card */}
              {searchQuery === '' && <FeaturedHero article={featuredArticle} isArabic={isArabic} />}

              {/* Results header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#FFB81C]" />
                  <h2 className="text-lg font-black text-[#1B2852]">
                    {searchQuery
                      ? (isArabic ? `نتائج "${searchQuery}"` : `Results for "${searchQuery}"`)
                      : (isArabic ? 'جميع المقالات' : 'All Articles')}
                  </h2>
                  <span className="text-gray-400 font-normal text-sm">({restArticles.length})</span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {(searchQuery ? filteredNews : restArticles).map((article, i) => (
                      <ArticleCard key={article.id} article={article} index={i} isArabic={isArabic} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {(searchQuery ? filteredNews : restArticles).map((article, i) => (
                      <ArticleRow key={article.id} article={article} index={i} isArabic={isArabic} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
