import React from 'react';
import { ceramicaCleopatra } from '@/api/ceramicaCleopatraClient';
import { useQuery } from '@tanstack/react-query';
import { ensureArray } from '@/utils';
import { useLanguage } from '@/components/LanguageContext';

import HeroSection from '@/components/home/HeroSection';
import NewsTicker from '@/components/home/NewsTicker';
import LiveScores from '@/components/home/LiveScores';
import QuickLinks from '@/components/home/QuickLinks';
import NewsGrid from '@/components/home/NewsGrid';
import FeaturedVideo from '@/components/home/FeaturedVideo';

export default function Home() {
  const { t, isArabic } = useLanguage();
  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: () => ceramicaCleopatra.entities.Match.list('-date', 20),
    select: ensureArray,
  });

  const { data: news = [] } = useQuery({
    queryKey: ['news'],
    queryFn: () => ceramicaCleopatra.entities.News.filter({ status: 'published' }, '-published_at', 10),
    select: ensureArray,
  });

  const { data: videos = [] } = useQuery({
    queryKey: ['videos'],
    queryFn: () => ceramicaCleopatra.entities.Media.filter({ type: 'video' }, '-created_date', 5),
    select: ensureArray,
  });

  // Get Ceramica matches
  const ceramicaMatches = matches.filter(m => m.is_ceramica_match);
  const latestMatch = ceramicaMatches.find(m => m.status === 'finished');
  const nextMatch = ceramicaMatches.find(m => m.status === 'scheduled');

  // Get club news and global news
  const clubNews = news.filter(n => n.is_club_news);
  const globalNews = news.filter(n => !n.is_club_news);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection latestMatch={latestMatch} nextMatch={nextMatch} />

      {/* Breaking News Ticker */}
      <NewsTicker news={news} />

      {/* Live Scores */}
      <LiveScores matches={matches} />

      {/* Quick Links */}
      <QuickLinks />

      {/* Club News */}
      <NewsGrid 
        news={clubNews.length > 0 ? clubNews : news.slice(0, 5)} 
        title={isArabic ? 'أخبار النادي' : 'Club News'} 
      />

      {/* Featured Videos */}
      <FeaturedVideo videos={videos} />

      {/* Global Football News */}
      {globalNews.length > 0 && (
        <NewsGrid 
          news={globalNews} 
          title="Global Football" 
          showViewAll={true}
        />
      )}
    </div>
  );
}