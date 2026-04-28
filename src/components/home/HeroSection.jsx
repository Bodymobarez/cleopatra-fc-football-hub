import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl, formatDate } from '@/utils';
import { ChevronRight, Calendar, MapPin, Clock, Trophy, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';
import { ceramicaCleopatra } from '@/api/ceramicaCleopatraClient';
import { useQuery } from '@tanstack/react-query';

/* ── Animated flip-clock unit ──────────────────────────── */
function FlipUnit({ value, label }) {
  const str = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative bg-[#0a1628]/80 border border-white/10 rounded-xl w-16 h-16 flex items-center justify-center overflow-hidden shadow-lg">
        {/* Top half */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/5 border-b border-white/10" />
        <AnimatePresence mode="wait">
          <motion.span
            key={str}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="text-3xl font-black text-white tabular-nums z-10"
          >
            {str}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">{label}</span>
    </div>
  );
}

/* ── Countdown hook ─────────────────────────────────────── */
function useCountdown(dateStr) {
  const [cd, setCd] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    if (!dateStr) return;
    const tick = () => {
      const diff = new Date(dateStr).getTime() - Date.now();
      if (diff <= 0) return setCd({ d: 0, h: 0, m: 0, s: 0 });
      setCd({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dateStr]);
  return cd;
}

/* ── Team Logo ──────────────────────────────────────────── */
function TeamLogo({ logo, name, size = 'md' }) {
  const dim = size === 'lg' ? 'w-20 h-20' : 'w-14 h-14';
  const imgDim = size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
  return (
    <div className={`${dim} rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden`}>
      {logo
        ? <img src={logo} alt={name} className={`${imgDim} object-contain`} onError={e => { e.target.style.display = 'none'; }} />
        : <span className="text-white font-black text-sm">{name?.slice(0, 3)}</span>}
    </div>
  );
}

export default function HeroSection() {
  const { isArabic } = useLanguage();

  const { data: fixtures = {} } = useQuery({
    queryKey: ['ceramica-fixtures'],
    queryFn: () => ceramicaCleopatra.ceramicaFixtures(),
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
    staleTime: 2 * 60 * 1000,
  });

  const lastResult = fixtures.lastResult || null;
  const nextMatch  = fixtures.nextMatch  || null;
  const cd = useCountdown(nextMatch?.date);

  const cdUnits = [
    { value: cd.d, label: isArabic ? 'يوم'  : 'Days' },
    { value: cd.h, label: isArabic ? 'ساعة' : 'Hrs'  },
    { value: cd.m, label: isArabic ? 'دقيقة': 'Min'  },
    { value: cd.s, label: isArabic ? 'ثانية': 'Sec'  },
  ];

  /* result outcome helper */
  const getOutcome = (m) => {
    if (!m) return null;
    const ceramicaNames = ['ceramica', 'cleopatra'];
    const isHome = ceramicaNames.some(k => (m.home_team || '').toLowerCase().includes(k));
    const cs = parseInt(m.home_score ?? 0);
    const as = parseInt(m.away_score ?? 0);
    const [mine, theirs] = isHome ? [cs, as] : [as, cs];
    if (mine > theirs) return { label: isArabic ? 'فوز' : 'WIN', color: 'bg-green-500 text-white' };
    if (mine < theirs) return { label: isArabic ? 'خسارة' : 'LOSS', color: 'bg-red-500 text-white' };
    return { label: isArabic ? 'تعادل' : 'DRAW', color: 'bg-yellow-500 text-[#0a1628]' };
  };
  const outcome = getOutcome(lastResult);

  return (
    <section className="relative min-h-[85vh] bg-gradient-to-br from-[#1B2852] via-[#C8102E] to-[#1B2852] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1920')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B2852] via-transparent to-transparent" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full border border-[#FFB81C]/10" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full border border-white/5" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* ── LEFT — Club + Last Result ───────────────────── */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
            className="space-y-8">

            {/* Club badge */}
            <div className="space-y-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
                className="inline-flex items-center gap-2 bg-[#FFB81C]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#FFB81C]/30">
                <Trophy className="w-4 h-4 text-[#FFB81C]" />
                <span className="text-[#FFB81C] text-sm font-medium">
                  {isArabic ? 'الدوري المصري الممتاز' : 'Egyptian Premier League'}
                </span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-black text-white leading-none">
                CERAMICA
                <span className="block text-[#FFB81C]">CLEOPATRA</span>
                <span className="block text-2xl md:text-3xl font-light text-white/60 mt-2">FOOTBALL CLUB</span>
              </h1>
            </div>

            {/* Last Result card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              {lastResult ? (
                <Link to={createPageUrl('Matches')}
                  className="block bg-white/8 backdrop-blur-xl rounded-2xl border border-white/15 p-5 hover:border-[#FFB81C]/40 transition-all group">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-white/50 text-xs uppercase tracking-widest">
                      {isArabic ? 'آخر نتيجة' : 'Latest Result'}
                    </span>
                    {outcome && (
                      <span className={`ml-auto px-3 py-0.5 rounded-full text-xs font-black ${outcome.color}`}>
                        {outcome.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <TeamLogo logo={lastResult.home_team_logo || lastResult.home_logo} name={lastResult.home_team} />
                      <span className="text-white font-semibold text-sm truncate hidden sm:block">{lastResult.home_team}</span>
                    </div>
                    <div className="flex flex-col items-center shrink-0 px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-4xl font-black text-white tabular-nums">{lastResult.home_score ?? 0}</span>
                        <span className="text-white/30 text-2xl font-light">-</span>
                        <span className="text-4xl font-black text-white tabular-nums">{lastResult.away_score ?? 0}</span>
                      </div>
                      <span className="text-[#FFB81C] text-xs font-black mt-1 uppercase">
                        {isArabic ? 'انتهت' : 'FT'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                      <span className="text-white font-semibold text-sm truncate hidden sm:block">{lastResult.away_team}</span>
                      <TeamLogo logo={lastResult.away_team_logo || lastResult.away_logo} name={lastResult.away_team} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-white/30 text-xs">
                    <span>{lastResult.competition}</span>
                    <span>{formatDate(lastResult.date, isArabic, true)}</span>
                  </div>
                </Link>
              ) : (
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 text-center">
                  <span className="text-white/30 text-sm">
                    {isArabic ? 'لا توجد نتائج بعد' : 'No recent results'}
                  </span>
                </div>
              )}
            </motion.div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl('Squad')}
                className="px-8 py-4 bg-[#FFB81C] text-[#1B2852] font-bold rounded-xl hover:bg-[#f5a815] transition-all hover:scale-105 shadow-lg shadow-[#FFB81C]/25">
                {isArabic ? 'عرض الفريق' : 'View Squad'}
              </Link>
              <Link to={createPageUrl('News')}
                className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 backdrop-blur-sm">
                {isArabic ? 'آخر الأخبار' : 'Latest News'}
              </Link>
            </div>
          </motion.div>

          {/* ── RIGHT — Next Match + Countdown ──────────────── */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:pl-8">
            {nextMatch ? (
              <Link to={createPageUrl('Matches')}
                className="block bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden hover:border-[#FFB81C]/40 transition-all group">

                {/* Header bar */}
                <div className="bg-gradient-to-r from-[#FFB81C] to-yellow-400 px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#1B2852]" />
                    <span className="text-[#1B2852] font-black text-sm uppercase tracking-wider">
                      {isArabic ? 'المباراة القادمة' : 'Next Match'}
                    </span>
                  </div>
                  {nextMatch.competition && (
                    <span className="text-[#1B2852]/60 text-xs font-semibold truncate max-w-[160px]">
                      {nextMatch.competition}
                    </span>
                  )}
                </div>

                <div className="p-8 space-y-8">
                  {/* Teams */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <TeamLogo logo={nextMatch.home_team_logo || nextMatch.home_logo} name={nextMatch.home_team} size="lg" />
                      <span className="text-white font-semibold text-sm text-center leading-tight">{nextMatch.home_team}</span>
                    </div>
                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-4xl font-black text-white/25 mb-1">{isArabic ? 'ضد' : 'VS'}</span>
                      {nextMatch.round && (
                        <span className="text-[#FFB81C]/70 text-xs font-bold">
                          {isArabic ? `الجولة ${nextMatch.round}` : `Round ${nextMatch.round}`}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <TeamLogo logo={nextMatch.away_team_logo || nextMatch.away_logo} name={nextMatch.away_team} size="lg" />
                      <span className="text-white font-semibold text-sm text-center leading-tight">{nextMatch.away_team}</span>
                    </div>
                  </div>

                  {/* Countdown */}
                  <div>
                    <div className="text-center text-white/30 text-xs uppercase tracking-widest mb-4">
                      {isArabic ? 'العد التنازلي' : 'Countdown'}
                    </div>
                    <div className="flex items-end justify-center gap-2">
                      {cdUnits.map((u, i) => (
                        <React.Fragment key={u.label}>
                          <FlipUnit value={u.value} label={u.label} />
                          {i < 3 && (
                            <span className="text-white/20 font-black text-2xl mb-7 shrink-0">:</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Match meta */}
                  <div className="space-y-2.5 bg-white/5 rounded-2xl px-4 py-4">
                    <div className="flex items-center gap-3 text-white/60">
                      <Calendar className="w-4 h-4 text-[#FFB81C] shrink-0" />
                      <span className="text-sm">
                        {new Date(nextMatch.date).toLocaleDateString(
                          isArabic ? 'ar-EG' : 'en-US',
                          { weekday: 'long', day: 'numeric', month: 'long' }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-white/60">
                      <Clock className="w-4 h-4 text-[#FFB81C] shrink-0" />
                      <span className="text-sm">
                        {new Date(nextMatch.date).toLocaleTimeString(
                          isArabic ? 'ar-EG' : 'en-US',
                          { hour: '2-digit', minute: '2-digit' }
                        )}
                      </span>
                    </div>
                    {nextMatch.venue && (
                      <div className="flex items-center gap-3 text-white/60">
                        <MapPin className="w-4 h-4 text-[#FFB81C] shrink-0" />
                        <span className="text-sm truncate">{nextMatch.venue}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[#FFB81C]/60 text-sm group-hover:text-[#FFB81C] transition-colors">
                    {isArabic ? 'جميع المباريات' : 'View All Fixtures'}
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ) : (
              /* No next match fallback — show club crest */
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden p-12 text-center space-y-6">
                <motion.img
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695e73c9350940eda2779d4d/62a3057fb_Ceramica_Cleopatra_FC_logo.png"
                  alt="Ceramica Cleopatra FC"
                  className="h-40 w-auto mx-auto drop-shadow-2xl"
                />
                <div>
                  <p className="text-white font-black text-2xl">CERAMICA CLEOPATRA FC</p>
                  <p className="text-white/40 text-sm mt-2">
                    {isArabic ? 'لا توجد مباريات قادمة' : 'No upcoming fixtures'}
                  </p>
                </div>
                <Link to={createPageUrl('Squad')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFB81C] text-[#1B2852] rounded-xl font-bold hover:bg-yellow-400 transition-colors">
                  <Star className="w-4 h-4" />
                  {isArabic ? 'قائمة الفريق' : 'View Squad'}
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
