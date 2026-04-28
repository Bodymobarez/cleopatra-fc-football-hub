import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ceramicaCleopatra } from '@/api/ceramicaCleopatraClient';
import { useLanguage } from '@/components/LanguageContext';
import { X, MapPin, Users, Trophy, Activity, Shirt } from 'lucide-react';
import { formatDate } from '@/utils';

/* ── Stat bar row ─────────────────────────────────────────── */
function StatBar({ stat, isArabic }) {
  const home = parseFloat(String(stat.homeValue).replace(/[^0-9.]/g, '')) || 0;
  const away = parseFloat(String(stat.awayValue).replace(/[^0-9.]/g, '')) || 0;
  const total = home + away || 1;
  const homePct = Math.round((home / total) * 100);
  const awayPct = 100 - homePct;

  const statNamesAr = {
    'Ball possession':       'الاستحواذ',
    'Total shots':           'إجمالي التسديدات',
    'Shots on target':       'تسديدات على المرمى',
    'Corner kicks':          'ركلات الزاوية',
    'Passes':                'التمريرات',
    'Yellow cards':          'البطاقات الصفراء',
    'Red cards':             'البطاقات الحمراء',
    'Fouls':                 'الأخطاء',
    'Offsides':              'التسللات',
    'Saves':                 'التصديات',
    'Big chances':           'الفرص الكبيرة',
    'Expected goals (xG)':  'الأهداف المتوقعة',
    'xG on target (xGOT)':  'xG على المرمى',
    'Shots off target':      'تسديدات خارج المرمى',
    'Blocked shots':         'تسديدات محظورة',
    'Free kicks':            'ركلات حرة',
    'Goal kicks':            'ركلات المرمى',
    'Throw-ins':             'رميات تماس',
    'Tackles':               'الاعتراضات',
    'Clearances':            'الإبعادات',
    'Interceptions':         'القطعات',
    'Dribbles':              'المراوغات',
    'Duels won':             'الثنائيات المكسوبة',
  };

  const label = isArabic ? (statNamesAr[stat.statName] || stat.statName) : stat.statName;

  const isPercent = String(stat.homeValue).includes('%');

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-white w-16 text-left">{stat.homeValue}</span>
        <span className="text-white/50 text-xs text-center flex-1">{label}</span>
        <span className="font-bold text-white w-16 text-right">{stat.awayValue}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${isPercent ? home : homePct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-[#FFB81C] rounded-l-full"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${isPercent ? away : awayPct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-white/30 rounded-r-full"
        />
      </div>
    </div>
  );
}

/* ── Incident icon ─────────────────────────────────────────── */
function IncidentIcon({ type }) {
  if (type === '1') return <span className="text-yellow-400 text-sm">🟨</span>;
  if (type === '2') return <span className="text-red-500 text-sm">🟥</span>;
  if (type === '3' || type === '4') return <span className="text-sm">⚽</span>;
  if (type === '5') return <span className="text-sm">↔️</span>;
  return <span className="text-white/30 text-sm">•</span>;
}

/* ── Main Modal ─────────────────────────────────────────────── */
export default function MatchStatsModal({ match, liveMatch, onClose }) {
  const { isArabic } = useLanguage();
  const [activeTab, setActiveTab] = useState('stats');

  const knownEventId = liveMatch?.event_id || match?.api_fixture_id || null;

  // If no eventId, try to find it from Flashscore by team names + date
  const { data: lookupData, isLoading: lookupLoading } = useQuery({
    queryKey: ['match-lookup', match?.home_team, match?.away_team, match?.date],
    queryFn: () => ceramicaCleopatra.matchLookup(
      liveMatch?.home_team || match?.home_team,
      liveMatch?.away_team || match?.away_team,
      liveMatch?.date      || match?.date
    ),
    enabled: !knownEventId && !!(match?.home_team || liveMatch?.home_team),
    staleTime: 10 * 60 * 1000,
  });

  const eventId = knownEventId || lookupData?.eventId || null;

  const { data, isLoading: statsLoading } = useQuery({
    queryKey: ['match-details', eventId],
    queryFn: () => ceramicaCleopatra.matchDetails(eventId),
    enabled: !!eventId,
  });

  const isLoading = lookupLoading || (!!eventId && statsLoading);

  const displayMatch = liveMatch || match;
  const isLive  = displayMatch?.status === 'live' || displayMatch?.status === 'halftime';
  const isFT    = displayMatch?.status === 'finished';

  const homeScore = liveMatch?.home_score ?? match?.home_score ?? 0;
  const awayScore = liveMatch?.away_score ?? match?.away_score ?? 0;
  const homeLogo  = liveMatch?.home_logo  || match?.home_team_logo || '';
  const awayLogo  = liveMatch?.away_logo  || match?.away_team_logo || '';
  const homeName  = liveMatch?.home_team  || match?.home_team || '';
  const awayName  = liveMatch?.away_team  || match?.away_team || '';
  const minute    = liveMatch?.minute;

  const tabs = [
    { id: 'stats',   label: isArabic ? 'الإحصائيات' : 'Stats'   },
    { id: 'events',  label: isArabic ? 'الأحداث'    : 'Events'   },
    { id: 'info',    label: isArabic ? 'معلومات'    : 'Info'     },
  ];

  const statItems = (data?.stats || []).filter(s =>
    !['Expected goals (xG)', 'xG on target (xGOT)'].includes(s.statName) ||
    (parseFloat(s.homeValue) + parseFloat(s.awayValue)) > 0
  ).filter((s, i, a) => a.findIndex(x => x.statName === s.statName) === i);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-b from-[#0a1628] to-[#142040] rounded-3xl border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#1e3a5f] to-[#0a1628] px-6 py-6 shrink-0">
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>

            {/* Competition */}
            <div className="text-center mb-4">
              <span className="text-white/40 text-xs uppercase tracking-widest">{displayMatch?.competition}</span>
              {displayMatch?.round && (
                <span className="ml-2 text-[#FFB81C]/60 text-xs">{isArabic ? `الجولة ${displayMatch.round}` : `Round ${displayMatch.round}`}</span>
              )}
            </div>

            {/* Teams + Score */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden">
                  {homeLogo
                    ? <img src={homeLogo} alt="" className="w-12 h-12 object-contain" onError={e => { e.target.style.display = 'none'; }} />
                    : <span className="text-white font-bold text-sm">{homeName.slice(0, 3)}</span>}
                </div>
                <span className="text-white font-semibold text-sm text-center leading-tight max-w-[80px]">{homeName}</span>
              </div>

              <div className="flex flex-col items-center shrink-0">
                {isLive ? (
                  <>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-red-400 font-black text-sm">
                        {displayMatch?.status === 'halftime' ? (isArabic ? 'ن.و' : 'HT') : `${minute ?? ''}'`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-5xl font-black text-white tabular-nums">{homeScore}</span>
                      <span className="text-white/20 text-3xl">-</span>
                      <span className="text-5xl font-black text-white tabular-nums">{awayScore}</span>
                    </div>
                  </>
                ) : isFT ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white/40 text-xs font-bold uppercase">{isArabic ? 'انتهت' : 'FT'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-5xl font-black text-white tabular-nums">{homeScore}</span>
                      <span className="text-white/20 text-3xl">-</span>
                      <span className="text-5xl font-black text-white tabular-nums">{awayScore}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-white/40 text-xs uppercase tracking-widest mb-1">
                      {formatDate(displayMatch?.date, isArabic, true)}
                    </div>
                    <span className="text-4xl font-black text-white/20">{isArabic ? 'ضد' : 'VS'}</span>
                  </>
                )}
              </div>

              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden">
                  {awayLogo
                    ? <img src={awayLogo} alt="" className="w-12 h-12 object-contain" onError={e => { e.target.style.display = 'none'; }} />
                    : <span className="text-white font-bold text-sm">{awayName.slice(0, 3)}</span>}
                </div>
                <span className="text-white font-semibold text-sm text-center leading-tight max-w-[80px]">{awayName}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          {eventId && (
            <div className="flex border-b border-white/10 shrink-0">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'text-[#FFB81C] border-b-2 border-[#FFB81C]'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {!eventId ? (
              <div className="text-center py-8">
                <Activity className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">
                  {isArabic
                    ? 'الإحصائيات غير متاحة لهذه المباراة'
                    : 'Stats not available — run Matches sync from Admin Panel'}
                </p>
              </div>
            ) : isLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-4 bg-white/10 rounded animate-pulse" />
                    <div className="h-1.5 bg-white/10 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Stats Tab */}
                {activeTab === 'stats' && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-white/40 mb-4 font-bold uppercase tracking-widest">
                      <span>{homeName.split(' ')[0]}</span>
                      <span>{isArabic ? 'الإحصائيات' : 'Statistics'}</span>
                      <span>{awayName.split(' ')[0]}</span>
                    </div>
                    {statItems.length > 0 ? (
                      <div className="space-y-4">
                        {statItems.map((stat, i) => (
                          <StatBar key={i} stat={stat} isArabic={isArabic} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/30 text-sm text-center py-6">
                        {isArabic ? 'الإحصائيات ستظهر أثناء المباراة' : 'Stats will appear during the match'}
                      </p>
                    )}
                  </div>
                )}

                {/* Events Tab */}
                {activeTab === 'events' && (
                  <div>
                    {(data?.events || []).length > 0 ? (
                      <div className="space-y-2">
                        {(data.events).map((ev, i) => {
                          const isHome = ev.incidentSide === '1';
                          return (
                            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl bg-white/5 ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>
                              <IncidentIcon type={ev.incidentType} />
                              <div className={`flex-1 ${isHome ? 'text-left' : 'text-right'}`}>
                                <span className="text-white font-medium text-sm">{ev.incidentPlayerName}</span>
                              </div>
                              <span className="text-[#FFB81C] font-black text-sm shrink-0">{ev.incidentTime}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-white/30 text-sm text-center py-6">
                        {isArabic ? 'لا توجد أحداث بعد' : 'No events yet'}
                      </p>
                    )}
                  </div>
                )}

                {/* Info Tab */}
                {activeTab === 'info' && (
                  <div className="space-y-4">
                    {[
                      { icon: MapPin,  label: isArabic ? 'الملعب' : 'Venue',    value: data?.venue },
                      { icon: MapPin,  label: isArabic ? 'المدينة' : 'City',    value: data?.venueCity },
                      { icon: Users,  label: isArabic ? 'الطاقة الاستيعابية' : 'Capacity', value: data?.capacity },
                      { icon: Shirt,  label: isArabic ? 'الحكم' : 'Referee',   value: data?.referee },
                      { icon: Trophy, label: isArabic ? 'البطولة' : 'Competition', value: displayMatch?.competition },
                    ].filter(r => r.value).map((row, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                        <row.icon className="w-4 h-4 text-[#FFB81C] shrink-0" />
                        <span className="text-white/50 text-sm">{row.label}</span>
                        <span className="text-white font-medium text-sm ml-auto text-right">{row.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
