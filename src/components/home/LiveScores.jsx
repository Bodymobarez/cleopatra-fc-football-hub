import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ChevronRight, Clock, Wifi, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageContext';
import { ceramicaCleopatra } from '@/api/ceramicaCleopatraClient';

const CERAMICA_NAMES = ['ceramica', 'cleopatra', 'سيراميكا', 'كليوباترا'];
const isCeramica = (name) =>
  CERAMICA_NAMES.some(k => String(name || '').toLowerCase().includes(k));

const LIVE_STAGE_IDS   = new Set(['12','13','38','2','6','31','32']);
const HT_STAGE_IDS     = new Set(['40','41']);

// ── Live clock ticker (seconds precision) ───────────────────────
function useLiveClock(match) {
  const [clock, setClock] = useState({ min: null, sec: null });

  useEffect(() => {
    if (match.status !== 'live') { setClock({ min: match.minute ?? null, sec: null }); return; }

    const compute = () => {
      const su = parseInt(match.stage_start_utime || 0);
      if (!su) { setClock({ min: match.minute ?? null, sec: null }); return; }

      const now    = Date.now() / 1000;
      const elapsedSec = Math.max(0, now - su);
      const isSecondHalf = String(match.stage_id) === '13';
      const baseMin = isSecondHalf ? 45 : 0;
      const maxMin  = isSecondHalf ? 95 : 45; // allow 5 min injury time

      const rawMin = baseMin + Math.floor(elapsedSec / 60) + 1;
      const sec    = Math.floor(elapsedSec % 60);
      setClock({ min: Math.min(rawMin, maxMin), sec });
    };

    compute();
    const id = setInterval(compute, 1000); // tick every second
    return () => clearInterval(id);
  }, [match.status, match.stage_start_utime, match.stage_id, match.minute]);

  return clock;
}

