import React from 'react';
import { Link } from 'react-router-dom';
import { ceramicaCleopatra } from '@/api/ceramicaCleopatraClient';
import { useQuery } from '@tanstack/react-query';
import { ensureArray, createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Flag, Star, AlertCircle, Shield,
  Target, TrendingUp, Award, Calendar, Hash
} from 'lucide-react';
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

export default function PlayerProfile() {
  const { isArabic } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const playerId = urlParams.get('id');

  const { data: players = [], isLoading } = useQuery({
    queryKey: ['player', playerId],
    queryFn: () => ceramicaCleopatra.entities.Player.filter({ id: playerId }),
    select: ensureArray,
    enabled: !!playerId,
  });
  const player = players[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FFB81C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isArabic ? 'اللاعب غير موجود' : 'Player not found'}
          </h2>
          <p className="text-gray-500 mb-6">
            {isArabic ? 'لم يتم العثور على بيانات هذا اللاعب.' : "We couldn't find this player's profile."}
          </p>
          <Link
            to={createPageUrl('Squad')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0a1628] text-white rounded-xl font-semibold hover:bg-[#1e3a5f] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {isArabic ? 'العودة للفريق' : 'Back to Squad'}
          </Link>
        </div>
      </div>
    );
  }

  const stats = player.stats || {};
  const positionLabel = isArabic
    ? positionAr[player.position] || player.position_detail || player.position
    : player.position_detail || player.position;
  const gradientClass = positionColors[player.position] || 'from-gray-500 to-gray-700';
  const isGK = player.position === 'Goalkeeper';

  const baseStatItems = [
    {
      icon: Calendar,
      value: stats.appearances ?? 0,
      label: isArabic ? 'مشاركة' : 'Appearances',
      color: 'text-white',
    },
    {
      icon: Award,
      value: stats.yellow_cards ?? 0,
      label: isArabic ? 'بطاقات صفراء' : 'Yellow',
      color: 'text-yellow-400',
    },
    {
      icon: Shield,
      value: stats.red_cards ?? 0,
      label: isArabic ? 'بطاقات حمراء' : 'Red Cards',
      color: 'text-red-500',
    },
    stats.minutes_played
      ? { icon: Hash, value: stats.minutes_played, label: isArabic ? 'دقائق' : 'Minutes', color: 'text-blue-400' }
      : null,
    stats.rating
      ? { icon: TrendingUp, value: Number(stats.rating).toFixed(1), label: isArabic ? 'التقييم' : 'Rating', color: 'text-[#FFB81C]' }
      : null,
  ].filter(Boolean);

  const positionStatItems = isGK
    ? [
        { icon: Shield,    value: stats.clean_sheets ?? 0,                   label: isArabic ? 'مرمى نظيف' : 'Clean Sheets', color: 'text-teal-400' },
        { icon: TrendingUp, value: stats.save_percentage != null ? `${Number(stats.save_percentage).toFixed(1)}%` : '—', label: isArabic ? 'نسبة التصدي' : 'Save %', color: 'text-green-400' },
      ]
    : [
        { icon: Target,    value: stats.goals ?? 0,   label: isArabic ? 'أهداف' : 'Goals',    color: 'text-[#FFB81C]' },
        { icon: TrendingUp, value: stats.assists ?? 0, label: isArabic ? 'تمريرات' : 'Assists', color: 'text-green-400' },
      ];

  const statItems = [...positionStatItems, ...baseStatItems];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0a1628] via-[#1e3a5f] to-[#0a1628] overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-32 h-32 border border-white rounded-full"
              style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, transform: 'translate(-50%,-50%)' }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16">
          {/* Back button */}
          <Link
            to={createPageUrl('Squad')}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {isArabic ? 'العودة للفريق' : 'Back to Squad'}
          </Link>

          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-10">
            {/* Player Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative flex-shrink-0"
            >
              <div className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-2xl">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-30`} />
                <img
                  src={player.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&size=400&background=1e3a5f&color=fff&bold=true`}
                  alt={player.name}
                  className="w-full h-full object-cover object-top"
                  onError={e => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&size=400&background=1e3a5f&color=fff&bold=true`;
                  }}
                />
                {/* Jersey number overlay */}
                <div className="absolute top-4 right-4 text-6xl font-black text-white/20 leading-none">
                  {player.number}
                </div>
              </div>

              {/* Status badges */}
              <div className="absolute -bottom-3 left-0 right-0 flex justify-center gap-2">
                {player.is_captain && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-[#FFB81C] text-[#0a1628] text-xs font-black rounded-full shadow-lg">
                    <Star className="w-3 h-3" />
                    {isArabic ? 'القائد' : 'Captain'}
                  </span>
                )}
                {player.status === 'injured' && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs font-black rounded-full shadow-lg">
                    <AlertCircle className="w-3 h-3" />
                    {isArabic ? 'مصاب' : 'Injured'}
                  </span>
                )}
                {player.status === 'suspended' && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-[#0a1628] text-xs font-black rounded-full shadow-lg">
                    <AlertCircle className="w-3 h-3" />
                    {isArabic ? 'موقوف' : 'Suspended'}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Player Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 pb-6"
            >
              {/* Position badge */}
              <div className={`inline-block px-4 py-1.5 rounded-full bg-gradient-to-r ${gradientClass} text-white text-sm font-bold mb-4`}>
                {positionLabel}
              </div>

              {/* Name + Number */}
              <div className="flex items-baseline gap-4 mb-3">
                <h1 className="text-4xl md:text-6xl font-black text-white leading-none">
                  {player.name}
                </h1>
                {player.number && (
                  <span className="text-5xl font-black text-[#FFB81C]/60 leading-none">
                    #{player.number}
                  </span>
                )}
              </div>

              {/* Info row */}
              <div className="flex flex-wrap items-center gap-6 text-white/60">
                {player.nationality && (
                  <span className="flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    {player.nationality}
                  </span>
                )}
                {player.age && (
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {isArabic ? `${player.age} سنة` : `${player.age} years`}
                  </span>
                )}
                {player.height && (
                  <span className="flex items-center gap-2 text-sm">
                    {isArabic ? `الطول: ${player.height}` : `Height: ${player.height}`}
                  </span>
                )}
                {player.weight && (
                  <span className="flex items-center gap-2 text-sm">
                    {isArabic ? `الوزن: ${player.weight}` : `Weight: ${player.weight}`}
                  </span>
                )}
              </div>

              {/* Club badge */}
              <div className="flex items-center gap-3 mt-6">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695e73c9350940eda2779d4d/62a3057fb_Ceramica_Cleopatra_FC_logo.png"
                  alt="Ceramica Cleopatra FC"
                  className="h-10 w-auto"
                />
                <div>
                  <div className="text-white font-bold text-sm">
                    {isArabic ? 'سيراميكا كليوباترا' : 'Ceramica Cleopatra FC'}
                  </div>
                  <div className="text-white/40 text-xs">
                    {isArabic ? 'الدوري المصري الممتاز' : 'Egyptian Premier League'}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-black text-[#0a1628] mb-8 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-[#FFB81C] rounded-full" />
            {isArabic ? 'إحصائيات الموسم' : 'Season Statistics'}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {statItems.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                className="bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] rounded-2xl p-5 text-center"
              >
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <div className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.value}</div>
                <div className="text-white/50 text-xs">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bio Section */}
      {(player.bio || player.description) && (
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-[#0a1628] mb-6 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-[#0a1628] rounded-full" />
              {isArabic ? 'نبذة عن اللاعب' : 'Player Bio'}
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {player.bio || player.description}
            </p>
          </div>
        </section>
      )}

      {/* Details Card */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">

            {/* Personal Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="text-lg font-black text-[#0a1628] mb-5 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#FFB81C]" />
                {isArabic ? 'المعلومات الشخصية' : 'Personal Info'}
              </h3>
              <dl className="space-y-4">
                {[
                  { label: isArabic ? 'الاسم الكامل' : 'Full Name',   value: player.name },
                  { label: isArabic ? 'رقم القميص' : 'Jersey Number', value: player.number ? `#${player.number}` : '—' },
                  { label: isArabic ? 'المركز' : 'Position',           value: positionLabel },
                  { label: isArabic ? 'الجنسية' : 'Nationality',       value: player.nationality || '—' },
                  { label: isArabic ? 'تاريخ الميلاد' : 'Date of Birth', value: player.date_of_birth ? new Date(player.date_of_birth).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                  { label: isArabic ? 'الطول' : 'Height',               value: player.height || '—' },
                  { label: isArabic ? 'الوزن' : 'Weight',               value: player.weight || '—' },
                  { label: isArabic ? 'القدم المفضلة' : 'Preferred Foot', value: player.preferred_foot ? (isArabic ? (player.preferred_foot === 'Right' ? 'يمين' : 'يسار') : player.preferred_foot) : null },
                  { label: isArabic ? 'القيمة السوقية' : 'Market Value',   value: stats.market_value || null },
                  { label: isArabic ? 'انتهاء العقد' : 'Contract',          value: stats.contract_expires ? stats.contract_expires.replace('Contract expires: ', '') : null },
                  { label: isArabic ? 'موسم الإحصائيات' : 'Stats Season',   value: stats.stats_season || null },
                ].map(({ label, value }) => value && value !== '—' ? (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <dt className="text-gray-500 text-sm">{label}</dt>
                    <dd className="font-semibold text-[#0a1628] text-sm">{value}</dd>
                  </div>
                ) : null)}
              </dl>
            </motion.div>

            {/* Contract & Club Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] rounded-2xl p-6 text-white"
            >
              <h3 className="text-lg font-black mb-5 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#FFB81C]" />
                {isArabic ? 'معلومات النادي' : 'Club Info'}
              </h3>

              {/* Position Visual */}
              <div className={`w-full rounded-xl bg-gradient-to-r ${gradientClass} p-6 mb-6 text-center`}>
                <div className="text-6xl font-black text-white/30 mb-2">{player.number || '—'}</div>
                <div className="text-white font-black text-xl">{positionLabel}</div>
                <div className="text-white/60 text-sm mt-1">
                  {player.position_detail || (isArabic ? 'سيراميكا كليوباترا' : 'Ceramica Cleopatra FC')}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">{isArabic ? 'الحالة' : 'Status'}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    player.status === 'available'  ? 'bg-green-500/20 text-green-400' :
                    player.status === 'injured'    ? 'bg-red-500/20 text-red-400' :
                    player.status === 'suspended'  ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {player.status === 'available'  ? (isArabic ? 'متاح' : 'Available') :
                     player.status === 'injured'    ? (isArabic ? 'مصاب' : 'Injured') :
                     player.status === 'suspended'  ? (isArabic ? 'موقوف' : 'Suspended') :
                     player.status || '—'}
                  </span>
                </div>
                {player.is_captain && (
                  <div className="flex items-center gap-2 bg-[#FFB81C]/10 border border-[#FFB81C]/20 rounded-xl p-3">
                    <Star className="w-4 h-4 text-[#FFB81C]" />
                    <span className="text-[#FFB81C] font-semibold text-sm">
                      {isArabic ? 'قائد الفريق' : 'Team Captain'}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Back to Squad CTA */}
      <section className="py-10 px-4 bg-gradient-to-br from-[#0a1628] to-[#1e3a5f]">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-white font-black text-xl">
            {isArabic ? 'تعرف على بقية اللاعبين' : 'Explore the Full Squad'}
          </h3>
          <Link
            to={createPageUrl('Squad')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFB81C] text-[#0a1628] rounded-xl font-bold hover:bg-yellow-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {isArabic ? 'الفريق الكامل' : 'Full Squad'}
          </Link>
        </div>
      </section>
    </div>
  );
}
