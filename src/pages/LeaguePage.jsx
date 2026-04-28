import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Clock, RefreshCw, Crown, TrendingUp, ChevronRight } from 'lucide-react';
import { ceramicaCleopatra } from '@/api/ceramicaCleopatraClient';
import { useLanguage } from '@/components/LanguageContext';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

/* ── Form badge ─────────────────────────────────────────────── */
const FORM = { W: 'bg-green-500', D: 'bg-yellow-500', L: 'bg-red-500' };
function FormBadge({ form = '' }) {
  return (
    <div className="flex gap-0.5 justify-center">
      {form.split('').map((c, i) => (
        <span key={i} className={`w-4 h-4 rounded-sm text-[9px] font-black text-white flex items-center justify-center ${FORM[c] || 'bg-gray-600'}`}>{c}</span>
      ))}
    </div>
  );
}

/* ── Standings table ────────────────────────────────────────── */
function StandingsTable({ teams, league, isArabic }) {
  if (!teams?.length) return null;
  const n = teams.length;
  const cl  = league?.clSlots  || [1, 2, 3, 4];
  const cc  = league?.ccSlots  || [5, 6];
  const rel = league?.relSlots || 0;

  const posColor = (pos) => {
    if (pos === 1)              return 'bg-[#FFD700]';
    if (cl.includes(pos))       return 'bg-green-500';
    if (cc.includes(pos))       return 'bg-blue-400';
    if (rel > 0 && pos > n - rel) return 'bg-red-500';
    return null;
  };

  const ptsBg = (pos) => {
    if (pos === 1)              return 'bg-[#FFD700] text-black';
    if (cl.includes(pos))       return 'bg-green-500 text-white';
    if (cc.includes(pos))       return 'bg-blue-400 text-white';
    if (rel > 0 && pos > n - rel) return 'bg-red-500/80 text-white';
    return 'bg-white/10 text-white';
  };

  const cols = isArabic
    ? [{ key:'pos', label:'#' }, { key:'team', label:'الفريق' }, { key:'P', label:'ل' }, { key:'W', label:'ف' }, { key:'D', label:'ت' }, { key:'L', label:'خ' }, { key:'GF', label:'+' }, { key:'GA', label:'-' }, { key:'GD', label:'ف±' }, { key:'form', label:'شكل' }, { key:'pts', label:'ن' }]
    : [{ key:'pos', label:'#' }, { key:'team', label:'Club' }, { key:'P', label:'MP' }, { key:'W', label:'W' }, { key:'D', label:'D' }, { key:'L', label:'L' }, { key:'GF', label:'GF' }, { key:'GA', label:'GA' }, { key:'GD', label:'GD' }, { key:'form', label:'Form' }, { key:'pts', label:'Pts' }];

  return (
    <div className="overflow-x-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            {cols.map(c => (
              <TableHead key={c.key}
                className={`text-[#FFB81C] font-bold text-xs ${c.key === 'team' ? 'text-left' : 'text-center'} ${c.key === 'form' ? 'hidden md:table-cell' : ''}`}>
                {c.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((t, i) => {
            const bar = posColor(t.position);
            return (
              <motion.tr key={t.team || i}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.025 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="font-bold text-white text-center w-10">
                  <div className="flex items-center gap-1 justify-center">
                    {bar && <span className={`w-1.5 h-7 rounded-full ${bar}`} />}
                    <span className="text-white/70 text-sm">{t.position}</span>
                    {t.position === 1 && <Crown className="w-3 h-3 text-[#FFD700]" />}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5 min-w-[140px]">
                    {t.team_logo
                      ? <img src={t.team_logo} alt={t.team} className="w-7 h-7 object-contain"
                          onError={e => { e.target.style.display = 'none'; }} />
                      : <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center text-white/60 text-[10px] font-bold">{(t.team||'?').slice(0,2).toUpperCase()}</div>}
                    <span className="text-white font-semibold text-sm">{t.team}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center text-white/80 text-sm">{t.played}</TableCell>
                <TableCell className="text-center text-green-400 font-semibold text-sm">{t.won}</TableCell>
                <TableCell className="text-center text-yellow-400 text-sm">{t.drawn}</TableCell>
                <TableCell className="text-center text-red-400 text-sm">{t.lost}</TableCell>
                <TableCell className="text-center text-white/70 text-sm">{t.goals_for}</TableCell>
                <TableCell className="text-center text-white/70 text-sm">{t.goals_against}</TableCell>
                <TableCell className={`text-center font-semibold text-sm ${t.goal_difference > 0 ? 'text-green-400' : t.goal_difference < 0 ? 'text-red-400' : 'text-white/50'}`}>
                  {t.goal_difference > 0 ? '+' : ''}{t.goal_difference}
                </TableCell>
                <TableCell className="hidden md:table-cell"><FormBadge form={t.form} /></TableCell>
                <TableCell className="text-center">
                  <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-black text-sm ${ptsBg(t.position)}`}>
                    {t.points}
                  </span>
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/* ── Match row (results / fixtures) ────────────────────────── */
function MatchRow({ match, isArabic }) {
  const date = match.date ? new Date(match.date) : null;
  const isResult = match.status === 'finished';
  const fallback = (name = '') => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=60&background=1B2852&color=FFB81C`;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors border border-white/5">
      {/* Home */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        <span className="text-white text-sm font-semibold text-right leading-tight max-w-[110px] line-clamp-1">{match.home_team}</span>
        {match.home_logo
          ? <img src={match.home_logo} alt={match.home_team} className="w-7 h-7 object-contain" onError={e => { e.target.src = fallback(match.home_team); }} />
          : <div className="w-7 h-7 rounded bg-white/10 text-white/60 text-[9px] font-bold flex items-center justify-center">{(match.home_team||'?').slice(0,2).toUpperCase()}</div>}
      </div>
      {/* Score / Time */}
      <div className="flex flex-col items-center min-w-[64px]">
        {isResult ? (
          <span className="text-white font-black text-base bg-white/10 px-3 py-0.5 rounded-lg">
            {match.home_score} – {match.away_score}
          </span>
        ) : (
          <>
            {date && <span className="text-[#FFB81C] font-bold text-xs">{date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB', { day:'numeric', month:'short' })}</span>}
            {date && <span className="text-white/50 text-[10px]">{date.toLocaleTimeString(isArabic ? 'ar-EG' : 'en-GB', { hour:'2-digit', minute:'2-digit' })}</span>}
          </>
        )}
        {match.round && <span className="text-white/30 text-[9px] mt-0.5">{match.round}</span>}
      </div>
      {/* Away */}
      <div className="flex items-center gap-2 flex-1">
        {match.away_logo
          ? <img src={match.away_logo} alt={match.away_team} className="w-7 h-7 object-contain" onError={e => { e.target.src = fallback(match.away_team); }} />
          : <div className="w-7 h-7 rounded bg-white/10 text-white/60 text-[9px] font-bold flex items-center justify-center">{(match.away_team||'?').slice(0,2).toUpperCase()}</div>}
        <span className="text-white text-sm font-semibold leading-tight max-w-[110px] line-clamp-1">{match.away_team}</span>
      </div>
    </motion.div>
  );
}

/* ── Legend row ─────────────────────────────────────────────── */
function Legend({ league, isArabic }) {
  if (!league) return null;
  const n = league.relSlots || 0;
  return (
    <div className="p-4 bg-black/20 border-t border-white/10 flex flex-wrap gap-4 text-xs text-white/50">
      <span className="flex items-center gap-1.5"><span className="w-2 h-5 bg-[#FFD700] rounded-full inline-block" />{isArabic ? 'بطل الدوري' : 'Champion'}</span>
      {(league.clSlots||[]).length > 0 && <span className="flex items-center gap-1.5"><span className="w-2 h-5 bg-green-500 rounded-full inline-block" />{isArabic ? 'دوري أبطال أوروبا / أفريقيا' : 'Champions League'}</span>}
      {(league.ccSlots||[]).length > 0 && <span className="flex items-center gap-1.5"><span className="w-2 h-5 bg-blue-400 rounded-full inline-block" />{isArabic ? 'الدوري الأوروبي / الكونفدرالية' : 'Europa / Confederation Cup'}</span>}
      {n > 0 && <span className="flex items-center gap-1.5"><span className="w-2 h-5 bg-red-500 rounded-full inline-block" />{isArabic ? 'منطقة الهبوط' : 'Relegation Zone'}</span>}
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────── */
const LEAGUE_IDS = ['egypt', 'england', 'spain', 'italy', 'germany'];
const LEAGUE_LABELS = {
  egypt:   { ar: 'الدوري المصري', en: 'Egyptian Premier League', flag: '🇪🇬' },
  england: { ar: 'الدوري الإنجليزي', en: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  spain:   { ar: 'الدوري الإسباني', en: 'La Liga', flag: '🇪🇸' },
  italy:   { ar: 'الدوري الإيطالي', en: 'Serie A', flag: '🇮🇹' },
  germany: { ar: 'الدوري الألماني', en: 'Bundesliga', flag: '🇩🇪' },
};

export default function LeaguePage() {
  const { leagueId } = useParams();
  const { isArabic } = useLanguage();
  const [tab, setTab] = useState('standings'); // 'standings' | 'results' | 'fixtures'

  const effectiveId = LEAGUE_IDS.includes(leagueId) ? leagueId : 'egypt';
  const meta = LEAGUE_LABELS[effectiveId] || LEAGUE_LABELS.egypt;

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['league', effectiveId],
    queryFn: () => ceramicaCleopatra.league(effectiveId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const league    = data?.league    || {};
  const standings = data?.standings || [];
  const results   = data?.results   || [];
  const fixtures  = data?.fixtures  || [];

  const tabs = [
    { id: 'standings', labelAr: 'جدول الترتيب', labelEn: 'Standings', icon: Trophy },
    { id: 'results',   labelAr: 'النتائج',       labelEn: 'Results',   icon: TrendingUp },
    { id: 'fixtures',  labelAr: 'المباريات القادمة', labelEn: 'Fixtures', icon: Calendar },
  ];

  const leagueColor = league.color || '#1B2852';

  return (
    <div className="min-h-screen bg-gray-950">
      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${leagueColor}cc 0%, #0a1628 60%)` }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,184,28,0.12),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 py-14 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-6">
            <div className="text-7xl">{meta.flag}</div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-1">
                {isArabic ? meta.ar : meta.en}
              </h1>
              <p className="text-white/50 text-base">{league.season || '2025-2026'}</p>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mt-8 flex-wrap">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                    tab === t.id
                      ? 'text-[#1B2852]'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                  style={tab === t.id ? { backgroundColor: '#FFB81C' } : {}}>
                  <Icon className="w-4 h-4" />
                  {isArabic ? t.labelAr : t.labelEn}
                </button>
              );
            })}
            <button onClick={() => refetch()} disabled={isRefetching}
              className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all text-sm">
              <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
              {isArabic ? 'تحديث' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Standings tab */}
            {tab === 'standings' && (
              <motion.div key="standings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {standings.length === 0 ? (
                  <div className="text-center py-20 text-white/40">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{isArabic ? 'لا تتوفر بيانات' : 'No standings data available'}</p>
                  </div>
                ) : (
                  <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <StandingsTable teams={standings} league={league} isArabic={isArabic} />
                    <Legend league={league} isArabic={isArabic} />
                  </div>
                )}
              </motion.div>
            )}

            {/* Results tab */}
            {tab === 'results' && (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-white font-black text-xl mb-5 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#FFB81C]" />
                  {isArabic ? 'آخر النتائج' : 'Recent Results'}
                </h2>
                {results.length === 0 ? (
                  <div className="text-center py-20 text-white/40">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{isArabic ? 'لا تتوفر نتائج' : 'No results available'}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {results.map((m, i) => <MatchRow key={m.event_id || i} match={m} isArabic={isArabic} />)}
                  </div>
                )}
              </motion.div>
            )}

            {/* Fixtures tab */}
            {tab === 'fixtures' && (
              <motion.div key="fixtures" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-white font-black text-xl mb-5 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#FFB81C]" />
                  {isArabic ? 'المباريات القادمة' : 'Upcoming Fixtures'}
                </h2>
                {fixtures.length === 0 ? (
                  <div className="text-center py-20 text-white/40">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{isArabic ? 'لا توجد مباريات قادمة' : 'No upcoming fixtures'}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {fixtures.map((m, i) => <MatchRow key={m.event_id || i} match={m} isArabic={isArabic} />)}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
