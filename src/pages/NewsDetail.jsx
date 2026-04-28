import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { ceramicaCleopatra } from '@/api/ceramicaCleopatraClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl, ensureArray } from '@/utils';
import { formatDate, getCategoryLabel } from '@/utils';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Clock, Eye, ArrowLeft, Share2, Facebook, Twitter,
  Copy, Tag, ChevronRight, BookOpen, Bookmark, Globe,
} from 'lucide-react';
import { toast } from 'sonner';

/* ── Category config ───────────────────────────────────────────── */
const CAT = {
  club_news:      { color: 'bg-[#FFB81C] text-[#1B2852]', border: 'border-[#FFB81C]' },
  match_report:   { color: 'bg-green-500 text-white',      border: 'border-green-500' },
  transfers:      { color: 'bg-purple-500 text-white',     border: 'border-purple-500' },
  injuries:       { color: 'bg-red-500 text-white',        border: 'border-red-500' },
  analysis:       { color: 'bg-blue-500 text-white',       border: 'border-blue-500' },
  global_football:{ color: 'bg-cyan-500 text-white',       border: 'border-cyan-400' },
  egyptian_league:{ color: 'bg-[#C8102E] text-white',      border: 'border-[#C8102E]' },
  preview:        { color: 'bg-[#FFB81C] text-[#1B2852]', border: 'border-[#FFB81C]' },
};
const catStyle = (cat) => CAT[cat] || { color: 'bg-gray-500 text-white', border: 'border-gray-500' };

/* ── Context-aware fallback images ────────────────────────────── */
const FALLBACKS = {
  match_report:   'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&q=85',
  preview:        'https://images.unsplash.com/photo-1508768787810-6adc1f613514?w=1600&q=85',
  transfers:      'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=1600&q=85',
  injuries:       'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1600&q=85',
  analysis:       'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=1600&q=85',
  egyptian_league:'https://images.unsplash.com/photo-1551958219-acbc595d816f?w=1600&q=85',
  global_football:'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&q=85',
  club_news:      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&q=85',
};
const heroImage = (article) =>
  article.featured_image || FALLBACKS[article.category] ||
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1600&q=85';

/* ── Reading time ─────────────────────────────────────────────── */
const readTime = (text = '') => Math.max(1, Math.ceil(text.split(/\s+/).length / 200));

/* ── Pull-quote detector (lines starting with >) ─────────────── */
function ArticleBody({ content }) {
  const paragraphs = (content || '').split(/\n+/).filter(Boolean);
  return (
    <div className="space-y-6 text-lg leading-relaxed">
      {paragraphs.map((p, i) => {
        if (p.startsWith('# '))
          return <h2 key={i} className="text-2xl md:text-3xl font-black text-white mt-10 mb-2">{p.slice(2)}</h2>;
        if (p.startsWith('## '))
          return <h3 key={i} className="text-xl font-black text-[#FFB81C] mt-8 mb-2">{p.slice(3)}</h3>;
        if (p.startsWith('> '))
          return (
            <blockquote key={i}
              className="border-l-4 border-[#FFB81C] pl-6 py-2 bg-[#FFB81C]/8 rounded-r-xl italic text-white/90 text-xl font-medium my-8">
              {p.slice(2)}
            </blockquote>
          );
        if (p.startsWith('• ') || p.startsWith('- '))
          return (
            <p key={i} className="flex gap-3 text-white/80">
              <span className="mt-2 w-2 h-2 bg-[#FFB81C] rounded-full shrink-0" />
              <span>{p.slice(2)}</span>
            </p>
          );
        if (/^[A-Z\u0600-\u06FF].*[A-Z\u0600-\u06FF]$/.test(p) && p.length < 80 && !p.includes(' — '))
          return (
            <p key={i} className="text-sm font-black uppercase tracking-[0.15em] text-[#FFB81C]/70 mt-8">{p}</p>
          );
        return (
          <p key={i} className={`text-white/80 leading-[1.85] ${i === 0 ? 'text-xl font-medium text-white/95 first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:text-[#FFB81C] first-letter:leading-none' : ''}`}>
            {p}
          </p>
        );
      })}
    </div>
  );
}

