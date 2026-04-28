import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl, formatDate } from '@/utils';
import { useLanguage } from '@/components/LanguageContext';
import {
  ChevronRight, ChevronLeft, Calendar, MapPin, Clock,
  Trophy, Newspaper, TrendingUp, Star
} from 'lucide-react';

/* ── Countdown hook ──────────────────────────────────────────── */
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

/* ── Small Flip-clock digit ──────────────────────────────────── */
function FlipUnit({ value, label }) {
  const str = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center">
      <div className="bg-[#0a1628] border border-white/10 rounded-lg px-2.5 py-1.5 min-w-[42px] text-center shadow-inner">
        <AnimatePresence mode="wait">
          <motion.span
            key={str}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="text-xl font-black text-white tabular-nums block"
          >
            {str}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[10px] text-white/40 mt-0.5 uppercase tracking-widest">{label}</span>
    </div>
  );
}

/* ── Sliding News+Standings panel ───────────────────────────── */
const SLIDE_INTERVAL = 4500;

function NewsStandingsSlider({ news, standings, isArabic }) {
  const items = buildSliderItems(news, standings, isArabic);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  const restart = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % items.length), SLIDE_INTERVAL);
  };

  useEffect(() => {
    if (!items.length) return;
    restart();
    return () => clearInterval(timerRef.current);
  }, [items.length]);

  const go = (dir) => {
    setIdx(i => (i + dir + items.length) % items.length);
    restart();
  };

  if (!items.length) return null;

  const item = items[idx];

  return (
    <div className="flex-1 min-w-0 flex items-center gap-3 relative">
      {/* Prev */}
      <button
        onClick={() => go(-1)}
        className="shrink-0 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-white/70" />
      </button>

      {/* Card */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            {item.type === 'news' ? (
              <Link
                to={createPageUrl('NewsDetail') + `?id=${item.data.id}`}
                className="flex items-center gap-3 group"
              >
                <div className="shrink-0 w-9 h-9 rounded-lg bg-[#FFB81C]/20 flex items-center justify-center">
                  <Newspaper className="w-4 h-4 text-[#FFB81C]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-[#FFB81C] font-bold uppercase tracking-wider block">
                    {isArabic ? 'خبر' : 'News'}
                  </span>
                  <p className="text-white text-sm font-medium truncate group-hover:text-[#FFB81C] transition-colors">
                    {item.data.title}
                  </p>
                </div>
              </Link>
            ) : (
              <Link to={createPageUrl('Standings')} className="flex items-center gap-3 group">
                <div className="shrink-0 w-9 h-9 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-[#FFB81C]" />
                </div>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-white/50 text-xs font-bold w-5 text-center">{item.data.rank}</span>
                  {item.data.logo && (
                    <img
                      src={item.data.logo}
                      alt=""
                      className="w-6 h-6 object-contain"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-[#FFB81C] font-bold uppercase tracking-wider block">
                      {isArabic ? 'الترتيب' : 'Standings'}
                    </span>
                    <p className={`text-sm font-medium truncate transition-colors ${item.data.isCeramica ? 'text-[#FFB81C]' : 'text-white group-hover:text-[#FFB81C]'}`}>
                      {item.data.isCeramica && <Star className="w-3 h-3 inline mr-1 text-[#FFB81C]" />}
                      {item.data.name}
                    </p>
                  </div>
                  <div className="shrink-0 flex gap-3 text-xs">
                    <span className="text-white/60">{isArabic ? 'ل' : 'P'} <span className="text-white font-bold">{item.data.played}</span></span>
                    <span className="text-[#FFB81C] font-black">{item.data.points} {isArabic ? 'ن' : 'pts'}</span>
                  </div>
                </div>
              </Link>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next */}
      <button
        onClick={() => go(1)}
        className="shrink-0 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-white/70" />
      </button>

      {/* Dot indicators */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => { setIdx(i); restart(); }}
            className={`w-1 h-1 rounded-full transition-all ${i === idx ? 'bg-[#FFB81C] w-3' : 'bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
}

function buildSliderItems(news, standings, isArabic) {
  const items = [];
  const ceramicaNames = ['ceramica', 'كليوباترا', 'سيراميكا'];
  const isCeramica = (name) => ceramicaNames.some(k => String(name).toLowerCase().includes(k));

  standings.forEach((team, i) => {
    const name = team.name || team.team || team.teamName || '';
    items.push({
      type: 'standing',
      data: {
        rank: i + 1,
        name,
        logo: team.logo || team.teamLogo || null,
        played: team.played ?? team.gamesPlayed ?? team.mp ?? '—',
        points: team.points ?? team.pts ?? '—',
        isCeramica: isCeramica(name),
      },
    });
  });

  news.slice(0, 8).forEach(n => items.push({ type: 'news', data: n }));

  // Interleave: 2 standings, 1 news, 2 standings, 1 news…
  const mixed = [];
  const sItems = items.filter(i => i.type === 'standing');
  const nItems = items.filter(i => i.type === 'news');
  const max = Math.max(sItems.length, nItems.length);
  for (let i = 0; i < max; i++) {
    if (sItems[i]) mixed.push(sItems[i]);
    if (sItems[i + 1]) mixed.push(sItems[i + 1]);
    if (nItems[i]) mixed.push(nItems[i]);
  }
  return mixed.length ? mixed : [...sItems, ...nItems];
}

/* ── Main Component ──────────────────────────────────────────── */
export default function HeroBottomBar({ latestMatch, nextMatch, news, standings }) {
  const { isArabic } = useLanguage();
  const cd = useCountdown(nextMatch?.date);

  const cdUnits = [
    { value: cd.d, label: isArabic ? 'يوم' : 'Days' },
    { value: cd.h, label: isArabic ? 'س' : 'Hrs' },
    { value: cd.m, label: isArabic ? 'د' : 'Min' },
    { value: cd.s, label: isArabic ? 'ث' : 'Sec' },
  ];

  const hasContent = latestMatch || nextMatch || news.length > 0 || standings.length > 0;
  if (!hasContent) return null;

  return (
    <div className="bg-gradient-to-r from-[#0a1628] via-[#142040] to-[#0a1628] border-t border-b border-white/5 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex flex-col lg:flex-row items-stretch gap-4">

          {/* ── Last Result ────────────────────────────────── */}
          {latestMatch && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="shrink-0"
            >
              <Link
                to={createPageUrl('Matches')}
                className="flex flex-col gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-5 py-4 transition-all group min-w-[230px]"
              >
                <div className="flex items-center gap-1.5 text-xs text-white/40 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {isArabic ? 'آخر نتيجة' : 'Last Result'}
                </div>
                <div className="flex items-center gap-3">
                  {/* Home */}
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                      {latestMatch.home_logo
                        ? <img src={latestMatch.home_logo} alt="" className="w-8 h-8 object-contain" onError={e => { e.target.style.display = 'none'; }} />
                        : <span className="text-white text-xs font-bold">{latestMatch.home_team?.slice(0, 3)}</span>}
                    </div>
                    <span className="text-white/70 text-[10px] text-center leading-tight max-w-[60px] truncate">{latestMatch.home_team}</span>
                  </div>
                  {/* Score */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-black text-white">{latestMatch.home_score}</span>
                      <span className="text-white/30 text-lg">-</span>
                      <span className="text-2xl font-black text-white">{latestMatch.away_score}</span>
                    </div>
                    <span className="text-[#FFB81C] text-[10px] font-bold uppercase mt-0.5">
                      {isArabic ? 'انتهت' : 'FT'}
                    </span>
                  </div>
                  {/* Away */}
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                      {latestMatch.away_logo
                        ? <img src={latestMatch.away_logo} alt="" className="w-8 h-8 object-contain" onError={e => { e.target.style.display = 'none'; }} />
                        : <span className="text-white text-xs font-bold">{latestMatch.away_team?.slice(0, 3)}</span>}
                    </div>
                    <span className="text-white/70 text-[10px] text-center leading-tight max-w-[60px] truncate">{latestMatch.away_team}</span>
                  </div>
                </div>
                <span className="text-white/30 text-[10px] text-center group-hover:text-[#FFB81C] transition-colors">
                  {formatDate(latestMatch.date, isArabic, true)}
                </span>
              </Link>
            </motion.div>
          )}

          {/* Divider */}
          {latestMatch && nextMatch && (
            <div className="hidden lg:block w-px bg-white/10 self-stretch" />
          )}

          {/* ── Next Match + Countdown ─────────────────────── */}
          {nextMatch && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="shrink-0"
            >
              <Link
                to={createPageUrl('Matches')}
                className="flex flex-col gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-5 py-4 transition-all group min-w-[280px]"
              >
                <div className="flex items-center gap-1.5 text-xs text-[#FFB81C] uppercase tracking-widest font-bold">
                  <Calendar className="w-3 h-3" />
                  {isArabic ? 'المباراة القادمة' : 'Next Match'}
                </div>

                {/* Teams row */}
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                      {nextMatch.home_logo
                        ? <img src={nextMatch.home_logo} alt="" className="w-7 h-7 object-contain" onError={e => { e.target.style.display = 'none'; }} />
                        : <span className="text-white text-[10px] font-bold">{nextMatch.home_team?.slice(0, 3)}</span>}
                    </div>
                    <span className="text-white/70 text-[10px] truncate max-w-[60px] text-center">{nextMatch.home_team}</span>
                  </div>
                  <span className="text-white/30 font-black text-sm">{isArabic ? 'ضد' : 'VS'}</span>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                      {nextMatch.away_logo
                        ? <img src={nextMatch.away_logo} alt="" className="w-7 h-7 object-contain" onError={e => { e.target.style.display = 'none'; }} />
                        : <span className="text-white text-[10px] font-bold">{nextMatch.away_team?.slice(0, 3)}</span>}
                    </div>
                    <span className="text-white/70 text-[10px] truncate max-w-[60px] text-center">{nextMatch.away_team}</span>
                  </div>
                </div>

                {/* Countdown */}
                <div className="flex items-end gap-1.5 justify-center">
                  {cdUnits.map((u, i) => (
                    <React.Fragment key={u.label}>
                      <FlipUnit value={u.value} label={u.label} />
                      {i < 3 && <span className="text-white/30 font-black text-lg mb-4">:</span>}
                    </React.Fragment>
                  ))}
                </div>

                {/* Date + venue */}
                <div className="flex items-center justify-between text-[10px] text-white/40">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(nextMatch.date).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {nextMatch.venue && (
                    <span className="flex items-center gap-1 truncate ml-2">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[100px]">{nextMatch.venue}</span>
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          )}

          {/* Divider */}
          {(latestMatch || nextMatch) && (news.length > 0 || standings.length > 0) && (
            <div className="hidden lg:block w-px bg-white/10 self-stretch" />
          )}

          {/* ── News + Standings Slider ─────────────────────── */}
          {(news.length > 0 || standings.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex-1 min-w-0 flex items-center bg-white/5 border border-white/10 rounded-2xl px-5 py-4"
            >
              {/* Label */}
              <div className="shrink-0 mr-4 hidden sm:flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-lg bg-[#FFB81C]/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-[#FFB81C]" />
                </div>
                <span className="text-[9px] text-white/30 uppercase tracking-widest text-center leading-tight">
                  {isArabic ? 'أخبار\nوترتيب' : 'News &\nStandings'}
                </span>
              </div>

              {/* Slider */}
              <NewsStandingsSlider news={news} standings={standings} isArabic={isArabic} />
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
