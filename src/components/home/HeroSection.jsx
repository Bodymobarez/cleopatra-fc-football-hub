import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight, Calendar, MapPin, Clock, Trophy, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';

export default function HeroSection({ latestMatch, nextMatch }) {
  const { t, isArabic } = useLanguage();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    if (!nextMatch?.date) return;
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const matchDate = new Date(nextMatch.date).getTime();
      const diff = matchDate - now;

      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextMatch]);

  return (
    <section className="relative min-h-[85vh] bg-gradient-to-br from-[#1B2852] via-[#C8102E] to-[#1B2852] overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1920')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B2852] via-transparent to-transparent" />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full border border-[#FFB81C]/10"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full border border-white/5"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Club Info & Latest Result */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="inline-flex items-center gap-2 bg-[#FFB81C]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#FFB81C]/30"
              >
                <Trophy className="w-4 h-4 text-[#FFB81C]" />
                <span className="text-[#FFB81C] text-sm font-medium">{isArabic ? 'الدوري المصري الممتاز' : 'Egyptian Premier League'}</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl font-black text-white leading-none">
                CERAMICA
                <span className="block text-[#FFB81C]">CLEOPATRA</span>
                <span className="block text-2xl md:text-3xl font-light text-white/60 mt-2">FOOTBALL CLUB</span>
              </h1>
            </div>

            {/* Latest Match Result */}
            {latestMatch && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
              >
                <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Latest Result
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
                      {latestMatch.home_logo ? (
                        <img src={latestMatch.home_logo} alt="" className="w-10 h-10 object-contain" />
                      ) : (
                        <span className="text-white font-bold text-sm">{latestMatch.home_team?.slice(0, 3)}</span>
                      )}
                    </div>
                    <span className="text-white font-medium hidden sm:block">{latestMatch.home_team}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-black text-white">{latestMatch.home_score}</span>
                    <span className="text-white/40">-</span>
                    <span className="text-4xl font-black text-white">{latestMatch.away_score}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white font-medium hidden sm:block">{latestMatch.away_team}</span>
                    <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
                      {latestMatch.away_logo ? (
                        <img src={latestMatch.away_logo} alt="" className="w-10 h-10 object-contain" />
                      ) : (
                        <span className="text-white font-bold text-sm">{latestMatch.away_team?.slice(0, 3)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <Link 
                  to={createPageUrl('MatchDetails') + `?id=${latestMatch.id}`}
                  className="flex items-center gap-2 text-[#FFB81C] text-sm mt-4 hover:gap-3 transition-all"
                >
                  View Match Details <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            )}

            <div className="flex flex-wrap gap-4">
              <Link 
                to={createPageUrl('Squad')}
                className="px-8 py-4 bg-[#FFB81C] text-[#1B2852] font-bold rounded-xl hover:bg-[#f5a815] transition-all hover:scale-105 shadow-lg shadow-[#FFB81C]/25"
              >
                {isArabic ? 'عرض الفريق' : 'View Squad'}
              </Link>
              <Link 
                to={createPageUrl('News')}
                className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 backdrop-blur-sm"
              >
                Latest News
              </Link>
            </div>
          </motion.div>

          {/* Right - Next Fixture Countdown */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:pl-12"
          >
            {nextMatch && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
                <div className="bg-[#FFB81C] px-6 py-3">
                  <span className="text-[#1B2852] font-bold text-sm uppercase tracking-wider">{isArabic ? 'المباراة القادمة' : 'Next Match'}</span>
                </div>
                <div className="p-8 space-y-8">
                  {/* Teams */}
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <div className="w-20 h-20 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-3">
                        {nextMatch.home_logo ? (
                          <img src={nextMatch.home_logo} alt="" className="w-14 h-14 object-contain" />
                        ) : (
                          <span className="text-white font-bold text-lg">{nextMatch.home_team?.slice(0, 3)}</span>
                        )}
                      </div>
                      <span className="text-white font-semibold">{nextMatch.home_team}</span>
                    </div>
                    <div className="px-6">
                      <span className="text-4xl font-black text-white/30">VS</span>
                    </div>
                    <div className="text-center flex-1">
                      <div className="w-20 h-20 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-3">
                        {nextMatch.away_logo ? (
                          <img src={nextMatch.away_logo} alt="" className="w-14 h-14 object-contain" />
                        ) : (
                          <span className="text-white font-bold text-lg">{nextMatch.away_team?.slice(0, 3)}</span>
                        )}
                      </div>
                      <span className="text-white font-semibold">{nextMatch.away_team}</span>
                    </div>
                  </div>

                  {/* Countdown */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { value: countdown.days,  label: isArabic ? 'يوم' : 'Days' },
                      { value: countdown.hours, label: isArabic ? 'ساعة' : 'Hours' },
                      { value: countdown.mins,  label: isArabic ? 'دقيقة' : 'Mins' },
                      { value: countdown.secs,  label: isArabic ? 'ثانية' : 'Secs' }
                    ].map((item, i) => (
                      <motion.div 
                      key={item.label}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                      className="bg-[#1B2852]/50 rounded-xl p-4 text-center"
                      >
                        <span className="text-3xl font-black text-white">{String(item.value).padStart(2, '0')}</span>
                        <span className="block text-xs text-white/50 mt-1">{item.label}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Match Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-white/70">
                      <Calendar className="w-4 h-4 text-[#FFB81C]" />
                      <span className="text-sm">
                        {new Date(nextMatch.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70">
                      <Clock className="w-4 h-4 text-[#FFB81C]" />
                      <span className="text-sm">
                        {new Date(nextMatch.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {nextMatch.venue && (
                      <div className="flex items-center gap-3 text-white/70">
                        <MapPin className="w-4 h-4 text-[#FFB81C]" />
                        <span className="text-sm">{nextMatch.venue}</span>
                      </div>
                    )}
                  </div>

                  <Link 
                    to={createPageUrl('Matches')}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
                  >
                    <Calendar className="w-5 h-5" />
                    {isArabic ? 'جميع المباريات' : 'View All Fixtures'}
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}