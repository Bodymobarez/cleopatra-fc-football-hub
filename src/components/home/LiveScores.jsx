import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageContext';

export default function LiveScores({ matches = [] }) {
  const { isArabic } = useLanguage();
  const liveMatches = matches.filter(m => m.status === 'live' || m.status === 'halftime');

  return (
    <div className="bg-[#1B2852] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500" />
            <span className="text-white font-semibold">{isArabic ? 'النتائج المباشرة' : 'Live Scores'}</span>
            {liveMatches.length > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {liveMatches.length} {isArabic ? 'مباشر' : 'LIVE'}
              </span>
            )}
          </div>
          <Link
            to={createPageUrl('MatchCenter')}
            className="text-[#FFB81C] text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            {isArabic ? 'مركز المباريات' : 'Match Center'} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {matches.slice(0, 8).map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 bg-white/5 rounded-xl p-4 min-w-[280px] border border-white/10 hover:border-[#FFB81C]/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/50">{match.competition}</span>
                {(match.status === 'live' || match.status === 'halftime') ? (
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400 font-medium">
                      {match.status === 'halftime'
                        ? (isArabic ? 'ن.و' : 'HT')
                        : `${match.minute ?? ''}'`}
                    </span>
                  </span>
                ) : match.status === 'finished' ? (
                  <span className="text-xs text-white/50">{isArabic ? 'انتهت' : 'FT'}</span>
                ) : (
                  <span className="text-xs text-white/50">
                    {new Date(match.date).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {[
                  { logo: match.home_team_logo || match.home_logo, name: match.home_team, score: match.home_score },
                  { logo: match.away_team_logo || match.away_logo, name: match.away_team, score: match.away_score },
                ].map((team, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                        {team.logo
                          ? <img src={team.logo} alt="" className="w-4 h-4 object-contain" />
                          : <span className="text-[8px] font-bold text-white">{team.name?.slice(0, 2)}</span>}
                      </div>
                      <span className="text-white text-sm font-medium truncate max-w-[140px]">{team.name}</span>
                    </div>
                    <span className="text-white font-bold">{team.score ?? '-'}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {matches.length === 0 && (
            <div className="text-white/50 text-sm py-4">
              {isArabic ? 'لا توجد مباريات اليوم' : 'No matches today'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