/* ── Share button ─────────────────────────────────────────────── */
function ShareBtn({ icon: Icon, onClick, href, color, label }) {
  const cls = `group flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:${color} hover:border-transparent transition-all text-white/60 hover:text-white text-sm font-semibold`;
  if (href) return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls} title={label}>
      <Icon className="w-4 h-4" /> <span className="hidden sm:inline">{label}</span>
    </a>
  );
  return (
    <button onClick={onClick} className={cls} title={label}>
      <Icon className="w-4 h-4" /> <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/* ── Related card ─────────────────────────────────────────────── */
function RelatedCard({ article, isArabic }) {
  const cat = catStyle(article.category);
  return (
    <Link to={createPageUrl('NewsDetail') + `?id=${article.id}`} className="group block">
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#FFB81C]/40 hover:shadow-2xl hover:shadow-[#FFB81C]/5 transition-all duration-300">
        <div className="relative h-44 overflow-hidden">
          <img
            src={article.featured_image || FALLBACKS[article.category] || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600'}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${cat.color}`}>
            {getCategoryLabel(article.category, isArabic)}
          </span>
        </div>
        <div className="p-4">
          <h4 className="font-bold text-white line-clamp-2 group-hover:text-[#FFB81C] transition-colors text-sm leading-snug mb-2">
            {article.title}
          </h4>
          <span className="text-white/40 text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />{formatDate(article.published_at, isArabic, true)}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Reading Progress bar ─────────────────────────────────────── */
function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const width = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  return (
    <motion.div
      className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-[#FFB81C] via-[#C8102E] to-[#FFB81C] z-[100] origin-left"
      style={{ width }}
    />
  );
}

/* ── Main ─────────────────────────────────────────────────────── */
export default function NewsDetail() {
  const { isArabic } = useLanguage();
  const articleId = new URLSearchParams(window.location.search).get('id');
  const heroRef   = useRef(null);
  const [bookmarked, setBookmarked] = useState(false);

  const { data: article, isLoading } = useQuery({
    queryKey: ['news', articleId],
    queryFn: async () => {
      const list = ensureArray(await ceramicaCleopatra.entities.News.filter({ id: articleId }));
      return list[0];
    },
    enabled: !!articleId,
  });

  const { data: relatedRaw = [] } = useQuery({
    queryKey: ['relatedNews', article?.category],
    queryFn: () => ceramicaCleopatra.entities.News.filter({ status: 'published', category: article?.category }, '-published_at', 5),
    enabled: !!article?.category,
    select: ensureArray,
  });
  const related = relatedRaw.filter(n => n.id !== articleId).slice(0, 3);

  const copyLink = () => { navigator.clipboard.writeText(window.location.href); toast.success(isArabic ? 'تم نسخ الرابط' : 'Link copied!'); };

  /* ── Loading skeleton ── */
  if (isLoading) return (
    <div className="min-h-screen bg-[#0a1628]">
      <ReadingProgress />
      <div className="h-[65vh] bg-gradient-to-b from-white/5 to-[#0a1628] animate-pulse" />
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-5">
        {[1,0.9,0.8,0.6,0.9,0.7].map((w,i) => (
          <div key={i} className="h-5 rounded-lg bg-white/5 animate-pulse" style={{width:`${w*100}%`}} />
        ))}
      </div>
    </div>
  );

  /* ── Not found ── */
  if (!article) return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-3">{isArabic ? 'المقال غير موجود' : 'Article not found'}</h2>
        <Link to={createPageUrl('News')} className="text-[#FFB81C] font-semibold hover:underline">
          {isArabic ? '← العودة للأخبار' : '← Back to News'}
        </Link>
      </div>
    </div>
  );

  const cat    = catStyle(article.category);
  const imgSrc = heroImage(article);
  const mins   = readTime(article.content);
  const url    = window.location.href;
  const title  = encodeURIComponent(article.title);

  return (
    <div className={`min-h-screen bg-[#0a1628] ${isArabic ? 'font-arabic' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <ReadingProgress />

      {/* ══════════════ HERO ══════════════ */}
      <div ref={heroRef} className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {/* Parallax image */}
        <motion.img
          src={imgSrc}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover scale-110"
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          onError={e => { e.target.src = FALLBACKS[article.category] || FALLBACKS.club_news; }}
        />

        {/* Gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/60 to-[#0a1628]/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/40 to-transparent" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-4xl mx-auto w-full px-4 pb-14">

            {/* Back link */}
            <Link to={createPageUrl('News')}
              className="inline-flex items-center gap-2 text-white/50 hover:text-[#FFB81C] text-sm font-medium mb-6 transition-colors group">
              <ArrowLeft className={`w-4 h-4 group-hover:-translate-x-1 transition-transform ${isArabic ? 'rotate-180' : ''}`} />
              {isArabic ? 'العودة إلى الأخبار' : 'Back to News'}
            </Link>

            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }}>
              {/* Badge row */}
              <div className="flex items-center flex-wrap gap-3 mb-5">
                <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wide ${cat.color}`}>
                  {getCategoryLabel(article.category, isArabic)}
                </span>
                {article.is_breaking && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-black uppercase rounded-full animate-pulse">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    {isArabic ? 'عاجل' : 'Breaking'}
                  </span>
                )}
                {article.is_featured && (
                  <span className="px-3 py-1.5 bg-[#FFB81C]/20 border border-[#FFB81C]/40 text-[#FFB81C] text-xs font-bold rounded-full">
                    {isArabic ? 'مميز' : 'Featured'}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 max-w-3xl">
                {article.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-5 text-white/55 text-sm">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {formatDate(article.published_at, isArabic)}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  {mins} {isArabic ? 'دقائق قراءة' : 'min read'}
                </span>
                {article.views > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {article.views.toLocaleString()} {isArabic ? 'مشاهدة' : 'views'}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══════════════ CONTENT ══════════════ */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-start">

          {/* Article column */}
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {/* Excerpt pull-up */}
            {article.excerpt && (
              <div className="mb-10 pb-10 border-b border-white/10">
                <p className="text-xl md:text-2xl text-white/75 leading-relaxed font-light italic">
                  {article.excerpt}
                </p>
              </div>
            )}

            {/* Body */}
            <ArticleBody content={article.content} />

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-2 items-center">
                <Tag className="w-4 h-4 text-white/30" />
                {article.tags.map((t, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 text-xs rounded-full hover:border-[#FFB81C]/40 hover:text-[#FFB81C] transition-colors cursor-default">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Share strip */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-white/40 text-sm mb-4 font-semibold uppercase tracking-wide">{isArabic ? 'شارك المقال' : 'Share this article'}</p>
              <div className="flex flex-wrap gap-3">
                <ShareBtn icon={Copy}     onClick={copyLink}  color="bg-[#FFB81C]"   label={isArabic ? 'نسخ الرابط' : 'Copy link'} />
                <ShareBtn icon={Twitter}  href={`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${title}`}  color="bg-black"      label="X / Twitter" />
                <ShareBtn icon={Facebook} href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}   color="bg-[#1877F2]"  label="Facebook" />
                <ShareBtn icon={Globe}    href={`https://wa.me/?text=${title}%20${encodeURIComponent(url)}`} color="bg-[#25D366]"  label="WhatsApp" />
                <button
                  onClick={() => setBookmarked(b => !b)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-semibold ml-auto
                    ${bookmarked ? 'bg-[#FFB81C] border-[#FFB81C] text-[#1B2852]' : 'border-white/10 bg-white/5 text-white/60 hover:border-[#FFB81C]/40 hover:text-white'}`}>
                  <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                  {isArabic ? (bookmarked ? 'محفوظ' : 'حفظ') : (bookmarked ? 'Saved' : 'Save')}
                </button>
              </div>
            </div>
          </motion.article>

          {/* Sticky sidebar — visible ≥lg */}
          <aside className="hidden lg:block w-[220px] sticky top-28">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest">{isArabic ? 'معلومات' : 'Article info'}</p>
              <div className="space-y-3 text-sm text-white/60">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#FFB81C]" />
                  <span>{formatDate(article.published_at, isArabic)}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-[#FFB81C]" />
                  <span>{mins} {isArabic ? 'دقائق' : 'min read'}</span>
                </div>
                {article.views > 0 && (
                  <div className="flex items-center gap-2.5">
                    <Eye className="w-4 h-4 text-[#FFB81C]" />
                    <span>{article.views.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="pt-3 border-t border-white/10">
                <span className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black uppercase ${cat.color}`}>
                  {getCategoryLabel(article.category, isArabic)}
                </span>
              </div>
              {article.tags?.slice(0,5).map((t,i) => (
                <span key={i} className="block text-xs text-white/40 hover:text-[#FFB81C] transition-colors cursor-default">#{t}</span>
              ))}
            </div>
          </aside>
        </div>

        {/* ══════ RELATED ARTICLES ══════ */}
        {related.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="w-1 h-8 bg-[#FFB81C] rounded-full" />
                <h3 className="text-2xl font-black text-white">{isArabic ? 'مقالات ذات صلة' : 'Related Articles'}</h3>
              </div>
              <Link to={createPageUrl('News')} className="flex items-center gap-1 text-[#FFB81C] text-sm font-semibold hover:gap-2 transition-all">
                {isArabic ? 'كل الأخبار' : 'All News'}
                <ChevronRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {related.map((n, i) => (
                <motion.div key={n.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <RelatedCard article={n} isArabic={isArabic} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
