import React, { useState } from 'react';
import { ceramicaCleopatra } from '@/api/ceramicaCleopatraClient';
import { useQuery } from '@tanstack/react-query';
import { ensureArray } from '@/utils';
import { motion } from 'framer-motion';
import { Calendar, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isSameMonth } from 'date-fns';
import MatchCard from '@/components/shared/MatchCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/components/LanguageContext';

export default function Matches() {
  const { t, isArabic } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: () => ceramicaCleopatra.entities.Match.list('-date', 100),
    select: ensureArray,
  });

  const filteredMatches = matches.filter(match => {
    const matchDate = new Date(match.date);
    const inMonth = isSameMonth(matchDate, currentMonth);
    
    let passFilter = true;
    if (filter === 'ceramica') passFilter = match.is_ceramica_match;
    if (filter === 'global') passFilter = !match.is_ceramica_match;
    
    let passStatus = true;
    if (statusFilter === 'scheduled') passStatus = match.status === 'scheduled';
    if (statusFilter === 'finished') passStatus = match.status === 'finished';
    if (statusFilter === 'live') passStatus = match.status === 'live' || match.status === 'halftime';

    return inMonth && passFilter && passStatus;
  });

  // Get upcoming and recent
  const now = new Date();
  const upcomingMatches = matches
    .filter(m => new Date(m.date) > now && m.is_ceramica_match)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);
  
  const recentMatches = matches
    .filter(m => m.status === 'finished' && m.is_ceramica_match)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1920')] bg-cover bg-center opacity-20" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black text-white mb-4"
          >
            {isArabic ? 'المواعيد' : 'Fixtures'} & <span className="text-[#d4af37]">{isArabic ? 'النتائج' : 'Results'}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-lg"
          >
            {isArabic ? 'جميع مباريات نادي سيراميكا كليوباترا والدوريات العالمية' : 'All matches featuring Ceramica Cleopatra FC and global football'}
          </motion.p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Upcoming */}
            <div>
              <h3 className="text-lg font-bold text-[#0a1628] mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-green-500 rounded-full" />
                {t('matches.upcoming', 'Upcoming Matches')}
              </h3>
              <div className="space-y-3">
                {upcomingMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[#0a1628]">{match.home_team}</span>
                      <span className="text-gray-400">{t('matches.vs','vs')}</span>
                      <span className="text-sm font-medium text-[#0a1628]">{match.away_team}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">{format(new Date(match.date), 'MMM d')}</span>
                    </div>
                  </div>
                ))}
                {upcomingMatches.length === 0 && (
                  <p className="text-gray-400 text-sm">{isArabic ? 'لا توجد مباريات قادمة' : 'No upcoming matches'}</p>
                )}
              </div>
            </div>

            {/* Recent */}
            <div>
              <h3 className="text-lg font-bold text-[#0a1628] mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#d4af37] rounded-full" />
                {t('matches.recent', 'Recent Results')}
              </h3>
              <div className="space-y-3">
                {recentMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[#0a1628]">{match.home_team}</span>
                      <span className="font-bold">{match.home_score} - {match.away_score}</span>
                      <span className="text-sm font-medium text-[#0a1628]">{match.away_team}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">{format(new Date(match.date), 'MMM d')}</span>
                    </div>
                  </div>
                ))}
                {recentMatches.length === 0 && (
                  <p className="text-gray-400 text-sm">No recent matches</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar View */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            {/* Month Navigation */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-[#0a1628] min-w-[200px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('matches.all_matches','All Matches')}</SelectItem>
                  <SelectItem value="ceramica">{t('matches.ceramica_only','Ceramica FC')}</SelectItem>
                  <SelectItem value="global">{t('matches.global','Global Football')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={isArabic ? 'الحالة' : 'Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all','All')}</SelectItem>
                  <SelectItem value="scheduled">{t('matches.scheduled','Scheduled')}</SelectItem>
                  <SelectItem value="live">{t('matches.live','Live')}</SelectItem>
                  <SelectItem value="finished">{t('matches.finished','Finished')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Matches Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-60 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredMatches.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map((match, index) => (
                <MatchCard key={match.id} match={match} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No matches found for this month</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}