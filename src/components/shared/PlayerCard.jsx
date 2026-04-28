import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Flag, Star, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

const positionColors = {
  Goalkeeper: 'from-yellow-500 to-yellow-600',
  Defender:   'from-blue-500 to-blue-600',
  Midfielder: 'from-green-500 to-green-600',
  Forward:    'from-red-500 to-red-600',
};

const positionAr = {
  Goalkeeper: 'حارس مرمى',
  Defender:   'مدافع',
  Midfielder: 'لاعب وسط',
  Forward:    'مهاجم',
};

function StatPill({ value, label, highlight }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-xl font-black tabular-nums ${highlight ? 'text-[#d4af37]' : 'text-white'}`}>
        {value ?? 0}
      </span>
      <span className="text-[10px] text-white/40 mt-0.5">{label}</span>
    </div>
  );
}

export default function PlayerCard({ player, index = 0 }) {
  const { isArabic } = useLanguage();
  const s = player.stats || {};
  const isGK = player.position === 'Goalkeeper';

  const statsRow = isGK
    ? [
        { value: s.appearances, label: isArabic ? 'مباراة' : 'Apps',   highlight: false },
        { value: s.clean_sheets ?? 0, label: isArabic ? 'نظيف' : 'CS', highlight: true },
        { value: s.yellow_cards ?? 0, label: isArabic ? 'ص' : 'YC',    highlight: false },
      ]
    : [
        { value: s.appearances, label: isArabic ? 'مباراة' : 'Apps',     highlight: false },
        { value: s.goals,       label: isArabic ? 'أهداف' : 'Goals',     highlight: true },
        { value: s.assists,     label: isArabic ? 'تمريرات' : 'Assists', highlight: false },
      ];

  const hasRealStats = (s.appearances ?? 0) > 0 || (s.goals ?? 0) > 0 || (s.clean_sheets ?? 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={createPageUrl('PlayerProfile') + `?id=${player.id}`} className="block group">
        <div className="relative bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] rounded-2xl overflow-hidden border border-white/5 group-hover:border-[#d4af37]/30 transition-colors">

          {/* Photo */}
          <div className="relative h-64 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent z-10" />
            <img
              src={player.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&size=400&background=1e3a5f&color=fff`}
              alt={player.name}
              className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
              onError={e => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&size=400&background=1e3a5f&color=fff`;
              }}
            />

            {/* Number */}
            <div className="absolute top-4 right-4 z-20">
              <span className="text-5xl font-black text-white/20 group-hover:text-[#d4af37]/30 transition-colors">
                {player.number}
              </span>
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
              {player.is_captain && (
                <span className="flex items-center gap-1 px-2 py-1 bg-[#d4af37] text-[#0a1628] text-xs font-black rounded-lg shadow">
                  <Star className="w-3 h-3" /> {isArabic ? 'القائد' : 'Captain'}
                </span>
              )}
              {player.status === 'injured' && (
                <span className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow">
                  <AlertCircle className="w-3 h-3" /> {isArabic ? 'مصاب' : 'Injured'}
                </span>
              )}
              {player.status === 'suspended' && (
                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-[#0a1628] text-xs font-bold rounded-lg shadow">
                  <AlertCircle className="w-3 h-3" /> {isArabic ? 'موقوف' : 'Susp.'}
                </span>
              )}
            </div>

            {/* Rating chip */}
            {s.rating && parseFloat(s.rating) > 0 && (
              <div className="absolute bottom-3 right-4 z-20">
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                  parseFloat(s.rating) >= 7 ? 'bg-green-500 text-white' :
                  parseFloat(s.rating) >= 6 ? 'bg-yellow-500 text-[#0a1628]' :
                  'bg-red-500/80 text-white'
                }`}>
                  {Number(s.rating).toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="relative z-10 p-5 -mt-8">
            {/* Position pill */}
            <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${positionColors[player.position] || 'from-gray-500 to-gray-600'} text-white text-xs font-bold mb-3`}>
              {isArabic
                ? positionAr[player.position] || player.position_detail || player.position
                : player.position_detail || player.position}
            </div>

            <h3 className="text-xl font-bold text-white group-hover:text-[#d4af37] transition-colors leading-tight">
              {player.name}
            </h3>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1.5 text-white/50 text-sm">
                <Flag className="w-3 h-3" />
                <span>{player.nationality || (isArabic ? 'مصر' : 'Egypt')}</span>
              </div>
              {s.market_value && (
                <span className="text-[10px] text-[#d4af37]/70 font-bold">{s.market_value}</span>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
              {statsRow.map(stat => (
                <StatPill key={stat.label} {...stat} />
              ))}
            </div>

            {/* Season tag or "stats pending" */}
            <div className="mt-3 text-center">
              {hasRealStats ? (
                <span className="text-[9px] text-white/25 uppercase tracking-widest">
                  {s.stats_season || '2025-2026'}
                </span>
              ) : (
                <span className="text-[9px] text-white/20 italic">
                  {isArabic ? 'في انتظار تحديث الإحصائيات' : 'Awaiting stats sync'}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
