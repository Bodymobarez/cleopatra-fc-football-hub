import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { formatDate } from '@/utils';
import MatchStatsModal from './MatchStatsModal';

/* ── Live minute ticker ──────────────────────────────────── */
function useLiveMinute(match) {
  const [minute, setMinute] = useState(match.minute ?? null);

  useEffect(() => {
    if (match.status !== 'live') { setMinute(match.minute); return; }

    const compute = () => {
      const su = parseInt(match.stage_start_utime || 0);
      if (!su) { setMinute(match.minute); return; }
      const now = Math.floor(Date.now() / 1000);
      const elapsed = Math.max(0, now - su);
      const isSecondHalf = String(match.stage_id) === '13';
      const base = isSecondHalf ? 45 : 0;
      setMinute(Math.min(base + Math.floor(elapsed / 60) + 1, isSecondHalf ? 95 : 45));
    };

    compute();
    const id = setInterval(compute, 15000);
    return () => clearInterval(id);
  }, [match.status, match.stage_start_utime, match.stage_id, match.minute]);

  return minute;
}

export default function MatchCard({ match, liveMatch, index = 0, variant = 'default' }) {
  const { isArabic } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  // If liveMatch is provided, use its data for live status/score
  const displayMatch = liveMatch
    ? { ...match, status: liveMatch.status, home_score: liveMatch.home_score, away_score: liveMatch.away_score,
        minute: liveMatch.minute, stage_start_utime: liveMatch.stage_start_utime, stage_id: liveMatch.stage_id }
    : match;

  const isLive      = displayMatch.status === 'live' || displayMatch.status === 'halftime';
  const isFinished  = displayMatch.status === 'finished';
  const isScheduled = displayMatch.status === 'scheduled';
  const minute = useLiveMinute(displayMatch);
  const canOpenStats = isLive || isFinished || match.api_fixture_id;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 }}
      >
        <div
          onClick={() => setShowModal(true)}
          className={`relative overflow-hidden rounded-2xl border transition-all cursor-pointer select-none ${
            isLive
              ? 'bg-gradient-to-br from-red-950/40 to-[#0a1628] border-red-500/30 hover:border-red-500/60 shadow-lg shadow-red-900/20'
              : variant === 'compact'
                ? 'bg-white border-gray-100 hover:border-[#d4af37]/50 hover:shadow-lg p-4'
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-100 hover:border-[#d4af37]/50 hover:shadow-xl p-6'
          } ${variant !== 'compact' && !isLive ? 'p-6' : !isLive ? 'p-4' : 'p-6'}`}
        >
          {/* Live glow pulse */}
          {isLive && (
            <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none rounded-2xl" />
          )}

          {/* Competition + Status */}
          <div className="flex items-center justify-between mb-4">
            <span className={`text-sm font-medium truncate max-w-[60%] ${isLive ? 'text-white/50' : 'text-gray-500'}`}>
              {match.competition}
            </span>

            {isLive && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white text-xs font-black rounded-full shrink-0">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={minute}
                    initial={{ y: -6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 6, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {displayMatch.status === 'halftime'
                      ? (isArabic ? 'ن.و' : 'HT')
                      : minute != null ? `${minute}'` : (isArabic ? 'مباشر' : 'LIVE')}
                  </motion.span>
                </AnimatePresence>
              </span>
            )}
            {isFinished && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full shrink-0">
                {isArabic ? 'انتهت' : 'FT'}
              </span>
            )}
            {isScheduled && match.round && (
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full shrink-0">
                {isArabic ? `الجولة ${match.round}` : `Round ${match.round}`}
              </span>
            )}
          </div>

          {/* Teams & Score */}
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <div className={`mx-auto mb-3 rounded-xl flex items-center justify-center overflow-hidden ${
                isLive ? 'bg-white/10' : 'bg-gray-50'
              } ${variant === 'compact' ? 'w-12 h-12' : 'w-16 h-16'}`}>
                {(match.home_team_logo || liveMatch?.home_logo) ? (
                  <img
                    src={match.home_team_logo || liveMatch?.home_logo}
                    alt=""
                    className={`${variant === 'compact' ? 'w-8 h-8' : 'w-12 h-12'} object-contain`}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span className={`text-lg font-bold ${isLive ? 'text-white' : 'text-[#0a1628]'}`}>
                    {match.home_team?.slice(0, 3)}
                  </span>
                )}
              </div>
              <h4 className={`font-bold ${isLive ? 'text-white' : 'text-[#0a1628]'} ${variant === 'compact' ? 'text-sm' : 'text-base'}`}>
                {match.home_team}
              </h4>
            </div>

            <div className="px-4 text-center">
              {isScheduled ? (
                <span className={`text-3xl font-black ${isLive ? 'text-white/20' : 'text-gray-300'}`}>
                  {isArabic ? 'ضد' : 'VS'}
                </span>
              ) : (
                <div className="flex items-center gap-3">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`h-${displayMatch.home_score}`}
                      initial={{ scale: 1.3, color: '#FFB81C' }}
                      animate={{ scale: 1, color: isLive ? '#ffffff' : '#0a1628' }}
                      className={`${variant === 'compact' ? 'text-2xl' : 'text-4xl'} font-black tabular-nums`}
                    >
                      {displayMatch.home_score ?? 0}
                    </motion.span>
                  </AnimatePresence>
                  <span className={`text-xl ${isLive ? 'text-white/20' : 'text-gray-300'}`}>-</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`a-${displayMatch.away_score}`}
                      initial={{ scale: 1.3, color: '#FFB81C' }}
                      animate={{ scale: 1, color: isLive ? '#ffffff' : '#0a1628' }}
                      className={`${variant === 'compact' ? 'text-2xl' : 'text-4xl'} font-black tabular-nums`}
                    >
                      {displayMatch.away_score ?? 0}
                    </motion.span>
                  </AnimatePresence>
                </div>
              )}
              {canOpenStats && (
                <div className="mt-2 text-[10px] text-[#FFB81C]/60 uppercase tracking-widest font-bold">
                  {isArabic ? 'إحصائيات ↑' : '↑ stats'}
                </div>
              )}
            </div>

            <div className="flex-1 text-center">
              <div className={`mx-auto mb-3 rounded-xl flex items-center justify-center overflow-hidden ${
                isLive ? 'bg-white/10' : 'bg-gray-50'
              } ${variant === 'compact' ? 'w-12 h-12' : 'w-16 h-16'}`}>
                {(match.away_team_logo || liveMatch?.away_logo) ? (
                  <img
                    src={match.away_team_logo || liveMatch?.away_logo}
                    alt=""
                    className={`${variant === 'compact' ? 'w-8 h-8' : 'w-12 h-12'} object-contain`}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span className={`text-lg font-bold ${isLive ? 'text-white' : 'text-[#0a1628]'}`}>
                    {match.away_team?.slice(0, 3)}
                  </span>
                )}
              </div>
              <h4 className={`font-bold ${isLive ? 'text-white' : 'text-[#0a1628]'} ${variant === 'compact' ? 'text-sm' : 'text-base'}`}>
                {match.away_team}
              </h4>
            </div>
          </div>

          {/* Match Info */}
          <div className={`flex items-center justify-center gap-6 text-sm mt-4 pt-4 border-t ${
            isLive ? 'border-white/10 text-white/30' : 'border-gray-100 text-gray-400'
          } ${variant === 'compact' ? 'gap-4 text-xs' : ''}`}>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(match.date, isArabic, true)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(match.date).toLocaleTimeString(
                isArabic ? 'ar-EG' : 'en-US',
                { hour: '2-digit', minute: '2-digit', hour12: false }
              )}
            </span>
            {match.venue && variant !== 'compact' && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate max-w-[120px]">{match.venue}</span>
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {showModal && (
        <MatchStatsModal
          match={match}
          liveMatch={liveMatch}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
