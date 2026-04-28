import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/components/LanguageContext';

export default function MatchCard({ match, index = 0, variant = 'default' }) {
  const { isArabic } = useLanguage();
  const isLive      = match.status === 'live' || match.status === 'halftime';
  const isFinished  = match.status === 'finished';
  const isScheduled = match.status === 'scheduled';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={createPageUrl('MatchDetails') + `?id=${match.id}`} className="block group">
        <div className={`relative overflow-hidden rounded-2xl border transition-all ${
          variant === 'compact'
            ? 'bg-white border-gray-100 hover:border-[#d4af37]/50 hover:shadow-lg p-4'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-100 hover:border-[#d4af37]/50 hover:shadow-xl p-6'
        }`}>
          {/* Competition + Status badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">{match.competition}</span>
            {isLive && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {match.status === 'halftime'
                  ? (isArabic ? 'ن.و' : 'HT')
                  : `${isArabic ? 'مباشر' : 'LIVE'} ${match.minute ?? ''}'`}
              </span>
            )}
            {isFinished && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                {isArabic ? 'انتهت' : 'FT'}
              </span>
            )}
            {isScheduled && match.round && (
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                {match.round}
              </span>
            )}
          </div>

          {/* Teams & Score */}
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <div className={`mx-auto mb-3 rounded-xl bg-gray-50 flex items-center justify-center ${
                variant === 'compact' ? 'w-12 h-12' : 'w-16 h-16'
              }`}>
                {match.home_team_logo ? (
                  <img src={match.home_team_logo} alt="" className={`${variant === 'compact' ? 'w-8 h-8' : 'w-12 h-12'} object-contain`} />
                ) : (
                  <span className="text-lg font-bold text-[#0a1628]">{match.home_team?.slice(0, 3)}</span>
                )}
              </div>
              <h4 className={`font-bold text-[#0a1628] ${variant === 'compact' ? 'text-sm' : 'text-base'}`}>
                {match.home_team}
              </h4>
            </div>

            <div className="px-4 text-center">
              {isScheduled ? (
                <span className="text-3xl font-black text-gray-300">{isArabic ? 'ضد' : 'VS'}</span>
              ) : (
                <div className="flex items-center gap-3">
                  <span className={`${variant === 'compact' ? 'text-2xl' : 'text-4xl'} font-black text-[#0a1628]`}>
                    {match.home_score}
                  </span>
                  <span className="text-xl text-gray-300">-</span>
                  <span className={`${variant === 'compact' ? 'text-2xl' : 'text-4xl'} font-black text-[#0a1628]`}>
                    {match.away_score}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 text-center">
              <div className={`mx-auto mb-3 rounded-xl bg-gray-50 flex items-center justify-center ${
                variant === 'compact' ? 'w-12 h-12' : 'w-16 h-16'
              }`}>
                {match.away_team_logo ? (
                  <img src={match.away_team_logo} alt="" className={`${variant === 'compact' ? 'w-8 h-8' : 'w-12 h-12'} object-contain`} />
                ) : (
                  <span className="text-lg font-bold text-[#0a1628]">{match.away_team?.slice(0, 3)}</span>
                )}
              </div>
              <h4 className={`font-bold text-[#0a1628] ${variant === 'compact' ? 'text-sm' : 'text-base'}`}>
                {match.away_team}
              </h4>
            </div>
          </div>

          {/* Match Info */}
          <div className={`flex items-center justify-center gap-6 text-gray-400 text-sm mt-4 pt-4 border-t border-gray-100 ${
            variant === 'compact' ? 'gap-4 text-xs' : ''
          }`}>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(match.date), isArabic ? 'd MMM yyyy' : 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {format(new Date(match.date), 'HH:mm')}
            </span>
            {match.venue && variant !== 'compact' && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {match.venue}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