// ── Status badge for a live match ───────────────────────────────
function LiveBadge({ match, clock, isArabic }) {
  const isLive = match.status === 'live';
  const isHT   = match.status === 'halftime';
  const isFT   = match.status === 'finished';
  const isSecondHalf = String(match.stage_id) === '13';

  if (isHT) {
    return (
      <span className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-500/20 border border-yellow-400/40 rounded-full shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        <span className="text-yellow-300 font-black text-[11px]">
          {isArabic ? 'استراحة' : 'Half Time'}
        </span>
      </span>
    );
  }

  if (isLive) {
    const { min, sec } = clock;
    const pad = (n) => String(n ?? 0).padStart(2, '0');
    const timeStr = min != null
      ? `${min}:${pad(sec)}`
      : (isArabic ? 'مباشر' : 'LIVE');

    return (
      <span className="flex items-center gap-1.5 shrink-0">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-red-400 font-black text-sm tabular-nums">{timeStr}</span>
        {isSecondHalf && (
          <span className="text-[9px] text-white/30 font-bold uppercase">
            {isArabic ? 'ش٢' : '2H'}
          </span>
        )}
      </span>
    );
  }

  if (isFT) {
    return <span className="text-xs text-white/50 font-medium">{isArabic ? 'انتهت' : 'FT'}</span>;
  }

  return (
    <span className="text-xs text-white/40 flex items-center gap-1">
      <Clock className="w-3 h-3" />
      {new Date(match.date).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}

// ── Match Card ──────────────────────────────────────────────────
function MatchCard({ match, index, isArabic }) {
  const clock = useLiveClock(match);
  const isLive = match.status === 'live';
  const isHT   = match.status === 'halftime';
  const isFT   = match.status === 'finished';
  const isCeramicaMatch = isCeramica(match.home_team) || isCeramica(match.away_team);

  return (
    <motion.div
      key={match.event_id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`flex-shrink-0 rounded-2xl p-4 min-w-[260px] border transition-all
        ${isCeramicaMatch
          ? 'bg-gradient-to-br from-[#FFB81C]/10 to-white/5 border-[#FFB81C]/40 shadow-[#FFB81C]/10 shadow-lg'
          : 'bg-white/5 border-white/10 hover:border-white/20'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-white/40 truncate max-w-[140px]">{match.competition}</span>
        <LiveBadge match={match} clock={clock} isArabic={isArabic} />
      </div>

      {/* Teams + Scores */}
      <div className="space-y-2.5">
        {[
          { logo: match.home_logo, name: match.home_team, score: match.home_score },
          { logo: match.away_logo, name: match.away_team, score: match.away_score },
        ].map((team, i) => {
          const isThisTeamCeramica = isCeramica(team.name);
          return (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {team.logo
                    ? <img
                        src={team.logo}
                        alt=""
                        className="w-5 h-5 object-contain"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    : <span className="text-[9px] font-bold text-white">{team.name?.slice(0, 2)}</span>}
                </div>
                <span className={`text-sm font-medium truncate ${isThisTeamCeramica ? 'text-[#FFB81C]' : 'text-white'}`}>
                  {team.name}
                </span>
              </div>
              {(isLive || isHT || isFT) ? (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`${team.name}-${team.score}`}
                    initial={{ scale: 1.4, color: '#FFB81C' }}
                    animate={{ scale: 1, color: isThisTeamCeramica ? '#FFB81C' : '#ffffff' }}
                    transition={{ duration: 0.4 }}
                    className="font-black text-lg tabular-nums shrink-0"
                  >
                    {team.score ?? 0}
                  </motion.span>
                </AnimatePresence>
              ) : (
                <span className="text-white/20 text-sm shrink-0">—</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Ceramica badge */}
      {isCeramicaMatch && (
        <div className="mt-3 pt-2.5 border-t border-[#FFB81C]/20">
          <span className="text-[#FFB81C] text-[10px] font-black uppercase tracking-wider">
            ★ {isArabic ? 'مباراة سيراميكا' : 'Ceramica Match'}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ── Main LiveScores ─────────────────────────────────────────────
export default function LiveScores() {
  const { isArabic } = useLanguage();
  const [liveData, setLiveData] = useState({ matches: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);

  const fetchLive = async () => {
    try {
      const data = await ceramicaCleopatra.liveScores();
      setLiveData(data || { matches: [], count: 0 });
      setLastUpdate(new Date());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLive();
    intervalRef.current = setInterval(fetchLive, 45000); // poll every 45 seconds
    return () => clearInterval(intervalRef.current);
  }, []);

  const matches = liveData.matches || [];
  const liveCount = matches.filter(m => m.status === 'live' || m.status === 'halftime').length;

  return (
    <div className="bg-[#1B2852] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-red-500" />
            <span className="text-white font-semibold">
              {isArabic ? 'النتائج المباشرة' : 'Live Scores'}
            </span>

            {liveCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-black rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                {liveCount} {isArabic ? 'مباشر' : 'LIVE'}
              </span>
            )}

            {/* Connection indicator */}
            <span className={`flex items-center gap-1 text-[10px] ${error ? 'text-red-400' : 'text-green-400/70'}`}>
              {error ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
              {lastUpdate && !error && (
                <span className="hidden sm:inline">
                  {isArabic ? 'تحديث كل 45ث' : 'Updates every 45s'}
                </span>
              )}
            </span>
          </div>

          <Link
            to={createPageUrl('MatchCenter')}
            className="text-[#FFB81C] text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            {isArabic ? 'مركز المباريات' : 'Match Center'} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Match cards */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {loading && (
            <div className="flex gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex-shrink-0 rounded-2xl p-4 min-w-[260px] bg-white/5 border border-white/10 animate-pulse">
                  <div className="h-3 bg-white/10 rounded mb-4 w-3/4" />
                  <div className="space-y-3">
                    <div className="h-5 bg-white/10 rounded w-full" />
                    <div className="h-5 bg-white/10 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && matches.length === 0 && (
            <div className="text-white/40 text-sm py-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {isArabic ? 'لا توجد مباريات مصرية الآن' : 'No Egyptian matches right now'}
            </div>
          )}

          {!loading && matches.map((match, index) => (
            <MatchCard
              key={match.event_id || index}
              match={match}
              index={index}
              isArabic={isArabic}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
