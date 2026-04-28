import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageContext';
import { Trophy, Newspaper, Star, Zap } from 'lucide-react';

/* ── Continuous Marquee Ticker ───────────────────────────────── */
function TickerItem({ item, isArabic }) {
  const ceramicaNames = ['ceramica', 'cleopatra', 'سيراميكا', 'كليوباترا'];
  const isCeramica = item.type === 'standing' &&
    ceramicaNames.some(k => String(item.data.name || '').toLowerCase().includes(k));

  if (item.type === 'news') {
    return (
      <Link
        to={createPageUrl('NewsDetail') + `?id=${item.data.id}`}
        className="flex items-center gap-2.5 group shrink-0 px-5"
      >
        <div className="shrink-0 w-5 h-5 rounded bg-[#FFB81C]/30 flex items-center justify-center">
          <Newspaper className="w-3 h-3 text-[#FFB81C]" />
        </div>
        <span className="text-[#FFB81C] text-xs font-black uppercase tracking-widest shrink-0">
          {isArabic ? 'خبر' : 'NEWS'}
        </span>
        <span className="w-px h-3 bg-white/20 shrink-0" />
        <span className="text-white text-sm whitespace-nowrap group-hover:text-[#FFB81C] transition-colors">
          {item.data.title}
        </span>
      </Link>
    );
  }

  return (
    <Link
      to={createPageUrl('Standings')}
      className="flex items-center gap-2.5 group shrink-0 px-5"
    >
      <div className="shrink-0 w-5 h-5 rounded bg-yellow-500/20 flex items-center justify-center">
        <Trophy className="w-3 h-3 text-[#FFB81C]" />
      </div>
      <span className={`text-xs font-black uppercase tracking-widest shrink-0 ${isCeramica ? 'text-[#FFB81C]' : 'text-white/50'}`}>
        #{item.data.rank}
      </span>
      {item.data.logo && (
        <img
          src={item.data.logo}
          alt=""
          className="w-5 h-5 object-contain shrink-0"
          onError={e => { e.target.style.display = 'none'; }}
        />
      )}
      <span className={`text-sm whitespace-nowrap font-medium ${isCeramica ? 'text-[#FFB81C] font-black' : 'text-white group-hover:text-[#FFB81C]'} transition-colors`}>
        {isCeramica && '★ '}{item.data.name}
      </span>
      <span className="w-px h-3 bg-white/20 shrink-0" />
      <span className="text-white/40 text-xs shrink-0 whitespace-nowrap">
        {item.data.played ?? '—'} {isArabic ? 'ل' : 'P'}
      </span>
      <span className="text-[#FFB81C] font-black text-sm shrink-0 whitespace-nowrap">
        {item.data.points ?? '—'} {isArabic ? 'ن' : 'pts'}
      </span>
    </Link>
  );
}

function NewsStandingsTicker({ news, standings, isArabic }) {
  const items = buildSliderItems(news, standings, isArabic);
  const trackRef = useRef(null);
  const [duration, setDuration] = useState(40);

  useEffect(() => {
    if (trackRef.current) {
      // Speed: ~80px per second
      const width = trackRef.current.scrollWidth / 2;
      setDuration(Math.max(20, width / 80));
    }
  }, [items.length]);

  if (!items.length) return null;

  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="flex-1 min-w-0 overflow-hidden relative">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0a1628] to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0a1628] to-transparent z-10 pointer-events-none" />

      <motion.div
        ref={trackRef}
        className="flex items-center"
        animate={{ x: [0, -(trackRef.current?.scrollWidth ?? 2000) / 2] }}
        transition={{
          x: { duration, ease: 'linear', repeat: Infinity, repeatType: 'loop' },
        }}
        style={{ willChange: 'transform' }}
      >
        {doubled.map((item, i) => (
          <React.Fragment key={i}>
            <TickerItem item={item} isArabic={isArabic} />
            {/* Yellow diamond separator */}
            <span className="text-[#FFB81C] text-xs shrink-0 opacity-60">◆</span>
          </React.Fragment>
        ))}
      </motion.div>
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

/* ── Main Component — ticker only ───────────────────────────── */
export default function HeroBottomBar({ news, standings }) {
  const { isArabic } = useLanguage();

  if (news.length === 0 && standings.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-[#0a1628] via-[#142040] to-[#0a1628] border-t border-b border-white/5 shadow-xl">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-hidden"
        >
          {/* Yellow label bar */}
          <div className="flex items-center">
            <div className="shrink-0 flex items-center gap-2 bg-[#FFB81C] px-5 h-full py-4">
              <Zap className="w-4 h-4 text-[#0a1628]" />
              <span className="text-[#0a1628] text-xs font-black uppercase tracking-widest whitespace-nowrap">
                {isArabic ? 'أخبار وترتيب' : 'News & Standings'}
              </span>
            </div>
            {/* Ticker track */}
            <div className="flex-1 min-w-0 bg-[#0a1628]/60 py-4">
              <NewsStandingsTicker news={news} standings={standings} isArabic={isArabic} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
