import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { ceramicaCleopatra } from '@/api/ceramicaCleopatraClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl, ensureArray } from '@/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  Clock, Eye, User, ArrowLeft, Share2, Facebook, Twitter, 
  Linkedin, Copy, Tag, ChevronRight, MessageCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const categoryColors = {
  club_news: 'bg-[#d4af37] text-[#0a1628]',
  match_report: 'bg-green-500 text-white',
  transfers: 'bg-purple-500 text-white',
  injuries: 'bg-red-500 text-white',
  analysis: 'bg-blue-500 text-white',
  global_football: 'bg-cyan-500 text-white',
  premier_league: 'bg-indigo-600 text-white',
  la_liga: 'bg-orange-500 text-white',
  champions_league: 'bg-indigo-500 text-white',
};

export default function NewsDetail() {
  const { isArabic } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');
  const queryClient = useQueryClient();

  const { data: article, isLoading } = useQuery({
    queryKey: ['news', articleId],
    queryFn: async () => {
      const articles = await ceramicaCleopatra.entities.News.filter({ id: articleId });
      const list = ensureArray(articles);
      return list[0];
    },
    enabled: !!articleId
  });

  const { data: relatedNews = [] } = useQuery({
    queryKey: ['relatedNews', article?.category],
    queryFn: () => ceramicaCleopatra.entities.News.filter(
      { status: 'published', category: article?.category },
      '-published_at',
      4
    ),
    enabled: !!article?.category,
    select: ensureArray,
  });

  const related = relatedNews.filter(n => n.id !== articleId).slice(0, 3);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-12 w-3/4 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-[400px] bg-gray-200 rounded-2xl animate-pulse mb-8" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{isArabic ? 'المقال غير موجود' : 'Article not found'}</h2>
          <p className="text-gray-500 mb-4">{isArabic ? 'المقال الذي تبحث عنه غير موجود.' : "The article you're looking for doesn't exist."}</p>
          <Link to={createPageUrl('News')} className="text-[#d4af37] font-medium">
            {isArabic ? '→ العودة للأخبار' : '← Back to News'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <section className="relative h-[50vh] min-h-[400px]">
        <img 
          src={article.featured_image || 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1920'}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-4xl mx-auto px-4 pb-12">
            <Link 
              to={createPageUrl('News')}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {isArabic ? 'العودة للأخبار' : 'Back to News'}
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${categoryColors[article.category] || 'bg-gray-500 text-white'}`}>
                {article.category?.replace(/_/g, ' ').toUpperCase()}
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm">
                {article.author && (
                  <span className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      {article.author_avatar ? (
                        <img src={article.author_avatar} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    {article.author}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.published_at ? format(new Date(article.published_at), 'MMMM d, yyyy') : (isArabic ? 'حديثاً' : 'Recent')}
                </span>
                {article.views > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {article.views.toLocaleString()} {isArabic ? 'مشاهدة' : 'views'}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-8">
            {/* Share Sidebar */}
            <div className="hidden md:block">
              <div className="sticky top-24 space-y-3">
                <button 
                  onClick={copyLink}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#d4af37] hover:text-white flex items-center justify-center transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <a 
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#1DA1F2] hover:text-white flex items-center justify-center transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#1877F2] hover:text-white flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Article Content */}
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 bg-white rounded-2xl p-8 md:p-12 shadow-sm"
            >
              <div className="prose prose-lg max-w-none prose-headings:text-[#0a1628] prose-a:text-[#d4af37]">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                  <div className="flex flex-wrap gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    {article.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.article>
          </div>

          {/* Related Articles */}
          {related.length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-[#0a1628] mb-6 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-[#d4af37] rounded-full" />
                {isArabic ? 'مقالات ذات صلة' : 'Related Articles'}
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {related.map((news) => (
                  <Link 
                    key={news.id}
                    to={createPageUrl('NewsDetail') + `?id=${news.id}`}
                    className="block group"
                  >
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-[#d4af37]/50 hover:shadow-lg transition-all">
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={news.featured_image || 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400'}
                          alt={news.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-[#0a1628] line-clamp-2 group-hover:text-[#1e3a5f] transition-colors">
                          {news.title}
                        </h4>
                        <span className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {news.published_at ? format(new Date(news.published_at), 'MMM d') : 'Recent'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}